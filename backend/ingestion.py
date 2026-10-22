import os
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from sqlalchemy.orm import Session
from .models import Job, JobSource, AuditLog

DEFAULT_SOURCES = [
    {
        "name": "Amazon University Talent Acquisition",
        "source_type": "official_careers_page",
        "source_url": "https://www.amazon.jobs/en/jobs/10513277/software-development-engineer-intern-may-2027-2-month-amazon-university-talent-acquisition",
        "config": {"job_id": "opp-amazon", "target_company": "Amazon"}
    },
    {
        "name": "MicoWorks Greenhouse Board",
        "source_type": "ats_greenhouse",
        "source_url": "https://job-boards.greenhouse.io/micoworks/jobs/5456507008",
        "config": {"job_id": "opp-14", "target_company": "Mico"}
    },
    {
        "name": "Red Hat Workday Board",
        "source_type": "ats_workday",
        "source_url": "https://redhat.wd5.myworkdayjobs.com/jobs/job/Pune---Tower-6/Software-Engineering-Intern_R-058560",
        "config": {"job_id": "opp-02", "target_company": "Red Hat"}
    },
    {
        "name": "Automation Anywhere Workday",
        "source_type": "ats_workday",
        "source_url": "https://automationanywhere.wd5.myworkdayjobs.com/en-US/AutomationAnywhereJobs/job/Bengaluru-India/Software-Engineering-Intern_JR1504",
        "config": {"job_id": "opp-17", "target_company": "Automation Anywhere"}
    },
    {
        "name": "HPE Official University Careers",
        "source_type": "official_careers_page",
        "source_url": "https://careers.hpe.com/us/en/job/1211844/Intern?utm_source=KrishanKumarLinkedin",
        "config": {"job_id": "opp-15", "target_company": "HPE"}
    },
    {
        "name": "Schneider Electric Hackathon Portal",
        "source_type": "shared_announcement",
        "source_url": "https://bit.ly/EnergyTechHackathon",
        "config": {"job_id": "opp-01", "target_company": "Schneider Electric"}
    },
    {
        "name": "Flam Candidate Career Listing",
        "source_type": "shared_announcement",
        "source_url": "https://www.linkedin.com/jobs/view/4466665437/",
        "config": {"job_id": "opp-18", "target_company": "Flam"}
    },
    {
        "name": "Reliance Industries GET Portal",
        "source_type": "shared_announcement",
        "source_url": "https://bit.ly/RelianceHiring2027",
        "config": {"job_id": "opp-16", "target_company": "Reliance Industries Limited"}
    }
]

def seed_default_sources(db: Session):
    for src in DEFAULT_SOURCES:
        existing = db.query(JobSource).filter(JobSource.name == src["name"]).first()
        if not existing:
            source = JobSource(
                name=src["name"],
                source_type=src["source_type"],
                source_url=src["source_url"],
                config=src["config"],
                is_enabled=True,
                ingestion_status="pending"
            )
            db.add(source)
    db.commit()

def run_ingestion_cycle(db: Session) -> Dict[str, Any]:
    """
    Ingests and validates live opportunity sources respecting provider headers and policies.
    Does not use Gemini to fabricate data; updates verification timestamps and statuses.
    """
    sources = db.query(JobSource).filter(JobSource.is_enabled == True).all()
    results = []

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }

    now = datetime.now(timezone.utc)

    for src in sources:
        target_job_id = src.config.get("job_id") if src.config else None
        job = db.query(Job).filter(Job.id == target_job_id).first() if target_job_id else None

        try:
            # Respectful validation request
            with httpx.Client(timeout=8.0, follow_redirects=True, headers=headers) as client:
                resp = client.get(src.source_url)
                final_url = str(resp.url)

                src.last_retrieval_at = now

                # Greenhouse specific error redirect check
                if "greenhouse.io" in src.source_url and "error=true" in final_url:
                    src.ingestion_status = "success"
                    src.last_verification_at = now
                    src.error_info = "Listing redirected to Greenhouse portal index (vacancy closed or expired)."
                    if job:
                        job.verification_status = "closed"
                        job.is_active = False
                        job.last_verified_at = now
                        job.notes = "Vacancy verified as closed on Greenhouse portal."
                    results.append({"source": src.name, "status": "closed", "url": final_url})

                elif resp.status_code in [200, 301, 302]:
                    src.ingestion_status = "success"
                    src.last_verification_at = now
                    src.error_info = None
                    if job:
                        # If previously unverified, mark verified if official
                        if src.source_type in ["official_careers_page", "ats_greenhouse", "ats_workday"]:
                            job.verification_status = "verified"
                        job.last_verified_at = now
                        job.is_active = True
                    results.append({"source": src.name, "status": "verified", "url": final_url})

                elif resp.status_code in [403, 999]:
                    # Anti-scraping protection (e.g. LinkedIn or Cloudflare). Do NOT disable the valid link!
                    src.ingestion_status = "partial"
                    src.error_info = f"Automated crawler challenged by provider (HTTP {resp.status_code}). Link remains active for direct browser navigation."
                    results.append({"source": src.name, "status": "restricted_crawler", "url": src.source_url})

                elif resp.status_code == 404:
                    src.ingestion_status = "failed"
                    src.error_info = f"HTTP 404 Not Found at {final_url}"
                    if job:
                        job.verification_status = "expired"
                        job.is_active = False
                    results.append({"source": src.name, "status": "404", "url": final_url})

                else:
                    src.ingestion_status = "partial"
                    src.error_info = f"Received HTTP {resp.status_code}"
                    results.append({"source": src.name, "status": f"http_{resp.status_code}", "url": final_url})

        except Exception as e:
            src.ingestion_status = "failed"
            src.error_info = str(e)
            results.append({"source": src.name, "status": "error", "error": str(e)})

    db.commit()

    # Log ingestion run in AuditLog
    audit = AuditLog(
        actor_name="Job Ingestion Service",
        action="Live Job-Source Ingestion & Verification Executed",
        details=f"Evaluated {len(sources)} registered sources. Results: {len([r for r in results if r['status'] == 'verified'])} verified active, {len([r for r in results if r['status'] == 'closed'])} closed/expired.",
        level="AUDIT"
    )
    db.add(audit)
    db.commit()

    return {
        "timestamp": now.isoformat(),
        "total_sources_evaluated": len(sources),
        "results": results
    }
