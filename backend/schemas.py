from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime

# ----------------- Auth Schemas -----------------
class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: str
    role: str = "student"

    @validator("role")
    def validate_role(cls, v):
        v = v.lower()
        if v not in ["student", "recruiter"]:
            raise ValueError("Direct public registration is only available for student or recruiter accounts.")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Student Profile Schemas -----------------
class ProjectItem(BaseModel):
    title: str
    description: str
    technologies: List[str] = []
    project_url: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ExperienceItem(BaseModel):
    title: str
    organization: str
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class StudentProfileUpdate(BaseModel):
    phone: Optional[str] = None
    current_city: Optional[str] = None
    preferred_locations: Optional[List[str]] = None

    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    academic_year: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    cgpa_scale: Optional[float] = 10.0
    backlogs: Optional[int] = 0

    skills: Optional[List[str]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    experience: Optional[List[Dict[str, Any]]] = None

    preferred_roles: Optional[List[str]] = None
    preferred_industries: Optional[List[str]] = None
    work_arrangement: Optional[str] = "any"
    employment_type: Optional[str] = "both"
    min_salary_expectation: Optional[float] = None
    preferred_skills: Optional[List[str]] = None
    job_alert_emails: Optional[bool] = True

    consent_job_alerts: Optional[bool] = None
    consent_recruiter_sharing: Optional[bool] = None
    consent_matching: Optional[bool] = None

    is_onboarded: Optional[bool] = None

class StudentProfileOut(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str] = None
    email: Optional[str] = None

    phone: Optional[str]
    current_city: Optional[str]
    preferred_locations: List[str]

    college: Optional[str]
    degree: Optional[str]
    branch: Optional[str]
    academic_year: Optional[str]
    graduation_year: Optional[int]
    cgpa: Optional[float]
    cgpa_scale: float
    backlogs: int

    skills: List[str]
    projects: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]

    preferred_roles: List[str]
    preferred_industries: List[str]
    work_arrangement: str
    employment_type: str
    min_salary_expectation: Optional[float]
    preferred_skills: List[str]
    job_alert_emails: bool

    consent_job_alerts: bool
    consent_recruiter_sharing: bool
    consent_matching: bool
    consent_updated_at: datetime
    is_onboarded: bool

    class Config:
        from_attributes = True

class ProfileCompletionOut(BaseModel):
    completion_percentage: int
    completed_fields: List[str]
    missing_fields: List[str]
    can_match: bool

class ConsentUpdate(BaseModel):
    consent_job_alerts: Optional[bool] = None
    consent_recruiter_sharing: Optional[bool] = None
    consent_matching: Optional[bool] = None

# ----------------- Job Schemas -----------------
class JobOut(BaseModel):
    id: str
    title: str
    company: Optional[str]
    opportunity_type: str
    domain: str
    location: str
    work_arrangement: str
    compensation: Optional[str]
    cgpa_cutoff: Optional[float]
    target_batches: Optional[List[int]]
    eligible_branches: Optional[List[str]]
    required_skills: List[str]
    preferred_skills: List[str]
    description: str
    source_url: Optional[str]
    application_url: Optional[str]
    application_deadline: Optional[str]
    verification_status: str
    source_type: str
    is_active: bool
    last_verified_at: Optional[datetime]
    notes: Optional[str]

    class Config:
        from_attributes = True

# ----------------- Match Schemas -----------------
class ScoreBreakdown(BaseModel):
    required_skills_score: int
    preferred_skills_score: int
    project_evidence_score: int
    academic_index_score: int

class ProjectEvidenceItem(BaseModel):
    project_title: str
    matched_tech: List[str]
    description: str
    project_url: Optional[str] = None

class PreparationSuggestion(BaseModel):
    type: str
    title: str
    action: str

class MatchResultOut(BaseModel):
    job: JobOut
    relevance_score: int
    is_eligible: bool
    eligibility_status: str  # "ELIGIBLE" | "FAILED_CRITERIA" | "REVIEW_REQUIRED"
    eligibility_failures: List[str]
    unknown_criteria: List[str]
    score_breakdown: ScoreBreakdown
    matching_required: List[str]
    matching_preferred: List[str]
    missing_skills: List[str]
    project_evidence: List[ProjectEvidenceItem]
    preparation_suggestions: List[PreparationSuggestion]
