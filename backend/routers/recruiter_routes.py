from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, StudentProfile, Job, AuditLog
from ..auth import get_current_recruiter, get_current_admin
from ..matching import evaluate_job_match

router = APIRouter(prefix="/api/v1/recruiter", tags=["Recruiter Operations"])

@router.get("/candidates")
def get_shortlist_candidates(
    job_id: Optional[str] = None,
    current_recruiter: User = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    # Retrieve active students
    students = db.query(User).filter(User.role == "student", User.is_active == True).all()
    selected_job = db.query(Job).filter(Job.id == job_id).first() if job_id else None

    results = []
    for s in students:
        profile = s.student_profile
        if not profile:
            continue

        # Check consent directive
        consent_approved = bool(profile.consent_recruiter_sharing)

        # Match evaluation if job provided
        analysis = evaluate_job_match(profile, selected_job) if selected_job else None

        # Redact private PII if consent not granted or for recruiter privacy
        results.append({
            "id": s.id,
            "name": s.full_name,
            "email": s.email if consent_approved else "[REDACTED - CONSENT REQUIRED]",
            "phone": profile.phone if consent_approved else "[REDACTED]",
            "college": profile.college,
            "degree": profile.degree,
            "branch": profile.branch,
            "graduation_year": profile.graduation_year,
            "cgpa": profile.cgpa,
            "backlogs": profile.backlogs,
            "skills": profile.skills,
            "projects": profile.projects if consent_approved else [],
            "consent_approved": consent_approved,
            "consent_updated_at": profile.consent_updated_at,
            "relevance_score": analysis["relevance_score"] if analysis else 80,
            "is_eligible": analysis["is_eligible"] if analysis else True,
            "matching_required": analysis["matching_required"] if analysis else [],
            "missing_skills": analysis["missing_skills"] if analysis else []
        })

    return results
