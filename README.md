# CampusMatch AI — Editorial Career Intelligence

CampusMatch AI is an editorial career intelligence and university placement matching platform combining modern typography, strict lavender and sage branding, authentic user authentication, and deterministic explainable matching.

---

## Quick Start & Setup Instructions

### 1. Requirements
- Node.js v18+ and npm
- Python 3.10+ and pip

### 2. Backend Setup (FastAPI & SQLite)
```bash
# Install Python dependencies
pip install fastapi uvicorn sqlalchemy pydantic argon2-cffi pyjwt pytest httpx python-multipart

# Run automated tests
python -m pytest backend/tests/test_auth_and_matching.py -v

# Start the backend server on port 8000
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The SQLite database `campusmatch.db` is created and seeded automatically with 20 real-world opportunities upon application startup.

### 3. Frontend Setup (React & Vite)
```bash
# Install node dependencies
npm install

# Build production bundle
npm run build

# Start local dev server (port 3000)
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

---

## Authentication & Profiles

- **Registration**: Users can register with name, email, password, confirm password, and account type (`student` by default).
- **Security**: Passwords hashed with **Argon2id**. Sessions managed via secure HTTP-only cookies (`campusmatch_session`) with JWT fallback.
- **Student Onboarding**: 6-step guided profile builder (Personal info, Academic records, Skills inventory, Projects & repositories, Career preferences, and Non-bundled Privacy & Consent controls).
- **Recruiter & Admin Access**: Role-based access control protecting candidate records and operations.
- **Development Convenience**: Pre-seeded demo credential fillers for student (Aarav), recruiter (Priya), and admin (Dr. Sen) are accessible on the login modal.

---

## Seeded Real-World Opportunities & Ingestion Service

All opportunities are authenticated from genuine sources and verified via the backend Ingestion Service (`backend/ingestion.py`):
- **Amazon** (Software Development Engineer Intern — May 2027, 2 Month, Job ID: 10513277) — `https://www.amazon.jobs/en/jobs/10513277/software-development-engineer-intern-may-2027-2-month-amazon-university-talent-acquisition` (Target batch 2027, STEM, Bengaluru).
- **Red Hat** (Software Engineering Intern, 2027 batch) — `https://redhat.wd5.myworkdayjobs.com/jobs/job/Pune---Tower-6/Software-Engineering-Intern_R-058560`
- **Schneider Electric** (Energy Tech Hackathon, INR 45 Lakhs pool) — `https://bit.ly/EnergyTechHackathon`
- **Automation Anywhere** (Software Engineering Intern, INR 40,000/mo, 2027 batch) — `https://automationanywhere.wd5.myworkdayjobs.com/en-US/AutomationAnywhereJobs/job/Bengaluru-India/Software-Engineering-Intern_JR1504`
- **HPE** (Software Engineering Intern) — `https://careers.hpe.com/us/en/job/1211844/Intern?utm_source=KrishanKumarLinkedin`
- **Flam** (Software Engineering Intern) — `https://www.linkedin.com/jobs/view/4466665437/` (Candidate listing on LinkedIn).
- **Reliance Industries Limited** (GET Program 2027, Chemical/Mechanical/Electrical/Civil, strictly excluded from CSBS) — `https://bit.ly/RelianceHiring2027`
- **micro1** (10 distinct roles: DSA Solver, Competitive Coder, Cybersecurity, Backend, AI Product Evaluator, etc.) — Preserved referral URLs.
- **Frontend Engineering Intern** (Unspecified organization, Class of 2027) — `https://docs.google.com/forms/d/e/1FAIpQLScLx2eH1d9_lykSWF9cQ_YHRcatsgVANbAqwTu2Tr_NYI43Hw/viewform`
- **MicoWorks** (Data Science Intern) — `https://job-boards.greenhouse.io/micoworks/jobs/5456507008` (Ingestion service verified closed status via Greenhouse redirect; stored as `closed` and inactive).
- **Park+** (Informational Lead Only; `application_url` is null; Apply button is disabled with an explanatory notice).

---

## Direct Application Navigation
- All opportunity cards and detail panels use native HTML anchor elements:
  `<a href={job.application_url} target="_blank" rel="noopener noreferrer">Apply on Official Site ↗</a>`
- Directly navigates to the external opportunity page in a new browser tab without modal popup blockers.
- Opening the external site is never misrepresented as submitting an internal application.

---

## Verification & Test Results
- **Automated Tests**: 10 of 10 pytest suites passed covering registration, login, duplicate rejection, Argon2id hashing, student data isolation, consent redactions, Amazon ingestion, Mico closed status, JobSource registry, and profile matching.
- **Frontend Build**: `npm run build` completed with 0 errors.
