# CampusMatch AI — Project Status

## 1. Executive Summary
CampusMatch AI is an editorial career intelligence and university placement matching platform designed with an art-directed lavender and sage aesthetic, Argon2id authentication, persistent SQLite database storage, and a deterministic 100-point explainable matching engine.

All demo-user login assumptions have been replaced with genuine user registration and authentication, multi-step student onboarding, granular privacy and consent directives, and 20 real-world opportunity listings with authentic application links.

---

## 2. Implemented Features

### A. Real Authentication & Authorization
- **Registration**: Allows new students and recruiters to register with full name, email, password, confirm password, and account type (`POST /api/v1/auth/register`).
- **Modern Password Hashing**: Utilizes **Argon2id** (`$argon2id$`) via `argon2-cffi`. Plaintext passwords and session secrets are never stored.
- **Duplicate Prevention**: Email normalization (`.strip().lower()`) and database uniqueness constraints prevent duplicate registrations.
- **Administrative Protection**: Public registration as placement administrator is strictly forbidden (returns HTTP 400/403/422).
- **Session Management**: Issues JWT tokens stored in secure HTTP-only cookies (`campusmatch_session`) with `SameSite=Lax` and Bearer token fallback.
- **Persistent Login**: Sessions persist across browser refreshes and server restarts.
- **Role-Based Access Control (RBAC)**: Enforced via FastAPI dependencies (`get_current_student`, `get_current_recruiter`, `get_current_admin`).

### B. Multi-Step Student Onboarding & Profiles
- **Step 1: Personal Information**: Full name, read-only verified email, optional phone (redacted from recruiters without consent), base city, preferred locations.
- **Step 2: Education**: College/university, degree, branch/specialization, academic year, graduation cohort, current CGPA, explicit CGPA scale (default 10.0), and active academic backlogs.
- **Step 3: Skills**: Dynamic addition, editing, and removal of technical and soft skills, featuring common suggestions and custom skill inputs.
- **Step 4: Projects & Experience**: Title, technical summary, technology tags, and repository/demo links.
- **Step 5: Career Preferences**: Preferred job roles, target industries, work arrangement (Remote/Hybrid/Onsite/Any), employment type (Internship/Full-time/Both), and minimum CTC expectations.
- **Step 6: Privacy & Consent Directives**: Independent, non-bundled controls with timestamps for:
  1. Deterministic job matching engine.
  2. Personalized high-affinity job alerts via email.
  3. Sharing verified dossiers with authorized partner recruiters (withdrawing immediately redacts candidate PII).

### C. Genuine Opportunity Sources & Ingestion Service
All fabricated, placeholder, and synthetic job entries (such as fictional campus drives with placeholder URLs) have been removed from SQLite, seed files, and frontend fallback datasets.
The system is integrated with an automated Ingestion & Verification Service (`backend/ingestion.py`):
1. **Amazon University Talent Acquisition** (`opp-amazon`):
   - Role: Software Development Engineer Intern — May 2027 (2 Month)
   - Official listing: `https://www.amazon.jobs/en/jobs/10513277/software-development-engineer-intern-may-2027-2-month-amazon-university-talent-acquisition`
   - Graduation cohort: 2027. Location: Bengaluru, Karnataka, India. Live status: Verified & Active.
2. **Red Hat** (`opp-02`): Software Engineering Intern — `https://redhat.wd5.myworkdayjobs.com/jobs/job/Pune---Tower-6/Software-Engineering-Intern_R-058560` (Class of 2027, Workday portal).
3. **MicoWorks** (`opp-14`): Data Science Intern — `https://job-boards.greenhouse.io/micoworks/jobs/5456507008`. Ingestion service detected Greenhouse portal redirect (`?error=true`); listing is verified as closed and marked `is_active=False`.
4. **Flam** (`opp-18`): Software Engineering Intern — `https://www.linkedin.com/jobs/view/4466665437/` (Candidate listing on LinkedIn).
5. **Schneider Electric** (`opp-01`): Energy Tech Hackathon — `https://bit.ly/EnergyTechHackathon`.
6. **Automation Anywhere** (`opp-17`): Software Engineering Intern — `https://automationanywhere.wd5.myworkdayjobs.com/en-US/AutomationAnywhereJobs/job/Bengaluru-India/Software-Engineering-Intern_JR1504`.
7. **HPE** (`opp-15`): Software Engineering Intern — `https://careers.hpe.com/us/en/job/1211844/Intern?utm_source=KrishanKumarLinkedin`.
8. **Reliance Industries Limited** (`opp-16`): GET Program 2027 — `https://bit.ly/RelianceHiring2027`.
9. **micro1 Roles** (`opp-03` to `opp-12`): Authentic referral and application URLs preserved intact.
10. **Park+ Lead** (`opp-19`): Informational lead only. No application URL was supplied; `application_url` is stored as `null`, and the Apply button is disabled with an explanatory notice without inventing a fake link.

### D. Direct Application Action Architecture
- Replaced delayed modal popups with direct native anchor elements:
  `<a href={job.application_url} target="_blank" rel="noopener noreferrer">Apply on Official Site ↗</a>`
- Eliminates browser popup blocker suppression by triggering direct browser navigation from user click events.
- Never misrepresents opening an external page as a completed job application.
- If a listing has no application URL (e.g. Park+), the button is disabled with the message: *"Application link unavailable — contact placement cell or recruiter directly"*.

---

## 3. Automated Test Verification Results

Automated test suite located at `backend/tests/test_auth_and_matching.py`:

```text
============================= test session starts =============================
platform win32 -- Python 3.13.5, pytest-9.1.1
collected 10 items

backend/tests/test_auth_and_matching.py::test_user_registration_and_login PASSED [ 10%]
backend/tests/test_auth_and_matching.py::test_admin_registration_forbidden PASSED [ 20%]
backend/tests/test_auth_and_matching.py::test_unauthenticated_requests_blocked PASSED [ 30%]
backend/tests/test_auth_and_matching.py::test_student_cannot_access_admin_endpoints PASSED [ 40%]
backend/tests/test_auth_and_matching.py::test_data_isolation_between_students PASSED [ 50%]
backend/tests/test_auth_and_matching.py::test_consent_withdrawal_and_recruiter_redaction PASSED [ 60%]
backend/tests/test_auth_and_matching.py::test_real_world_opportunities_seeded_accurately PASSED [ 70%]
backend/tests/test_auth_and_matching.py::test_admin_job_sources_registry PASSED [ 80%]
backend/tests/test_auth_and_matching.py::test_idempotent_seeding PASSED [ 90%]
backend/tests/test_auth_and_matching.py::test_profile_based_matching PASSED [100%]

======================= 10 passed, 4 warnings in 3.65s ========================
```

Frontend production bundle test:
```text
✓ built in 4.70s
dist/index.html                   1.02 kB
dist/assets/index-DF1AfwAP.css   18.27 kB
dist/assets/index-CWs8Z0zh.js   301.96 kB
```

---

## 4. Known Limitations & Architecture Notes
- **Email Verification & Password Recovery Tokens**: Structure is prepared for cryptographically hashed, single-use tokens; full production SMTP dispatch is disabled in local development in favor of preview generation and in-app logs.
- **Unverified Listings**: Shared announcements from community boards are marked as `unverified` and `shared_announcement` until reviewed by a placement administrator.
