from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON
)
from sqlalchemy.orm import relationship
from .database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)  # student | recruiter | admin
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Personal Information
    phone = Column(String(50), nullable=True)
    current_city = Column(String(100), nullable=True)
    preferred_locations = Column(JSON, default=list, nullable=False)

    # Education Information
    college = Column(String(255), nullable=True)
    degree = Column(String(100), nullable=True)
    branch = Column(String(150), nullable=True)
    academic_year = Column(String(50), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    cgpa = Column(Float, nullable=True)
    cgpa_scale = Column(Float, default=10.0, nullable=False)
    backlogs = Column(Integer, default=0, nullable=False)

    # Skills (List of strings)
    skills = Column(JSON, default=list, nullable=False)

    # Projects (List of objects: {title, description, technologies, project_url, role, start_date, end_date})
    projects = Column(JSON, default=list, nullable=False)

    # Experience & Certifications
    experience = Column(JSON, default=list, nullable=False)
    certifications = Column(JSON, default=list, nullable=False)

    # Resume Tracking & Intelligence Metadata
    resume_filename = Column(String(255), nullable=True)
    resume_uploaded_at = Column(DateTime, nullable=True)
    resume_extraction_metadata = Column(JSON, default=dict, nullable=False)

    # Career Preferences
    preferred_roles = Column(JSON, default=list, nullable=False)
    preferred_industries = Column(JSON, default=list, nullable=False)
    work_arrangement = Column(String(50), default="any", nullable=False)  # remote | hybrid | onsite | any
    employment_type = Column(String(50), default="both", nullable=False)   # internship | full_time | both
    min_salary_expectation = Column(Float, nullable=True)
    preferred_skills = Column(JSON, default=list, nullable=False)
    job_alert_emails = Column(Boolean, default=True, nullable=False)

    # Privacy & Consent (Independently controllable)
    consent_job_alerts = Column(Boolean, default=True, nullable=False)
    consent_recruiter_sharing = Column(Boolean, default=False, nullable=False)
    consent_matching = Column(Boolean, default=True, nullable=False)
    consent_updated_at = Column(DateTime, default=utcnow, nullable=False)

    # Onboarding Status
    is_onboarded = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="student_profile")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    opportunity_type = Column(String(50), default="job", nullable=False)  # job | internship | hackathon | lead
    domain = Column(String(150), default="Software Engineering", nullable=False)
    location = Column(String(255), default="Unspecified", nullable=False)
    work_arrangement = Column(String(50), default="onsite", nullable=False)  # remote | hybrid | onsite | any
    compensation = Column(String(255), nullable=True)
    cgpa_cutoff = Column(Float, nullable=True)
    target_batches = Column(JSON, default=list, nullable=True)  # e.g. [2027] or [2027, 2028, 2029]
    eligible_branches = Column(JSON, default=list, nullable=True)
    required_skills = Column(JSON, default=list, nullable=False)
    preferred_skills = Column(JSON, default=list, nullable=False)
    description = Column(Text, nullable=False)
    source_url = Column(String(500), nullable=True)
    application_url = Column(String(500), nullable=True)  # EXACT supplied URL preserved
    application_deadline = Column(String(100), nullable=True)
    verification_status = Column(String(50), default="unverified", nullable=False)  # unverified | verified | expired | closed
    source_type = Column(String(50), default="shared_announcement", nullable=False) # official_careers_page | referral_link | application_form | shared_announcement
    is_active = Column(Boolean, default=True, nullable=False)
    last_verified_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(String(100), ForeignKey("jobs.id"), nullable=True)
    type = Column(String(100), default="Opportunity Match", nullable=False)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    html_preview = Column(Text, nullable=True)
    idempotency_key = Column(String(255), unique=True, index=True, nullable=False)
    status = Column(String(50), default="staged", nullable=False)  # staged | delivered | read
    created_at = Column(DateTime, default=utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")
    job = relationship("Job")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, nullable=True)
    actor_name = Column(String(255), nullable=False)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=False)
    level = Column(String(50), default="INFO", nullable=False)  # INFO | SUCCESS | SECURITY | AUDIT | ERROR
    created_at = Column(DateTime, default=utcnow, nullable=False)

class JobSource(Base):
    __tablename__ = "job_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    source_type = Column(String(100), nullable=False)  # official_careers_page | ats_greenhouse | ats_workday | shared_announcement | admin_reviewed
    source_url = Column(String(500), nullable=False)
    config = Column(JSON, default=dict, nullable=False)
    last_retrieval_at = Column(DateTime, nullable=True)
    last_verification_at = Column(DateTime, nullable=True)
    ingestion_status = Column(String(50), default="pending", nullable=False)  # success | failed | pending | partial
    error_info = Column(Text, nullable=True)
    is_enabled = Column(Boolean, default=True, nullable=False)
    items_ingested_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)
