import pytest
import os
import io
from io import BytesIO
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test database
TEST_DB_URL = "sqlite:///./test_resume_campusmatch.db"
os.environ["DATABASE_URL"] = TEST_DB_URL

from backend.database import Base, get_db
from backend.models import User, StudentProfile, Job
from backend.main import app
from backend.seed import seed_database
from backend.matching import evaluate_job_match
from backend.resume_service import (
    validate_file_upload,
    extract_text_from_file,
    parse_resume_deterministic,
    process_resume_upload,
    MAX_FILE_SIZE_BYTES
)

test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()
    yield
    app.dependency_overrides.pop(get_db, None)
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_resume_campusmatch.db"):
        try:
            os.remove("./test_resume_campusmatch.db")
        except:
            pass

client = TestClient(app)

# Helper to generate a minimal valid PDF in memory
def create_sample_pdf(text: str) -> bytes:
    import pypdf
    writer = pypdf.PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    # Write stream
    buf = BytesIO()
    writer.write(buf)
    # Standard PDF header check requires %PDF
    pdf_bytes = buf.getvalue()
    # If pypdf blank page doesn't have text stream, we append text or mock extraction
    return pdf_bytes

# Helper to generate a valid DOCX in memory
def create_sample_docx(paragraphs: list[str]) -> bytes:
    import docx
    doc = docx.Document()
    for p in paragraphs:
        doc.add_paragraph(p)
    buf = BytesIO()
    doc.save(buf)
    return buf.getvalue()


# ----------------- 1. Unit Tests: Extraction & Validation -----------------

def test_file_validation_rejects_invalid_extension():
    with pytest.raises(ValueError, match="Unsupported file format"):
        validate_file_upload(b"%PDF-1.4 dummy", "resume.exe")

def test_file_validation_rejects_empty_file():
    with pytest.raises(ValueError, match="Uploaded file is empty"):
        validate_file_upload(b"", "resume.pdf")

def test_file_validation_rejects_oversized_file():
    huge_bytes = b"%PDF" + (b"0" * (MAX_FILE_SIZE_BYTES + 10))
    with pytest.raises(ValueError, match="File size exceeds maximum limit"):
        validate_file_upload(huge_bytes, "resume.pdf")

def test_file_validation_rejects_fake_pdf():
    # .pdf extension but not starting with %PDF
    with pytest.raises(ValueError, match="Missing %PDF magic header"):
        validate_file_upload(b"NOT A REAL PDF", "resume.pdf")

def test_file_validation_rejects_fake_docx():
    # .docx extension but not starting with PK\x03\x04
    with pytest.raises(ValueError, match="Missing standard zip/docx header"):
        validate_file_upload(b"NOT A REAL DOCX", "resume.docx")

def test_docx_text_extraction():
    sample_lines = [
        "Rohan Gupta",
        "rohan.gupta@iitb.ac.in | +91 9876543210",
        "Education",
        "Indian Institute of Technology Bombay",
        "Bachelor of Technology in Computer Science and Engineering",
        "Expected Graduation: 2027 | CGPA: 9.15 / 10.0",
        "Skills",
        "Python, C++, Java, PyTorch, Distributed Systems, Docker, React, SQL",
        "Projects",
        "Distributed KV Store: Raft consensus based key-value database in C++ and Docker.",
        "Neural Search Engine: Vector embedding search engine using PyTorch and FastAPI."
    ]
    docx_bytes = create_sample_docx(sample_lines)
    text, warning = extract_text_from_file(docx_bytes, "rohan_resume.docx")
    assert "Rohan Gupta" in text
    assert "Computer Science" in text
    assert "9.15" in text
    assert warning is None

