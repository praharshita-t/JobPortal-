from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Job, User, AuditLog
from ..schemas import JobOut
from ..auth import get_current_user, get_current_recruiter, get_current_admin

router = APIRouter(prefix="/api/v1/jobs", tags=["Opportunities"])

@router.get("", response_model=List[JobOut])
def get_all_jobs(
    opportunity_type: Optional[str] = None,
    domain: Optional[str] = None,
    graduation_batch: Optional[int] = None,
    verification_status: Optional[str] = None,
    work_arrangement: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Job)

    if opportunity_type and opportunity_type != "All":
        query = query.filter(Job.opportunity_type == opportunity_type)

    if domain and domain != "All":
        query = query.filter(Job.domain == domain)

    if verification_status and verification_status != "All":
        query = query.filter(Job.verification_status == verification_status)

    if work_arrangement and work_arrangement != "All":
        query = query.filter(Job.work_arrangement == work_arrangement)

    jobs = query.all()

    # Filter batch & search in memory for JSON / string fields
    if graduation_batch:
        jobs = [j for j in jobs if not j.target_batches or graduation_batch in j.target_batches]

    if search:
        s_lower = search.lower().strip()
        jobs = [
            j for j in jobs
            if s_lower in (j.title or "").lower()
            or s_lower in (j.company or "").lower()
            or any(s_lower in sk.lower() for sk in (j.required_skills or []))
        ]

    return jobs

@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return job

@router.patch("/{job_id}/verification")
def update_verification_status(
    job_id: str,
    verification_status: str,
    notes: Optional[str] = None,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    valid_statuses = ["unverified", "verified", "expired", "closed"]
    if verification_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    job.verification_status = verification_status
    if notes:
        job.notes = notes
    if verification_status == "verified":
        job.last_verified_at = datetime.now(timezone.utc)
    if verification_status in ["expired", "closed"]:
        job.is_active = False

    audit = AuditLog(
        actor_id=admin_user.id,
        actor_name=admin_user.full_name,
        action=f"Job Verification Updated: {job.title}",
        details=f"Status changed to {verification_status}. Notes: {notes or 'N/A'}",
        level="AUDIT"
    )
    db.add(audit)
    db.commit()

    return {"message": "Job verification status updated", "job": job}
