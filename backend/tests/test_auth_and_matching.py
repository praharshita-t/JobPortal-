import pytest
import os
import json
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test database
TEST_DB_URL = "sqlite:///./test_campusmatch.db"
os.environ["DATABASE_URL"] = TEST_DB_URL

from backend.database import Base, get_db
from backend.models import User, StudentProfile, Job
from backend.main import app
from backend.seed import seed_database
from backend.auth import hash_password, verify_password

test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_campusmatch.db"):
        try:
            os.remove("./test_campusmatch.db")
        except:
            pass

client = TestClient(app)

def test_user_registration_and_login():
    # 1. Register new student
    reg_payload = {
        "full_name": "Dev Student",
        "email": "dev.student@university.edu",
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!",
        "role": "student"
    }
    r = client.post("/api/v1/auth/register", json=reg_payload)
    assert r.status_code == 201
    data = r.json()
    assert "access_token" in data
    assert data["user"]["email"] == "dev.student@university.edu"

    # 2. Verify password is stored as Argon2id hash
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "dev.student@university.edu").first()
    assert user is not None
    assert user.hashed_password.startswith("$argon2id$")
    assert verify_password("SecurePassword123!", user.hashed_password)
    assert not verify_password("WrongPassword!", user.hashed_password)
    db.close()

    # 3. Duplicate email rejection
    r_dup = client.post("/api/v1/auth/register", json=reg_payload)
    assert r_dup.status_code == 400
    assert "already registered" in r_dup.json()["detail"].lower()

    # 4. Login with correct credentials
    login_payload = {
        "email": "dev.student@university.edu",
        "password": "SecurePassword123!"
    }
    r_login = client.post("/api/v1/auth/login", json=login_payload)
    assert r_login.status_code == 200
    assert "access_token" in r_login.json()

    # 5. Login with incorrect credentials
    r_bad = client.post("/api/v1/auth/login", json={"email": "dev.student@university.edu", "password": "WrongPassword"})
    assert r_bad.status_code == 401

def test_admin_registration_forbidden():
    r = client.post("/api/v1/auth/register", json={
        "full_name": "Fake Admin",
        "email": "fake.admin@domain.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "admin"
    })
    # Must reject admin registration
    assert r.status_code in [400, 403, 422]

def test_unauthenticated_requests_blocked():
    client.cookies.clear()
    r = client.get("/api/v1/students/me")
    assert r.status_code == 401

    r_admin = client.get("/api/v1/admin/overview")
    assert r_admin.status_code == 401

def test_student_cannot_access_admin_endpoints():
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "aarav.sharma@campus.edu",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r_admin = client.get("/api/v1/admin/overview", headers=headers)
    assert r_admin.status_code == 403

def test_data_isolation_between_students():
    # Register Student A
    client.post("/api/v1/auth/register", json={
        "full_name": "Student Alpha",
        "email": "alpha@univ.edu",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "student"
    })
    login_a = client.post("/api/v1/auth/login", json={"email": "alpha@univ.edu", "password": "Password123!"})
    token_a = login_a.json()["access_token"]

    # Register Student B
    client.post("/api/v1/auth/register", json={
        "full_name": "Student Beta",
        "email": "beta@univ.edu",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "student"
    })
    login_b = client.post("/api/v1/auth/login", json={"email": "beta@univ.edu", "password": "Password123!"})
    token_b = login_b.json()["access_token"]

    # Update Student A's profile
    client.put("/api/v1/students/me", json={
        "college": "Alpha Tech",
        "branch": "Computer Science",
        "cgpa": 9.25,
        "skills": ["Go", "Kubernetes"]
    }, headers={"Authorization": f"Bearer {token_a}"})

    # Student B reads their own profile
    res_b = client.get("/api/v1/students/me", headers={"Authorization": f"Bearer {token_b}"})
    data_b = res_b.json()
    assert data_b["email"] == "beta@univ.edu"
    assert data_b["college"] != "Alpha Tech"
    assert data_b["cgpa"] != 9.25

def test_consent_withdrawal_and_recruiter_redaction():
    # Login recruiter
    r_login = client.post("/api/v1/auth/login", json={
        "email": "priya.nair@talent-partner.com",
        "password": "Password123!"
    })
    recruiter_token = r_login.json()["access_token"]
    r_headers = {"Authorization": f"Bearer {recruiter_token}"}

    # Student Alpha withdraws recruiter sharing consent
    login_a = client.post("/api/v1/auth/login", json={"email": "alpha@univ.edu", "password": "Password123!"})
    token_a = login_a.json()["access_token"]

    client.patch("/api/v1/students/me/consent", json={
        "consent_recruiter_sharing": False
    }, headers={"Authorization": f"Bearer {token_a}"})

    # Recruiter inspects candidate pool
    candidates_resp = client.get("/api/v1/recruiter/candidates", headers=r_headers)
    assert candidates_resp.status_code == 200
    candidates = candidates_resp.json()

    alpha_rec = next((c for c in candidates if c["name"] == "Student Alpha"), None)
    assert alpha_rec is not None
    assert alpha_rec["consent_approved"] is False
    assert "[REDACTED" in alpha_rec["email"]
    assert alpha_rec["phone"] == "[REDACTED]"

