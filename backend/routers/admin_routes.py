from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, StudentProfile, Job, Notification, AuditLog
from ..auth import get_current_admin
from ..matching import evaluate_job_match

router = APIRouter(prefix="/api/v1/admin", tags=["Placement Administration"])

@router.get("/overview")
def get_operational_overview(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.is_active == True).count()
    verified_jobs = db.query(Job).filter(Job.verification_status == "verified").count()
    total_students = db.query(User).filter(User.role == "student").count()
    consented_students = db.query(StudentProfile).filter(StudentProfile.consent_recruiter_sharing == True).count()
    total_notifications = db.query(Notification).count()

    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "verified_jobs": verified_jobs,
        "total_students": total_students,
        "consented_students": consented_students,
        "total_notifications": total_notifications
    }

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 50,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs

@router.post("/trigger-matching-cycle")
def trigger_batch_matching(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    students = db.query(StudentProfile).filter(StudentProfile.is_onboarded == True).all()
    jobs = db.query(Job).filter(Job.is_active == True).all()

    notifications_staged = 0
    for profile in students:
        for job in jobs:
            match = evaluate_job_match(profile, job)
            if match["relevance_score"] >= 80 and match["is_eligible"]:
                idemp_key = f"CYCLE-{datetime.now().strftime('%Y%m%d')}-{profile.user_id}-{job.id}"
                existing = db.query(Notification).filter(Notification.idempotency_key == idemp_key).first()
                if not existing and profile.consent_job_alerts:
                    notif = Notification(
                        user_id=profile.user_id,
                        job_id=job.id,
                        type="Opportunity Match",
                        subject=f"Cycle High Match ({match['relevance_score']}%): {job.company or 'Opening'} {job.title}",
                        body=f"Automated matching cycle identified {match['relevance_score']}% score with {job.title}.",
                        idempotency_key=idemp_key,
                        status="delivered"
                    )
                    db.add(notif)
                    notifications_staged += 1

    db.commit()

    audit = AuditLog(
        actor_id=admin_user.id,
        actor_name=admin_user.full_name,
        action="Batch Matching Cycle Triggered",
        details=f"Evaluated {len(jobs)} jobs against {len(students)} onboarded students. Staged {notifications_staged} notifications with duplicate prevention.",
        level="INFO"
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Matching cycle executed successfully",
        "jobs_evaluated": len(jobs),
        "students_evaluated": len(students),
        "notifications_staged": notifications_staged
    }

@router.get("/sources")
def get_job_sources(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    from ..models import JobSource
    sources = db.query(JobSource).order_by(JobSource.id.asc()).all()
    return sources

@router.post("/sources/run")
def trigger_source_ingestion(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    from ..ingestion import run_ingestion_cycle
    result = run_ingestion_cycle(db)
    return result
