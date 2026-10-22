from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, StudentProfile, Job, Notification, AuditLog
from ..schemas import (
    StudentProfileOut,
    StudentProfileUpdate,
    ProfileCompletionOut,
    ConsentUpdate,
    MatchResultOut
)
from ..auth import get_current_student
from ..matching import calculate_profile_completion, evaluate_job_match

router = APIRouter(prefix="/api/v1/students", tags=["Student Profile"])

@router.get("/me", response_model=StudentProfileOut)
def get_my_profile(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_student.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Attach user fields
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "full_name": current_student.full_name,
        "email": current_student.email,
        "phone": profile.phone,
        "current_city": profile.current_city,
        "preferred_locations": profile.preferred_locations or [],
        "college": profile.college,
        "degree": profile.degree,
        "branch": profile.branch,
        "academic_year": profile.academic_year,
        "graduation_year": profile.graduation_year,
        "cgpa": profile.cgpa,
        "cgpa_scale": profile.cgpa_scale or 10.0,
        "backlogs": profile.backlogs or 0,
        "skills": profile.skills or [],
        "projects": profile.projects or [],
        "experience": profile.experience or [],
        "preferred_roles": profile.preferred_roles or [],
        "preferred_industries": profile.preferred_industries or [],
        "work_arrangement": profile.work_arrangement or "any",
        "employment_type": profile.employment_type or "both",
        "min_salary_expectation": profile.min_salary_expectation,
        "preferred_skills": profile.preferred_skills or [],
        "job_alert_emails": profile.job_alert_emails,
        "consent_job_alerts": profile.consent_job_alerts,
        "consent_recruiter_sharing": profile.consent_recruiter_sharing,
        "consent_matching": profile.consent_matching,
        "consent_updated_at": profile.consent_updated_at or datetime.now(timezone.utc),
        "is_onboarded": profile.is_onboarded
    }

@router.put("/me", response_model=StudentProfileOut)
def update_my_profile(
    update_data: StudentProfileUpdate,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_student.id)
        db.add(profile)

    update_dict = update_data.model_dump(exclude_unset=True)

    # If updating consent fields, update timestamp
    consent_keys = ["consent_job_alerts", "consent_recruiter_sharing", "consent_matching"]
    if any(k in update_dict for k in consent_keys):
        profile.consent_updated_at = datetime.now(timezone.utc)

    for field, value in update_dict.items():
        setattr(profile, field, value)

    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)

    # Check and generate matching notifications if student has opted in
    if profile.consent_job_alerts and profile.skills:
        jobs = db.query(Job).filter(Job.is_active == True).all()
        for j in jobs:
            match = evaluate_job_match(profile, j)
            if match["relevance_score"] >= 80 and match["is_eligible"]:
                idemp_key = f"NOTIF-{current_student.id}-{j.id}-V1"
                existing = db.query(Notification).filter(Notification.idempotency_key == idemp_key).first()
                if not existing:
                    notif = Notification(
                        user_id=current_student.id,
                        job_id=j.id,
                        type="Opportunity Match",
                        subject=f"New High Match ({match['relevance_score']}%): {j.company or 'New Opening'} {j.title}",
                        body=f"Your verified profile has a {match['relevance_score']}% alignment with {j.title}. Matches: {', '.join(match['matching_required'][:3])}.",
                        idempotency_key=idemp_key,
                        status="delivered"
                    )
                    db.add(notif)
        db.commit()

    return get_my_profile(current_student, db)

@router.get("/me/completion", response_model=ProfileCompletionOut)
def get_completion_status(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        return {
            "completion_percentage": 0,
            "completed_fields": [],
            "missing_fields": ["college", "degree", "branch", "graduation_year", "cgpa", "skills", "projects"],
            "can_match": False
        }
    return calculate_profile_completion(profile)

@router.get("/me/matches", response_model=List[MatchResultOut])
def get_personalized_matches(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        return []

    jobs = db.query(Job).all()
    results = []

    for job in jobs:
        analysis = evaluate_job_match(profile, job)
        results.append(analysis)

    # Sort: Eligible first, then highest relevance score
    results.sort(
        key=lambda x: (
            1 if x["is_eligible"] else 0,
            x["relevance_score"]
        ),
        reverse=True
    )

    return results

@router.patch("/me/consent", response_model=StudentProfileOut)
def update_consent(
    consent_data: ConsentUpdate,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    if consent_data.consent_job_alerts is not None:
        profile.consent_job_alerts = consent_data.consent_job_alerts
    if consent_data.consent_recruiter_sharing is not None:
        profile.consent_recruiter_sharing = consent_data.consent_recruiter_sharing
    if consent_data.consent_matching is not None:
        profile.consent_matching = consent_data.consent_matching

    profile.consent_updated_at = datetime.now(timezone.utc)
    db.commit()

    # Log consent change in audit log
    audit = AuditLog(
        actor_id=current_student.id,
        actor_name=current_student.full_name,
        action="Consent Settings Updated",
        details=f"Recruiter sharing: {profile.consent_recruiter_sharing}, Matching: {profile.consent_matching}, Job alerts: {profile.consent_job_alerts}",
        level="SECURITY"
    )
    db.add(audit)
    db.commit()

    return get_my_profile(current_student, db)

@router.get("/me/notifications")
def get_student_notifications(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(Notification.user_id == current_student.id).order_by(Notification.created_at.desc()).all()
    return notifs