def test_deterministic_parser_extracts_correct_fields():
    sample_resume_text = """
    Pooja Sundaram
    pooja.sundaram@nitk.edu.in | +91 9123456789
    National Institute of Technology Karnataka (NITK)
    Degree: B.Tech in Computer Science & Engineering
    Graduation Year: 2027
    Academic Record: CGPA: 8.92 / 10.0

    SKILLS:
    Python, Java, Go, Distributed Systems, SQL, Docker, Kafka, Git, Problem Solving

    PROJECTS:
    High Throughput Event Broker: High volume distributed event bus handling 50k msgs/sec in Go and Kafka.
    Realtime Stream Analytics: Analytics pipeline built using Python, Docker and SQL.

    EXPERIENCE:
    Software Engineering Intern at Cloud Corp
    Developed containerized microservices and automated CI/CD deployment pipelines.

    CERTIFICATIONS:
    AWS Certified Cloud Practitioner
    """

    res = parse_resume_deterministic(sample_resume_text, user_email="pooja.sundaram@nitk.edu.in")
    assert res.full_name == "Pooja Sundaram"
    assert res.email == "pooja.sundaram@nitk.edu.in"
    assert res.phone == "+91 9123456789"
    assert "National Institute of Technology" in res.college
    assert res.degree == "B.Tech"
    assert res.branch == "Computer Science & Engineering"
    assert res.graduation_year == 2027
    assert res.cgpa == 8.92
    assert res.cgpa_scale == 10.0
    assert "Python" in res.skills
    assert "Distributed Systems" in res.skills
    assert len(res.projects) >= 2
    assert len(res.experience) >= 1
    assert "cgpa" not in res.missing_fields
    assert res.confidence_scores.get("cgpa", 0) > 0.8

def test_missing_fields_do_not_hallucinate():
    # Resume with NO CGPA, NO College, and NO Graduation Year
    sparse_text = """
    Alex Mercer
    alex.mercer@gmail.com
    Skills: Python, React, SQL
    Projects: Simple Todo List in React.
    """
    res = parse_resume_deterministic(sparse_text, user_email="alex.mercer@gmail.com")
    assert res.cgpa is None
    assert res.college is None
    assert res.graduation_year is None
    assert "cgpa" in res.missing_fields
    assert "college" in res.missing_fields
    assert "graduation_year" in res.missing_fields

def test_percentage_not_converted_to_cgpa():
    text_with_pct = """
    Sunita Rao
    sunita@domain.com
    B.Tech Computer Science | Passing 2027
    Score: 84.5% aggregate
    Skills: Java, SQL
    """
    res = parse_resume_deterministic(text_with_pct)
    assert res.percentage == 84.5
    assert res.cgpa is None  # Must NOT guess or convert percentage to CGPA!
    assert "cgpa" in res.missing_fields


# ----------------- 2. API Endpoint Tests (Auth & Permissions) -----------------

def test_unauthorized_resume_upload_fails():
    docx_bytes = create_sample_docx(["Test Student Resume Text"])
    r = client.post("/api/v1/students/resume/upload", files={"file": ("resume.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")})
    assert r.status_code == 401

def test_recruiter_forbidden_from_student_resume_upload():
    # Login recruiter
    r_login = client.post("/api/v1/auth/login", json={"email": "priya.nair@talent-partner.com", "password": "Password123!"})
    token = r_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    docx_bytes = create_sample_docx(["Test Student Resume"])
    r = client.post("/api/v1/students/resume/upload", headers=headers, files={"file": ("resume.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")})
    assert r.status_code == 403


# ----------------- 3. End-to-End Extraction, Confirm & Duplicate Prevention -----------------

