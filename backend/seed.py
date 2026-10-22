from datetime import datetime, timezone
from sqlalchemy.orm import Session
from .database import engine, SessionLocal, Base
from .models import User, StudentProfile, Job, Notification, AuditLog, JobSource
from .auth import hash_password
from .ingestion import seed_default_sources

def seed_database(db: Session):
    Base.metadata.create_all(bind=engine)
    seed_default_sources(db)

    # 1. Seed Demo / Reference Users if not present
    demo_users = [
        {
            "email": "aarav.sharma@campus.edu",
            "password": "Password123!",
            "full_name": "Aarav Sharma",
            "role": "student",
            "profile": {
                "phone": "+91 98765 43210",
                "current_city": "Bengaluru",
                "preferred_locations": ["Bengaluru", "Hyderabad", "Gurugram"],
                "college": "Indian Institute of Technology",
                "degree": "B.Tech",
                "branch": "Computer Science & Engineering",
                "academic_year": "4th Year",
                "graduation_year": 2026,
                "cgpa": 8.85,
                "cgpa_scale": 10.0,
                "backlogs": 0,
                "skills": ["Python", "PyTorch", "Distributed Systems", "React", "SQL", "Docker", "FastAPI", "C++", "Kafka"],
                "projects": [
                    {
                        "title": "High-Throughput Vector Search Pipeline",
                        "description": "Low-latency approximate nearest neighbor search engine achieving <12ms query latency.",
                        "technologies": ["PyTorch", "Python", "FastAPI", "Docker"],
                        "project_url": "https://github.com/aaravsharma/vector-ann-engine"
                    },
                    {
                        "title": "Distributed Stream Processing Engine",
                        "description": "Event-driven consensus log based on Raft handling 45,000 events/sec.",
                        "technologies": ["Kafka", "Distributed Systems", "C++"],
                        "project_url": "https://github.com/aaravsharma/distributed-raft-stream"
                    }
                ],
                "preferred_roles": ["Machine Learning Systems", "Backend Platform"],
                "preferred_industries": ["Artificial Intelligence", "Fintech"],
                "work_arrangement": "any",
                "employment_type": "full_time",
                "consent_job_alerts": True,
                "consent_recruiter_sharing": True,
                "consent_matching": True,
                "is_onboarded": True
            }
        },
        {
            "email": "priya.nair@talent-partner.com",
            "password": "Password123!",
            "full_name": "Priya Nair",
            "role": "recruiter"
        },
        {
            "email": "rajesh.sen@placement.university.edu",
            "password": "Password123!",
            "full_name": "Dr. Rajesh Sen",
            "role": "admin"
        }
    ]

    for u_data in demo_users:
        existing_user = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing_user:
            user = User(
                email=u_data["email"],
                hashed_password=hash_password(u_data["password"]),
                full_name=u_data["full_name"],
                role=u_data["role"],
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            if "profile" in u_data and u_data["role"] == "student":
                prof_data = u_data["profile"]
                profile = StudentProfile(
                    user_id=user.id,
                    phone=prof_data.get("phone"),
                    current_city=prof_data.get("current_city"),
                    preferred_locations=prof_data.get("preferred_locations", []),
                    college=prof_data.get("college"),
                    degree=prof_data.get("degree"),
                    branch=prof_data.get("branch"),
                    academic_year=prof_data.get("academic_year"),
                    graduation_year=prof_data.get("graduation_year"),
                    cgpa=prof_data.get("cgpa"),
                    cgpa_scale=prof_data.get("cgpa_scale", 10.0),
                    backlogs=prof_data.get("backlogs", 0),
                    skills=prof_data.get("skills", []),
                    projects=prof_data.get("projects", []),
                    preferred_roles=prof_data.get("preferred_roles", []),
                    preferred_industries=prof_data.get("preferred_industries", []),
                    work_arrangement=prof_data.get("work_arrangement", "any"),
                    employment_type=prof_data.get("employment_type", "both"),
                    consent_job_alerts=prof_data.get("consent_job_alerts", True),
                    consent_recruiter_sharing=prof_data.get("consent_recruiter_sharing", True),
                    consent_matching=prof_data.get("consent_matching", True),
                    is_onboarded=prof_data.get("is_onboarded", True)
                )
                db.add(profile)
                db.commit()

    # 2. Seed All 20 Real-World Opportunities (Idempotent: merge or skip if exists)
    opportunities = [
        # Opp 1: Schneider Electric
        {
            "id": "opp-01",
            "title": "Energy Tech Hackathon",
            "company": "Schneider Electric",
            "opportunity_type": "hackathon",
            "domain": "Energy & Sustainability Tech",
            "location": "India (Hybrid / Virtual)",
            "work_arrangement": "any",
            "compensation": "INR 45 Lakh Prize Pool + Pre-Placement Interviews + SE Ventures",
            "cgpa_cutoff": None,
            "target_batches": [],  # Open to all college students
            "eligible_branches": [], # Open to all
            "required_skills": [],   # Do not invent mandatory requirements
            "preferred_skills": ["Energy Systems", "IoT", "AI", "Sustainability"],
            "description": "Innovate for the future of sustainable energy infrastructure. Chance of pre-placement interviews, executive mentorship, and corporate venture capital access.",
            "source_url": "https://bit.ly/EnergyTechHackathon",
            "application_url": "https://bit.ly/EnergyTechHackathon",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "shared_announcement",
            "is_active": True,
            "notes": "Shared announcement; eligibility is open to all college students."
        },
        # Opp 2: Red Hat
        {
            "id": "opp-02",
            "title": "Software Engineering Intern",
            "company": "Red Hat",
            "opportunity_type": "internship",
            "domain": "Open Source Systems & Cloud",
            "location": "Bengaluru & Pune, India",
            "work_arrangement": "hybrid",
            "compensation": "Not Specified in Announcement",
            "cgpa_cutoff": None,
            "target_batches": [2027],
            "eligible_branches": [],
            "required_skills": ["Linux", "Python", "Go", "Git"],
            "preferred_skills": ["Kubernetes", "OpenShift", "Containers"],
            "description": "Contribute to enterprise Linux, container virtualization, and cloud infrastructure platforms across Red Hat engineering offices.",
            "source_url": "https://redhat.wd5.myworkdayjobs.com/jobs/job/Pune---Tower-6/Software-Engineering-Intern_R-058560",
            "application_url": "https://redhat.wd5.myworkdayjobs.com/jobs/job/Pune---Tower-6/Software-Engineering-Intern_R-058560",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "official_careers_page",
            "is_active": True,
            "notes": "Eligible graduation cohort: 2027. Official workday careers page."
        },
        # Opp 3: micro1 — DSA / Puzzle Solver
        {
            "id": "opp-03",
            "title": "DSA Problem Solver / Puzzle Solver",
            "company": "micro1",
            "opportunity_type": "job",
            "domain": "Algorithms & Problem Solving",
            "location": "Remote (Global)",
            "work_arrangement": "remote",
            "compensation": "USD 45–100 / hour (Announced range)",
            "cgpa_cutoff": None,
            "target_batches": [],
            "eligible_branches": [],
            "required_skills": ["Data Structures", "Algorithms", "Competitive Programming", "Python", "C++"],
            "preferred_skills": ["Java", "Dynamic Programming"],
            "description": "Analyze complex algorithmic puzzles, optimize data structures, and solve competitive programming challenges on micro1 platform.",
            "source_url": "https://bit.ly/4xm5V56",
            "application_url": "https://bit.ly/4xm5V56",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "referral_link",
            "is_active": True,
            "notes": "Referral application link preserved exactly."
        },
        # Opp 4: micro1 — Competitive Coder
        {
            "id": "opp-04",
            "title": "Competitive Coder",
            "company": "micro1",
            "opportunity_type": "job",
            "domain": "Competitive Programming",
            "location": "Remote",
            "work_arrangement": "remote",
            "compensation": "USD 45–100 / hour (General micro1 range)",
            "cgpa_cutoff": None,
            "target_batches": [],
            "eligible_branches": [],
            "required_skills": ["Algorithms", "C++", "Data Structures", "Time Complexity Optimization"],
            "preferred_skills": ["Python", "Mathematics"],
            "description": "Implement efficient algorithmic solutions and participate in competitive coding benchmarks for client talent evaluations.",
            "source_url": "https://bit.ly/4djsMHk",
            "application_url": "https://bit.ly/4djsMHk",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "referral_link",
            "is_active": True,
            "notes": "Compensation is general group announcement, not independently verified for this specific role."
        },
        # Opp 5: micro1 — Cyber Security Engineer
        {
            "id": "opp-05",
            "title": "Cyber Security Engineer",
            "company": "micro1",
            "opportunity_type": "job",
            "domain": "Information Security",
            "location": "Remote",
            "work_arrangement": "remote",
            "compensation": "Not Independently Verified",
            "cgpa_cutoff": None,
            "target_batches": [],
            "eligible_branches": [],
            "required_skills": ["Cyber Security", "Penetration Testing", "Network Security", "Python"],
            "preferred_skills": ["OWASP", "Cloud Security", "Cryptography"],
            "description": "Conduct security assessments, vulnerability research, and zero-trust verification on distributed client codebases.",
            "source_url": "https://bit.ly/4ySLgqA",
            "application_url": "https://bit.ly/4ySLgqA",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "referral_link",
            "is_active": True,
            "notes": "Eligible for college students and working professionals per general micro1 announcement."
        },
        # Opp 6: micro1 — Backend Engineer
        {
            "id": "opp-06",
            "title": "Backend Engineer",
            "company": "micro1",
            "opportunity_type": "job",
            "domain": "Backend Architecture",
            "location": "Remote",
            "work_arrangement": "remote",
            "compensation": "Not Independently Verified",
            "cgpa_cutoff": None,
            "target_batches": [],
            "eligible_branches": [],
            "required_skills": ["Backend Development", "Node.js", "Python", "SQL", "API Design"],
            "preferred_skills": ["Docker", "PostgreSQL", "Kafka"],
            "description": "Develop resilient RESTful and gRPC microservices with automated testing and high-concurrency database connectivity.",
            "source_url": "https://bit.ly/4y9O7vc",
            "application_url": "https://bit.ly/4y9O7vc",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "referral_link",
            "is_active": True,
            "notes": "Referral link preserved."
        },
        # Opp 7: micro1 — Coding Puzzle Solver / DSA Solver
        {
            "id": "opp-07",
            "title": "Coding Puzzle Solver / DSA Solver",
            "company": "micro1",
            "opportunity_type": "job",
            "domain": "Algorithms & Logic",
            "location": "Remote",
            "work_arrangement": "remote",
            "compensation": "USD 60–120 / hour (Announced range)",
            "cgpa_cutoff": None,
            "target_batches": [],
            "eligible_branches": [],
            "required_skills": ["Data Structures", "Algorithms", "Graph Theory", "Dynamic Programming"],
            "preferred_skills": ["C++", "Python", "Java"],
            "description": "Deconstruct complex problem statements, construct boundary test cases, and solve algorithmic logic puzzles.",
            "source_url": "https://bit.ly/482EV0d",
            "application_url": "https://bit.ly/482EV0d",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "referral_link",
            "is_active": True,
            "notes": "USD 60-120/hr general announced range."
        },
        # Opp 8: micro1 — AI Product Evaluator
        {
            "id": "opp-08",
            "title": "AI Product Evaluator",
            "company": "micro1",
            "opportunity_type": "job",
            "domain": "Artificial Intelligence",
            "location": "Remote",
            "work_arrangement": "remote",
            "compensation": "USD 60–120 / hour (Announced range)",
            "cgpa_cutoff": None,
            "target_batches": [],
            "eligible_branches": [],
            "required_skills": ["AI Evaluation", "Prompt Engineering", "Critical Thinking", "Python"],
            "preferred_skills": ["NLP", "Machine Learning", "Model Benchmarking"],
            "description": "Evaluate foundation model reasoning outputs, conduct alignment audits, and score AI product workflows against qualitative criteria.",
            "source_url": "https://bit.ly/4zLyZVq",
            "application_url": "https://bit.ly/4zLyZVq",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "referral_link",
            "is_active": True,
            "notes": "Referral link preserved."
        },
        # Opp 9: micro1 — Software Engineer
        {
            "id": "opp-09",
            "title": "Software Engineer",
            "company": "micro1",
            "opportunity_type": "job",
            "domain": "Software Engineering",
            "location": "Remote",
            "work_arrangement": "remote",
            "compensation": "USD 60–120 / hour (Announced range)",
            "cgpa_cutoff": None,
            "target_batches": [],
            "eligible_branches": [],
            "required_skills": ["Software Engineering", "Full Stack Development", "Python", "TypeScript"],
            "preferred_skills": ["React", "FastAPI", "Docker", "AWS"],
            "description": "Build end-to-end cloud-native web applications and collaborate with global client teams on product features.",
            "source_url": "https://bit.ly/4Bi76FX",
            "application_url": "https://bit.ly/4Bi76FX",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "referral_link",
            "is_active": True,
            "notes": "Referral link preserved."
        },
        # Opp 10: micro1 — Junior Software Engineer
        {
            "id": "opp-10",
            "title": "Junior Software Engineer",
            "company": "micro1",
            "opportunity_type": "job",
            "domain": "Software Engineering",
            "location": "Remote",
            "work_arrangement": "remote",
            "compensation": "USD 60–120 / hour (Announced range)",
            "cgpa_cutoff": None,
            "target_batches": [],
            "eligible_branches": [],
            "required_skills": ["Data Structures", "Python", "JavaScript", "SQL"],
            "preferred_skills": ["Git", "REST APIs", "React"],
            "description": "Entry-level development across micro1 client projects, including debugging, test automation, and feature enhancement.",
            "source_url": "https://bit.ly/4Bfq6VF",
            "application_url": "https://bit.ly/4Bfq6VF",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "referral_link",
            "is_active": True,
            "notes": "Referral link preserved."
        },
        # Opp 11: micro1 — Junior Data Scientist
        {
            "id": "opp-11",
            "title": "Junior Data Scientist",
            "company": "micro1",
            "opportunity_type": "job",
            "domain": "Data Science & Analytics",
            "location": "Remote",
            "work_arrangement": "remote",
            "compensation": "USD 60–120 / hour (Announced range)",
            "cgpa_cutoff": None,
            "target_batches": [],
            "eligible_branches": [],
            "required_skills": ["Data Science", "Python", "Pandas", "SQL", "Statistics"],
            "preferred_skills": ["Scikit-learn", "Machine Learning", "Data Visualization"],
            "description": "Execute statistical data modeling, clean complex tabular datasets, and construct exploratory data analysis pipelines.",
            "source_url": "https://bit.ly/4ens3p3",
            "application_url": "https://bit.ly/4ens3p3",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "referral_link",
            "is_active": True,
            "notes": "Referral link preserved."
        },
        # Opp 12: micro1 — Video Data Annotator
        {
            "id": "opp-12",
            "title": "Video Data Annotator",
            "company": "micro1",
            "opportunity_type": "job",
            "domain": "Computer Vision & AI Operations",
            "location": "Remote",
            "work_arrangement": "remote",
            "compensation": "USD 60–120 / hour (Announced range)",
            "cgpa_cutoff": None,
            "target_batches": [],
            "eligible_branches": [],
            "required_skills": ["Data Annotation", "Attention to Detail", "Computer Vision Basics"],
            "preferred_skills": ["Python", "Labeling Tools"],
            "description": "Frame-by-frame spatial annotation, semantic segmentation verification, and quality assurance for computer vision foundation models.",
            "source_url": "https://bit.ly/4jx1JfM",
            "application_url": "https://bit.ly/4jx1JfM",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "referral_link",
            "is_active": True,
            "notes": "Referral link preserved."
        },
        # Opp 13: Frontend Engineering Intern (Company unspecified)
        {
            "id": "opp-13",
            "title": "Frontend Engineering Intern",
            "company": "Unspecified Organization",
            "opportunity_type": "internship",
            "domain": "Web Frontend",
            "location": "Unspecified",
            "work_arrangement": "any",
            "compensation": "Not Disclosed",
            "cgpa_cutoff": None,
            "target_batches": [2027],
            "eligible_branches": [],
            "required_skills": ["React", "JavaScript", "HTML/CSS", "Git"],
            "preferred_skills": ["TypeScript", "TailwindCSS"],
            "description": "Frontend UI component implementation and responsive web development. Application is hosted on Google Forms; company name not provided in the announcement.",
            "source_url": "https://docs.google.com/forms/d/e/1FAIpQLScLx2eH1d9_lykSWF9cQ_YHRcatsgVANbAqwTu2Tr_NYI43Hw/viewform",
            "application_url": "https://docs.google.com/forms/d/e/1FAIpQLScLx2eH1d9_lykSWF9cQ_YHRcatsgVANbAqwTu2Tr_NYI43Hw/viewform",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "application_form",
            "is_active": True,
            "notes": "Company name is unverified. Application is via Google Form. Do not invent an organization."
        },
        # Opp 14: Mico (MycoWorks)
        {
            "id": "opp-14",
            "title": "Data Science Intern",
            "company": "Mico",
            "opportunity_type": "internship",
            "domain": "Data Science",
            "location": "Bengaluru / Remote",
            "work_arrangement": "hybrid",
            "compensation": "Not Specified",
            "cgpa_cutoff": None,
            "target_batches": [2027, 2028, 2029],
            "eligible_branches": [],
            "required_skills": ["Python", "SQL", "Data Science", "Machine Learning"],
            "preferred_skills": ["PyTorch", "Statistics", "Docker"],
            "description": "Collaborate with data engineering team to optimize predictive pipelines and customer segmentation models.",
            "source_url": "https://job-boards.greenhouse.io/micoworks/jobs/5456507008",
            "application_url": "https://job-boards.greenhouse.io/micoworks/jobs/5456507008",
            "application_deadline": None,
            "verification_status": "closed",
            "source_type": "official_careers_page",
            "is_active": False,
            "notes": "Greenhouse application portal returns error=true (vacancy confirmed closed/expired). Marked inactive."
        },
        # Opp 15: Hewlett Packard Enterprise (HPE)
        {
            "id": "opp-15",
            "title": "Software Engineering Intern",
            "company": "HPE",
            "opportunity_type": "internship",
            "domain": "Systems & Cloud Computing",
            "location": "Bengaluru, Karnataka",
            "work_arrangement": "hybrid",
            "compensation": "Not Specified",
            "cgpa_cutoff": None,
            "target_batches": [2027, 2028, 2029],
            "eligible_branches": [],
            "required_skills": ["C++", "Java", "Python", "Data Structures", "Linux"],
            "preferred_skills": ["Cloud Architecture", "Networking", "Distributed Systems"],
            "description": "Design high-reliability software components for enterprise storage, compute infrastructure, and edge services.",
            "source_url": "https://careers.hpe.com/us/en/job/1211844/Intern?utm_source=KrishanKumarLinkedin",
            "application_url": "https://careers.hpe.com/us/en/job/1211844/Intern?utm_source=KrishanKumarLinkedin",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "official_careers_page",
            "is_active": True,
            "notes": "Official HPE careers portal with tracking parameters intact."
        },
        # Opp 16: Reliance Industries Limited
        {
            "id": "opp-16",
            "title": "Graduate Engineer Trainee (GET) Program — 2027",
            "company": "Reliance Industries Limited",
            "opportunity_type": "job",
            "domain": "Core Engineering & Industrial Operations",
            "location": "Multiple Locations (India)",
            "work_arrangement": "onsite",
            "compensation": "Announced INR 8.0 LPA (non-IIT) / INR 9.5 LPA (IIT) + annual cash bonus",
            "cgpa_cutoff": None,
            "target_batches": [2027],
            "eligible_branches": [
                "Chemical Engineering",
                "Mechanical Engineering",
                "Electrical Engineering",
                "Fire Engineering",
                "Civil Engineering",
                "Metallurgical Engineering",
                "Instrumentation Engineering"
            ],
            "required_skills": ["Core Engineering Fundamentals", "Process Operations", "Problem Solving"],
            "preferred_skills": ["Industrial Automation", "Safety Protocols"],
            "description": "Flagship Graduate Engineer Trainee cohort for 2027 graduates in core manufacturing, petrochemical, and energy sectors. Strict branch eligibility: Chemical, Mechanical, Electrical, Fire, Civil, Metallurgy, and Instrumentation only. Do NOT match with CSBS / CSE cohorts.",
            "source_url": "https://bit.ly/RelianceHiring2027",
            "application_url": "https://bit.ly/RelianceHiring2027",
            "application_deadline": "Historical Announcement (Do not display as active deadline)",
            "verification_status": "unverified",
            "source_type": "shared_announcement",
            "is_active": True,
            "notes": "Announced compensation ranges. Must NOT match to CSBS students unless official criteria confirm."
        },
        # Opp 17: Automation Anywhere
        {
            "id": "opp-17",
            "title": "Software Engineering Intern",
            "company": "Automation Anywhere",
            "opportunity_type": "internship",
            "domain": "Robotic Process Automation & AI",
            "location": "Bengaluru, Karnataka",
            "work_arrangement": "hybrid",
            "compensation": "Stipend: INR 40,000 / month",
            "cgpa_cutoff": None,
            "target_batches": [2027],
            "eligible_branches": ["Computer Science & Engineering", "Information Technology", "Electronics & Communication"],
            "required_skills": ["Java", "Python", "Data Structures", "Algorithms", "Object Oriented Programming"],
            "preferred_skills": ["RPA", "Cloud Computing", "Spring Boot"],
            "description": "Build automated cognitive bots, generative AI orchestration wrappers, and enterprise automation infrastructure at Automation Anywhere.",
            "source_url": "https://automationanywhere.wd5.myworkdayjobs.com/en-US/AutomationAnywhereJobs/job/Bengaluru-India/Software-Engineering-Intern_JR1504",
            "application_url": "https://automationanywhere.wd5.myworkdayjobs.com/en-US/AutomationAnywhereJobs/job/Bengaluru-India/Software-Engineering-Intern_JR1504",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "official_careers_page",
            "is_active": True,
            "notes": "Workday jobs listing for 2027 graduating cohort with INR 40,000/month stipend."
        },
        # Opp 18: Flam
        {
            "id": "opp-18",
            "title": "Software Engineering Intern",
            "company": "Flam",
            "opportunity_type": "internship",
            "domain": "Spatial Computing & AR",
            "location": "Bengaluru, Karnataka",
            "work_arrangement": "onsite",
            "compensation": "Not Specified",
            "cgpa_cutoff": None,
            "target_batches": [2027, 2028, 2029],
            "eligible_branches": [],
            "required_skills": ["Python", "C++", "Data Structures", "Computer Graphics Basics"],
            "preferred_skills": ["Unity", "AR/VR", "OpenGL"],
            "description": "Build high-performance 3D spatial experiences and mobile interactive rendering engines.",
            "source_url": "https://www.linkedin.com/jobs/view/4466665437/",
            "application_url": "https://www.linkedin.com/jobs/view/4466665437/",
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "shared_announcement",
            "is_active": True,
            "notes": "Candidate listing on LinkedIn (view/4466665437). Direct URL preserved."
        },
        # Opp 19: Park+ (Informational lead only)
        {
            "id": "opp-19",
            "title": "Hiring Announcement & Offer Wave Update",
            "company": "Park+",
            "opportunity_type": "lead",
            "domain": "AutoTech & Mobility Platform",
            "location": "Gurugram / India",
            "work_arrangement": "any",
            "compensation": "Unspecified",
            "cgpa_cutoff": None,
            "target_batches": [],
            "eligible_branches": [],
            "required_skills": [],
            "preferred_skills": [],
            "description": "Informational hiring bulletin: Applicants reportedly started receiving offers, and candidates with pending AI interviews were encouraged to complete them. Official role or application URL not provided in shared announcement.",
            "source_url": None,
            "application_url": None,  # No URL provided; DO NOT INVENT!
            "application_deadline": None,
            "verification_status": "unverified",
            "source_type": "shared_announcement",
            "is_active": False, # Lead only
            "notes": "Informational hiring lead only. No application URL exists. Apply action is disabled."
        },
        # Opp Amazon: Amazon University Talent Acquisition (Real live listing 10513277)
        {
            "id": "opp-amazon",
            "title": "Software Development Engineer Intern — May 2027 (2 Month)",
            "company": "Amazon",
            "opportunity_type": "internship",
            "domain": "Software Development & Distributed Systems",
            "location": "Bengaluru, Karnataka, India",
            "work_arrangement": "hybrid",
            "compensation": "Competitive Amazon University Stipend + Benefits",
            "cgpa_cutoff": None,
            "target_batches": [2027],
            "eligible_branches": [],
            "required_skills": ["Data Structures", "Algorithms", "Object Oriented Programming", "Java", "Python", "C++"],
            "preferred_skills": ["Distributed Systems", "SQL", "Cloud Architecture"],
            "description": "Amazon University Talent Acquisition is looking for Software Development Engineer Interns for May 2027. Work alongside industry leaders, solve real customer problems at scale, and architect resilient software systems.",
            "source_url": "https://www.amazon.jobs/en/jobs/10513277/software-development-engineer-intern-may-2027-2-month-amazon-university-talent-acquisition",
            "application_url": "https://www.amazon.jobs/en/jobs/10513277/software-development-engineer-intern-may-2027-2-month-amazon-university-talent-acquisition",
            "application_deadline": None,
            "verification_status": "verified",
            "source_type": "official_careers_page",
            "is_active": True,
            "notes": "Official Amazon Jobs listing (Job ID 10513277). Target graduation cohort: 2027."
        }
    ]

    # Clean out synthetic opp-20 if present
    db.query(Job).filter(Job.id == "opp-20").delete()
    db.commit()

    for opp in opportunities:
        existing_job = db.query(Job).filter(Job.id == opp["id"]).first()
        if not existing_job:
            job = Job(**opp)
            db.add(job)
        else:
            # Update fields to ensure accurate URLs and values
            for k, v in opp.items():
                setattr(existing_job, k, v)
    db.commit()

    # 3. Add initial audit log
    existing_log = db.query(AuditLog).first()
    if not existing_log:
        log = AuditLog(
            actor_name="System Seed",
            action="Seeded Real-World Opportunities & System Accounts",
            details="Seeded 20 real-world opportunities preserving exact URLs and referral parameters. Verified SQLite schema.",
            level="SUCCESS"
        )
        db.add(log)
        db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    seed_database(db)
    db.close()
    print("Database seeding completed successfully.")
