from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, StudentProfile, AuditLog
from ..schemas import UserRegister, UserLogin, UserOut
from ..auth import (
    normalize_email,
    validate_password_strength,
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, response: Response, db: Session = Depends(get_db)):
    # 1. Normalize and validate email
    email_clean = normalize_email(user_in.email)

    # 2. Prevent duplicate registrations
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered."
        )

    # 3. Validate password matching
    if user_in.password != user_in.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and confirm password do not match."
        )

    # 4. Enforce reasonable password policy
    if not validate_password_strength(user_in.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long and contain both letters and numbers/symbols."
        )

    # 5. Prevent public admin registration
    role_clean = user_in.role.lower().strip()
    if role_clean == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration as placement administrator is strictly prohibited."
        )

    # 6. Hash password with Argon2id
    hashed_pwd = hash_password(user_in.password)

    # 7. Create User and StudentProfile if student
    new_user = User(
        email=email_clean,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name.strip(),
        role=role_clean,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if role_clean == "student":
        profile = StudentProfile(
            user_id=new_user.id,
            is_onboarded=False,
            cgpa_scale=10.0,
            backlogs=0,
            skills=[],
            projects=[],
            experience=[],
            preferred_roles=[],
            preferred_industries=[],
            preferred_locations=[],
            preferred_skills=[],
            work_arrangement="any",
            employment_type="both",
            consent_job_alerts=True,
            consent_recruiter_sharing=False, # Default false until onboarding
            consent_matching=True
        )
        db.add(profile)
        db.commit()

    # Log registration in audit log
    audit = AuditLog(
        actor_id=new_user.id,
        actor_name=new_user.full_name,
        action=f"User Registered ({role_clean})",
        details=f"New account created for {email_clean} with Argon2id password hashing.",
        level="INFO"
    )
    db.add(audit)
    db.commit()

    # 8. Create session token and set HTTP-only cookie
    token = create_access_token({"sub": str(new_user.id), "role": new_user.role, "email": new_user.email})
    response.set_cookie(
        key="campusmatch_session",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False, # Set True in production HTTPS
        max_age=86400
    )

    return {
        "message": "Registration successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role,
            "is_onboarded": False if role_clean == "student" else True
        }
    }

@router.post("/login")
def login(login_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    email_clean = normalize_email(login_data.email)
    user = db.query(User).filter(User.email == email_clean).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or disabled."
        )

    is_onboarded = True
    if user.role == "student":
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        is_onboarded = profile.is_onboarded if profile else False

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    response.set_cookie(
        key="campusmatch_session",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=86400
    )

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_onboarded": is_onboarded
        }
    }

@router.post("/logout")
def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie(key="campusmatch_session")
    return {"message": "Successfully logged out"}

@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    is_onboarded = True
    if current_user.role == "student":
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        is_onboarded = profile.is_onboarded if profile else False

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "is_onboarded": is_onboarded
    }
