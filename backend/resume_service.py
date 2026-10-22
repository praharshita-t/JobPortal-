import os
import re
import json
import logging
from io import BytesIO
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timezone
import httpx
from pydantic import ValidationError

from .schemas import ResumeExtractionResult

logger = logging.getLogger("campusmatch.resume_service")

# ----------------- Constants & Dictionaries -----------------
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream"  # sometimes sent by browsers
}

COMMON_TECH_SKILLS = [
    "Python", "JavaScript", "TypeScript", "C++", "C#", "C", "Java", "Go", "Golang", "Rust", "Ruby", "PHP", "Swift", "Kotlin",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Cassandra", "Oracle",
    "React", "React.js", "Next.js", "Vue.js", "Angular", "HTML", "CSS", "TailwindCSS", "Node.js", "Express",
    "FastAPI", "Django", "Flask", "Spring Boot", "GraphQL", "REST APIs", "gRPC",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Linux", "Git", "GitHub", "CI/CD", "Kafka", "RabbitMQ",
    "PyTorch", "TensorFlow", "Scikit-Learn", "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
    "Pandas", "NumPy", "Data Science", "Statistics", "Data Structures", "Algorithms", "System Design",
    "Distributed Systems", "Cyber Security", "Penetration Testing", "Cryptography", "Network Security",
    "Microservices", "OOP", "Object-Oriented Programming"
]

COMMON_SOFT_SKILLS = [
    "Problem Solving", "Critical Thinking", "Team Leadership", "Communication",
    "Agile", "Scrum", "Collaboration", "Project Management", "Analytical Skills"
]

COMMON_DEGREES = [
    ("B.Tech", ["b.tech", "btech", "bachelor of technology"]),
    ("B.E.", ["b.e.", "b.e", "be", "bachelor of engineering"]),
    ("M.Tech", ["m.tech", "mtech", "master of technology"]),
    ("M.S.", ["m.s.", "ms", "master of science"]),
    ("B.C.A.", ["b.c.a.", "bca", "bachelor of computer applications"]),
    ("M.C.A.", ["m.c.a.", "mca", "master of computer applications"]),
    ("B.Sc", ["b.sc", "bsc", "bachelor of science"]),
    ("M.Sc", ["m.sc", "msc", "master of science"]),
    ("Ph.D.", ["ph.d", "phd", "doctor of philosophy"])
]

COMMON_BRANCHES = [
    ("Computer Science & Engineering", ["computer science", "cse", "cs", "computer engineering"]),
    ("Information Technology", ["information technology", "it"]),
    ("Data Science & AI", ["data science", "artificial intelligence", "ai & ds", "ai/ml"]),
    ("Electronics & Communication", ["electronics and communication", "electronics & communication", "ece"]),
    ("Electrical Engineering", ["electrical engineering", "eee"]),
    ("Mechanical Engineering", ["mechanical engineering", "mech"]),
    ("Civil Engineering", ["civil engineering", "civil"]),
    ("Chemical Engineering", ["chemical engineering", "chemical"]),
    ("Biotechnology", ["biotechnology", "biotech"]),
    ("Mathematics & Computing", ["mathematics and computing", "mathematics & computing", "mnc"])
]

# ----------------- File Extraction -----------------
def validate_file_upload(file_bytes: bytes, filename: str, content_type: Optional[str] = None):
    """
    Validates file size, file extension, and magic bytes for security.
    """
    if len(file_bytes) == 0:
        raise ValueError("Uploaded file is empty (0 bytes).")
    
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size exceeds maximum limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.")

    ext = os.path.splitext(filename.lower())[1]
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file format '{ext}'. Allowed formats: PDF (.pdf), Word (.docx).")

    # Magic byte verification
    if ext == ".pdf":
        if not file_bytes.startswith(b"%PDF"):
            raise ValueError("Invalid PDF file: Missing %PDF magic header.")
    elif ext == ".docx":
        # DOCX is a zip archive with PK\x03\x04
        if not file_bytes.startswith(b"PK\x03\x04"):
            raise ValueError("Invalid DOCX file: Missing standard zip/docx header.")

