from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, StudentProfile, Job, Notification, AuditLog
from ..schemas import (
    StudentProfileOut,
    StudentProfileUpdate,
    ProfileCompletionOut,
    ConsentUpdate,
    MatchResultOut,
    ResumeExtractionResult,
    ResumeConfirmPayload
)
from ..auth import get_current_student
from ..matching import calculate_profile_completion, evaluate_job_match
from ..resume_service import process_resume_upload

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
        "certifications": getattr(profile, "certifications", []) or [],
        "resume_filename": getattr(profile, "resume_filename", None),
        "resume_uploaded_at": getattr(profile, "resume_uploaded_at", None),
        "resume_extraction_metadata": getattr(profile, "resume_extraction_metadata", {}) or {},
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

@router.post("/resume/upload", response_model=ResumeExtractionResult)
async def upload_and_extract_resume(
    file: UploadFile = File(...),
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    try:
        file_bytes = await file.read()
        filename = file.filename or "resume.pdf"
        result = process_resume_upload(
            file_bytes=file_bytes,
            filename=filename,
            content_type=file.content_type,
            user_email=current_student.email
        )

        audit = AuditLog(
            actor_id=current_student.id,
            actor_name=current_student.full_name,
            action="Resume Extracted",
            details=f"Extracted {len(result.skills)} skills and {len(result.projects)} projects from '{filename}' via {result.extractor}",
            level="INFO"
        )
        db.add(audit)
        db.commit()

        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to process resume: {str(e)}")

@router.post("/resume/confirm", response_model=StudentProfileOut)
def confirm_and_apply_resume_profile(
    payload: ResumeConfirmPayload,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_student.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_student.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    p_data = payload.profile_data
    overwrite = payload.overwrite_existing

    # Scalar fields
    scalar_fields = [
        "phone", "current_city", "college", "degree", "branch",
        "academic_year", "graduation_year", "cgpa", "cgpa_scale"
    ]

    for field in scalar_fields:
        if field in p_data and p_data[field] is not None:
            current_val = getattr(profile, field, None)
            if overwrite or current_val is None or current_val == "" or (field == "cgpa" and current_val == 0.0):
                setattr(profile, field, p_data[field])

    # Preferred locations
    if "preferred_locations" in p_data and p_data["preferred_locations"]:
        existing_locs = list(profile.preferred_locations or [])
        for loc in p_data["preferred_locations"]:
            if loc and loc not in existing_locs:
                existing_locs.append(loc)
        profile.preferred_locations = existing_locs

    # Skills: deduplicated merge
    if "skills" in p_data and p_data["skills"]:
        existing_skills = list(profile.skills or [])
        for s in p_data["skills"]:
            if s and s not in existing_skills:
                existing_skills.append(s)
        profile.skills = existing_skills

    # Projects: deduplicated by normalized title
    if "projects" in p_data and p_data["projects"]:
        existing_projects = list(profile.projects or [])
        existing_titles = {p.get("title", "").strip().lower() for p in existing_projects}
        for proj in p_data["projects"]:
            title_norm = proj.get("title", "").strip().lower()
            if title_norm and title_norm not in existing_titles:
                existing_projects.append(proj)
                existing_titles.add(title_norm)
        profile.projects = existing_projects

    # Experience: deduplicated by normalized title and organization
    if "experience" in p_data and p_data["experience"]:
        existing_exp = list(profile.experience or [])
        existing_keys = {(e.get("title", "").strip().lower(), e.get("organization", "").strip().lower()) for e in existing_exp}
        for exp in p_data["experience"]:
            key = (exp.get("title", "").strip().lower(), exp.get("organization", "").strip().lower())
            if key not in existing_keys:
                existing_exp.append(exp)
                existing_keys.add(key)
        profile.experience = existing_exp

    # Certifications
    if "certifications" in p_data and p_data["certifications"]:
        existing_certs = list(getattr(profile, "certifications", []) or [])
        for cert in p_data["certifications"]:
            if cert and cert not in existing_certs:
                existing_certs.append(cert)
        profile.certifications = existing_certs

    # Resume Tracking Metadata
    if "resume_filename" in p_data:
        profile.resume_filename = p_data["resume_filename"]
    profile.resume_uploaded_at = datetime.now(timezone.utc)
    if "extraction_metadata" in p_data:
        profile.resume_extraction_metadata = p_data["extraction_metadata"]

    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)

    audit = AuditLog(
        actor_id=current_student.id,
        actor_name=current_student.full_name,
        action="Profile Updated via Resume Intelligence",
        details=f"Applied resume profile data (overwrite={overwrite}). Total skills: {len(profile.skills)}, Total projects: {len(profile.projects)}.",
        level="INFO"
    )
    db.add(audit)
    db.commit()

    return get_my_profile(current_student, db)