def test_student_resume_upload_and_confirmation_lifecycle():
    # 1. Register a fresh student
    student_payload = {
        "full_name": "Kavya Menon",
        "email": "kavya.menon@univ.edu",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "student"
    }
    r_reg = client.post("/api/v1/auth/register", json=student_payload)
    assert r_reg.status_code == 201
    token = r_reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload DOCX resume
    resume_lines = [
        "Kavya Menon",
        "kavya.menon@univ.edu | +91 9988776655",
        "Indian Institute of Technology Madras",
        "B.Tech in Computer Science & Engineering",
        "Graduation Year: 2027",
        "CGPA: 9.35 / 10.0",
        "Technical Skills",
        "Python, C++, Java, PyTorch, Distributed Systems, Docker, React, SQL, Algorithms",
        "Academic Projects",
        "Distributed Raft Cluster: Fault tolerant consensus implementation handling high throughput.",
        "Vector Index ANN: Low latency nearest neighbor search engine with PyTorch and Python."
    ]
    docx_bytes = create_sample_docx(resume_lines)

    upload_resp = client.post(
        "/api/v1/students/resume/upload",
        headers=headers,
        files={"file": ("kavya_resume.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    )
    assert upload_resp.status_code == 200
    extracted = upload_resp.json()
    assert extracted["graduation_year"] == 2027
    assert extracted["cgpa"] == 9.35
    assert "Distributed Systems" in extracted["skills"]
    assert len(extracted["projects"]) >= 2

    # 3. Confirm and apply to student profile
    confirm_resp = client.post(
        "/api/v1/students/resume/confirm",
        headers=headers,
        json={
            "overwrite_existing": False,
            "profile_data": {
                "college": extracted["college"],
                "degree": extracted["degree"],
                "branch": extracted["branch"],
                "graduation_year": extracted["graduation_year"],
                "cgpa": extracted["cgpa"],
                "cgpa_scale": extracted["cgpa_scale"],
                "skills": extracted["skills"],
                "projects": extracted["projects"],
                "resume_filename": "kavya_resume.docx"
            }
        }
    )
    assert confirm_resp.status_code == 200
    saved_profile = confirm_resp.json()
    assert saved_profile["graduation_year"] == 2027
    assert saved_profile["cgpa"] == 9.35
    assert saved_profile["resume_filename"] == "kavya_resume.docx"
    initial_skills_count = len(saved_profile["skills"])
    initial_proj_count = len(saved_profile["projects"])

    # 4. Repeated upload check: uploading again MUST NOT duplicate skills or projects!
    confirm_again = client.post(
        "/api/v1/students/resume/confirm",
        headers=headers,
        json={
            "overwrite_existing": False,
            "profile_data": {
                "skills": extracted["skills"],
                "projects": extracted["projects"],
                "resume_filename": "kavya_resume_v2.docx"
            }
        }
    )
    assert confirm_again.status_code == 200
    re_saved = confirm_again.json()
    assert len(re_saved["skills"]) == initial_skills_count
    assert len(re_saved["projects"]) == initial_proj_count

    # 5. Preservation check: user-entered values preserved when overwrite_existing=False
    client.put("/api/v1/students/me", headers=headers, json={
        "current_city": "Chennai",
        "phone": "+91 90000 11111"
    })

    confirm_preserve = client.post(
        "/api/v1/students/resume/confirm",
        headers=headers,
        json={
            "overwrite_existing": False,
            "profile_data": {
                "phone": "+91 88888 22222", # Different phone in resume
                "current_city": "Bengaluru"
            }
        }
    )
    profile_preserved = confirm_preserve.json()
    # Preserved user-entered phone and city
    assert profile_preserved["phone"] == "+91 90000 11111"
    assert profile_preserved["current_city"] == "Chennai"

    # 6. Matching check: The populated profile matches real-world Amazon SDE Intern!
    matches_resp = client.get("/api/v1/students/me/matches", headers=headers)
    assert matches_resp.status_code == 200
    matches = matches_resp.json()

    amazon_match = next((m for m in matches if m["job"]["id"] == "opp-amazon"), None)
    assert amazon_match is not None
    # 2027 batch + CSE + high CGPA -> must be ELIGIBLE
    assert amazon_match["is_eligible"] is True
    assert amazon_match["relevance_score"] >= 80