def extract_text_from_file(file_bytes: bytes, filename: str) -> Tuple[str, Optional[str]]:
    """
    Extracts text from PDF or DOCX bytes safely in memory.
    Returns (extracted_text, warning_if_any).
    """
    ext = os.path.splitext(filename.lower())[1]
    extracted_text = ""

    if ext == ".pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(BytesIO(file_bytes))
            pages_text = []
            for p in reader.pages:
                t = p.extract_text()
                if t:
                    pages_text.append(t)
            extracted_text = "\n".join(pages_text).strip()
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            raise ValueError(f"Failed to read PDF file contents: {str(e)}")

    elif ext == ".docx":
        try:
            import docx
            doc = docx.Document(BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_text:
                        paragraphs.append(row_text)
            extracted_text = "\n".join(paragraphs).strip()
        except Exception as e:
            logger.error(f"DOCX extraction error: {e}")
            raise ValueError(f"Failed to read DOCX file contents: {str(e)}")

    warning = None
    if len(extracted_text) < 50:
        warning = "Low text volume or scanned image-only document detected. Automatic parsing may be incomplete; please review and verify extracted fields."

    return extracted_text, warning

# ----------------- Deterministic Fallback Parser -----------------
def parse_resume_deterministic(text: str, user_email: Optional[str] = None) -> ResumeExtractionResult:
    """
    Deterministic rule-based extractor with zero external network dependencies.
    Never hallucinates data. Records confidence scores and source evidence.
    """
    confidence: Dict[str, float] = {}
    evidence: Dict[str, str] = {}
    missing_fields: List[str] = []
    uncertain_fields: List[str] = []

    lines = [l.strip() for l in text.splitlines() if l.strip()]

    # 1. Email extraction
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    extracted_email = email_match.group(0).lower() if email_match else user_email
    if extracted_email:
        confidence["email"] = 0.95
        evidence["email"] = extracted_email
    else:
        missing_fields.append("email")

    # 2. Phone extraction
    phone_match = re.search(r"(?:(?:\+|0{0,2})91[\s-]?)?[6789]\d{9}|(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}", text)
    extracted_phone = phone_match.group(0).strip() if phone_match else None
    if extracted_phone:
        confidence["phone"] = 0.85
        evidence["phone"] = extracted_phone
    else:
        missing_fields.append("phone")

    # 3. Full name extraction
    # Heuristic: First 1-3 lines that don't match email, phone, or headers like RESUME / CV
    extracted_name = None
    for line in lines[:5]:
        cleaned = re.sub(r"[^a-zA-Z\s.]", "", line).strip()
        words = cleaned.split()
        if 2 <= len(words) <= 4 and not any(w.lower() in ["resume", "curriculum", "vitae", "profile", "contact", "education"] for w in words):
            extracted_name = cleaned
            confidence["full_name"] = 0.80
            evidence["full_name"] = line
            break
    if not extracted_name:
        missing_fields.append("full_name")

    # 4. Degree & Branch extraction
    extracted_degree = None
    extracted_branch = None
    text_lower = text.lower()

    for deg_standard, aliases in COMMON_DEGREES:
        for alias in aliases:
            if re.search(rf"\b{re.escape(alias)}\b", text_lower):
                extracted_degree = deg_standard
                confidence["degree"] = 0.85
                evidence["degree"] = alias
                break
        if extracted_degree:
            break
    if not extracted_degree:
        missing_fields.append("degree")

    for branch_standard, aliases in COMMON_BRANCHES:
        for alias in aliases:
            if re.search(rf"\b{re.escape(alias)}\b", text_lower):
                extracted_branch = branch_standard
                confidence["branch"] = 0.85
                evidence["branch"] = alias
                break
        if extracted_branch:
            break
    if not extracted_branch:
        missing_fields.append("branch")

    # 5. College / University extraction
    # Strip email and url lines before college search so email domain doesn't match
    clean_lines_no_emails = [l for l in lines if "@" not in l and "http" not in l]
    text_no_emails = "\n".join(clean_lines_no_emails)

    college_patterns = [
        r"(?:Indian\s+Institute\s+of\s+Technology[^\n,]*|\bIIT\s+[A-Za-z]+)",
        r"(?:National\s+Institute\s+of\s+Technology[^\n,]*|\bNIT\s+[A-Za-z]+)",
        r"(?:Birla\s+Institute\s+of\s+Technology[^\n,]*|\bBITS\s+[A-Za-z]+)",
        r"(?:[A-Z][A-Za-z\s&]+(?:University|Institute\s+of\s+Technology|Engineering\s+College|College\s+of\s+Engineering))"
    ]
    extracted_college = None
    for pattern in college_patterns:
        m = re.search(pattern, text_no_emails, re.IGNORECASE)
        if m:
            extracted_college = m.group(0).strip()
            confidence["college"] = 0.85
            evidence["college"] = extracted_college
            break
    if not extracted_college:
        missing_fields.append("college")

    # 6. Graduation Year extraction
    # Look for 2020-2032 in education context
    year_match = re.search(r"(?:graduation|batch|class\s+of|expected|passing\s+year|year\s+of\s+passing)?[:\s\-–]*\b(202[3-9]|203[0-2])\b", text, re.IGNORECASE)
    extracted_grad_year = None
    if year_match:
        extracted_grad_year = int(year_match.group(1))
        confidence["graduation_year"] = 0.85
        evidence["graduation_year"] = year_match.group(0)
    else:
        # Fallback search for any 2024-2030 in text
        any_year = re.search(r"\b(202[4-9]|203[0-2])\b", text)
        if any_year:
            extracted_grad_year = int(any_year.group(1))
            confidence["graduation_year"] = 0.60
            uncertain_fields.append("graduation_year")
            evidence["graduation_year"] = any_year.group(0)
        else:
            missing_fields.append("graduation_year")

    # 7. CGPA / Percentage extraction
    extracted_cgpa = None
    extracted_scale = 10.0
    extracted_percentage = None

    cgpa_match = re.search(r"(?:cgpa|gpa|pointer|c\.g\.p\.a)[:\s]*([0-9]\.[0-9]{1,2})(?:\s*/\s*(10(?:\.0)?|4(?:\.0)?))?", text, re.IGNORECASE)
    if cgpa_match:
        val = float(cgpa_match.group(1))
        scale = float(cgpa_match.group(2)) if cgpa_match.group(2) else 10.0
        if val <= scale:
            extracted_cgpa = val
            extracted_scale = scale
            confidence["cgpa"] = 0.90
            evidence["cgpa"] = cgpa_match.group(0)

    # Check for percentage if CGPA not found
    if extracted_cgpa is None:
        pct_match = re.search(r"([5-9][0-9](?:\.[0-9]{1,2})?)\s*%", text)
        if pct_match:
            extracted_percentage = float(pct_match.group(1))
            evidence["percentage"] = pct_match.group(0)
            uncertain_fields.append("cgpa")
            missing_fields.append("cgpa")
        else:
            missing_fields.append("cgpa")

    # 8. Skills extraction
    detected_skills = []
    for s in COMMON_TECH_SKILLS + COMMON_SOFT_SKILLS:
        pattern = rf"\b{re.escape(s)}\b"
        if re.search(pattern, text, re.IGNORECASE):
            if s not in detected_skills:
                detected_skills.append(s)

    confidence["skills"] = 0.85 if len(detected_skills) >= 3 else 0.50

    # 9. Projects extraction
    projects = []
    proj_section = re.search(r"(?:PROJECTS|ACADEMIC PROJECTS|PERSONAL PROJECTS)[\s\S]*?(?:EXPERIENCE|WORK EXPERIENCE|INTERNSHIPS|SKILLS|EDUCATION|CERTIFICATIONS|$)", text, re.IGNORECASE)
    if proj_section:
        sec_text = proj_section.group(0).strip()
        sec_lines = [l.strip() for l in sec_text.splitlines() if l.strip()]
        # Strip header
        if sec_lines and any(h in sec_lines[0].upper() for h in ["PROJECTS", "ACADEMIC", "PERSONAL"]):
            sec_lines = sec_lines[1:]

        for line in sec_lines:
            if len(line) < 15:
                continue
            # Extract title and desc
            if ":" in line:
                parts = line.split(":", 1)
                title = re.sub(r"^[•\-\*\s]+", "", parts[0]).strip()[:80]
                desc = parts[1].strip()
            else:
                title = re.sub(r"^[•\-\*\s]+", "", line)[:60].strip()
                desc = line

            p_tech = [t for t in COMMON_TECH_SKILLS if re.search(rf"\b{re.escape(t)}\b", line, re.IGNORECASE)]
            projects.append({
                "title": title,
                "description": desc,
                "technologies": p_tech[:5],
                "project_url": None
            })
            if len(projects) >= 4:
                break

    # 10. Experience extraction
    experience = []
    exp_section = re.search(r"(?:EXPERIENCE|WORK EXPERIENCE|INTERNSHIPS|EMPLOYMENT)[\s\S]*?(?:PROJECTS|SKILLS|EDUCATION|CERTIFICATIONS|$)", text, re.IGNORECASE)
    if exp_section:
        exp_sec_text = exp_section.group(0).strip()
        exp_lines = [l.strip() for l in exp_sec_text.splitlines() if l.strip()]
        if exp_lines and any(h in exp_lines[0].upper() for h in ["EXPERIENCE", "WORK", "INTERNSHIP"]):
            exp_lines = exp_lines[1:]

        for line in exp_lines:
            if len(line) < 20:
                continue
            if ":" in line:
                parts = line.split(":", 1)
                title = re.sub(r"^[•\-\*\s]+", "", parts[0]).strip()[:80]
                desc = parts[1].strip()
            else:
                title = re.sub(r"^[•\-\*\s]+", "", line)[:60].strip()
                desc = line

            experience.append({
                "title": title,
                "organization": "Verified in Resume",
                "description": desc[:250]
            })
            if len(experience) >= 3:
                break

    # 11. Certifications
    certifications = []
    cert_section = re.search(r"(?:CERTIFICATIONS|ACHIEVEMENTS|AWARDS)[\s\S]*?(?:PROJECTS|EXPERIENCE|EDUCATION|SKILLS|$)", text, re.IGNORECASE)
    if cert_section:
        cert_text = cert_section.group(0)
        cert_items = [c.strip() for c in re.split(r"\n\s*[•\-\*]\s*", cert_text) if len(c.strip()) > 5 and len(c.strip()) < 100]
        certifications = cert_items[1:5] if len(cert_items) > 1 else cert_items[:3]

    return ResumeExtractionResult(
        full_name=extracted_name,
        email=extracted_email,
        phone=extracted_phone,
        college=extracted_college,
        degree=extracted_degree,
        branch=extracted_branch,
        graduation_year=extracted_grad_year,
        cgpa=extracted_cgpa,
        cgpa_scale=extracted_scale,
        percentage=extracted_percentage,
        skills=detected_skills,
        projects=projects,
        experience=experience,
        certifications=certifications,
        uncertain_fields=list(set(uncertain_fields)),
        missing_fields=list(set(missing_fields)),
        confidence_scores=confidence,
        extractor="deterministic",
        source_evidence=evidence,
        raw_character_count=len(text)
    )

# ----------------- AI-Assisted Extractor (Gemini) -----------------
def parse_resume_with_ai(text: str, user_email: Optional[str] = None) -> Optional[ResumeExtractionResult]:
    """
    Invokes Gemini API if GEMINI_API_KEY is configured.
    Enforces strict Pydantic parsing. Returns None on failure for seamless fallback.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return None

    prompt = f"""
You are an expert university placement parser. Extract structured student profile attributes from the following resume text.
Follow these rules strictly:
1. Never invent or hallucinate data. If a field is not explicitly present, use null or an empty list.
2. Do not convert a percentage to CGPA. Record percentage under 'percentage' and leave 'cgpa' as null.
3. Extract academic values: college name, degree (e.g. B.Tech, M.Tech), branch/department, graduation year (YYYY), cgpa and cgpa_scale (usually 10.0 or 4.0).
4. Extract skills as a normalized list of technical and soft skills.
5. Extract projects as a list of objects with title, description, and technologies.
6. Extract internships/work experience and certifications.
7. Return ONLY valid JSON matching this schema:
{{
  "full_name": string or null,
  "email": string or null,
  "phone": string or null,
  "college": string or null,
  "degree": string or null,
  "branch": string or null,
  "graduation_year": integer or null,
  "cgpa": float or null,
  "cgpa_scale": float or null,
  "percentage": float or null,
  "skills": [string],
  "projects": [{{"title": string, "description": string, "technologies": [string]}}],
  "experience": [{{"title": string, "organization": string, "description": string}}],
  "certifications": [string],
  "uncertain_fields": [string],
  "missing_fields": [string],
  "confidence_scores": {{"full_name": float, "cgpa": float, "college": float, "graduation_year": float}},
  "source_evidence": {{"cgpa": string, "graduation_year": string, "college": string}}
}}

Resume text:
\"\"\"
{text[:8000]}
\"\"\"
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"}
    }

    try:
        with httpx.Client(timeout=12.0) as client:
            resp = client.post(url, json=payload)
            if resp.status_code != 200:
                logger.warning(f"Gemini API returned status {resp.status_code}")
                return None

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                return None

            content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            if not content_text:
                return None

            parsed_json = json.loads(content_text)
            parsed_json["extractor"] = "gemini_ai"
            parsed_json["raw_character_count"] = len(text)

            # Validate against Pydantic schema
            return ResumeExtractionResult(**parsed_json)

    except (httpx.RequestError, json.JSONDecodeError, ValidationError, Exception) as e:
        logger.warning(f"AI parsing error: {e}. Falling back to deterministic extraction.")
        return None

# ----------------- Main Orchestrator -----------------
def process_resume_upload(file_bytes: bytes, filename: str, content_type: Optional[str] = None, user_email: Optional[str] = None) -> ResumeExtractionResult:
    """
    Validates file, extracts text, tries AI parser if available, and falls back to deterministic extraction.
    """
    validate_file_upload(file_bytes, filename, content_type)
    text, warning = extract_text_from_file(file_bytes, filename)

    # 1. Try AI-assisted parse if configured
    result = parse_resume_with_ai(text, user_email)

    # 2. Fall back to deterministic parse
    if not result:
        result = parse_resume_deterministic(text, user_email)

    if warning:
        result.warning = warning

    return result