def test_real_world_opportunities_seeded_accurately():
    r = client.get("/api/v1/jobs")
    assert r.status_code == 200
    jobs = r.json()
    assert len(jobs) >= 20

    # 1. Schneider Electric
    schneider = next(j for j in jobs if j["id"] == "opp-01")
    assert schneider["company"] == "Schneider Electric"
    assert schneider["opportunity_type"] == "hackathon"
    assert schneider["application_url"] == "https://bit.ly/EnergyTechHackathon"

    # 2. Red Hat batch check
    redhat = next(j for j in jobs if j["id"] == "opp-02")
    assert redhat["target_batches"] == [2027]
    assert redhat["application_url"] == "https://redhat.wd5.myworkdayjobs.com/jobs/job/Pune---Tower-6/Software-Engineering-Intern_R-058560"

    # 3. Reliance Industries GET 2027
    reliance = next(j for j in jobs if j["id"] == "opp-16")
    assert reliance["target_batches"] == [2027]
    assert "Chemical Engineering" in reliance["eligible_branches"]
    assert "Computer Science" not in str(reliance["eligible_branches"])
    assert reliance["application_url"] == "https://bit.ly/RelianceHiring2027"

    # 4. Unspecified Company (Opp 13)
    unspecified = next(j for j in jobs if j["id"] == "opp-13")
    assert unspecified["company"] == "Unspecified Organization"
    assert "docs.google.com/forms" in unspecified["application_url"]

    # 5. Park+ Informational Lead (Opp 19)
    park = next(j for j in jobs if j["id"] == "opp-19")
    assert park["application_url"] is None
    assert park["is_active"] is False

    # 6. Amazon SDE Intern (opp-amazon)
    amazon = next(j for j in jobs if j["id"] == "opp-amazon")
    assert amazon["company"] == "Amazon"
    assert "Software Development Engineer Intern — May 2027" in amazon["title"]
    assert amazon["target_batches"] == [2027]
    assert amazon["application_url"] == "https://www.amazon.jobs/en/jobs/10513277/software-development-engineer-intern-may-2027-2-month-amazon-university-talent-acquisition"
    assert amazon["is_active"] is True

    # 7. MicoWorks closed verification
    mico = next(j for j in jobs if j["id"] == "opp-14")
    assert mico["verification_status"] == "closed"
    assert mico["is_active"] is False

    # 8. Flam LinkedIn candidate listing
    flam = next(j for j in jobs if j["id"] == "opp-18")
    assert flam["application_url"] == "https://www.linkedin.com/jobs/view/4466665437/"

    # 9. Verify synthetic opp-20 was removed
    assert not any(j["id"] == "opp-20" for j in jobs)

def test_admin_job_sources_registry():
    # Login as admin
    login_admin = client.post("/api/v1/auth/login", json={"email": "rajesh.sen@placement.university.edu", "password": "Password123!"})
    token = login_admin.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r_sources = client.get("/api/v1/admin/sources", headers=headers)
    assert r_sources.status_code == 200
    sources = r_sources.json()
    assert len(sources) >= 5
    amazon_source = next((s for s in sources if "Amazon" in s["name"]), None)
    assert amazon_source is not None
    assert "amazon.jobs" in amazon_source["source_url"]

def test_idempotent_seeding():
    # Re-running seed_database must not duplicate jobs
    db = TestingSessionLocal()
    initial_count = db.query(Job).count()
    seed_database(db)
    after_count = db.query(Job).count()
    db.close()
    assert initial_count == after_count

def test_profile_based_matching():
    # Login Student Alpha, set batch 2027 and mechanical engineering
    login_a = client.post("/api/v1/auth/login", json={"email": "alpha@univ.edu", "password": "Password123!"})
    token_a = login_a.json()["access_token"]
    headers = {"Authorization": f"Bearer {token_a}"}

    client.put("/api/v1/students/me", json={
        "degree": "B.Tech",
        "branch": "Mechanical Engineering",
        "graduation_year": 2027,
        "cgpa": 8.5,
        "skills": ["Core Engineering Fundamentals", "Python", "Problem Solving"]
    }, headers=headers)

    matches_resp = client.get("/api/v1/students/me/matches", headers=headers)
    assert matches_resp.status_code == 200
    matches = matches_resp.json()

    reliance_match = next((m for m in matches if m["job"]["id"] == "opp-16"), None)
    assert reliance_match is not None
    # Mechanical Engineering + 2027 -> Should be ELIGIBLE for Reliance GET 2027
    assert reliance_match["is_eligible"] is True
    assert reliance_match["eligibility_status"] == "ELIGIBLE"
