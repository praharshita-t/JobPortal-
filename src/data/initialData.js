export const initialStudents = [
  {
    id: "std-101",
    name: "Aarav Sharma",
    rollNo: "22CS089",
    department: "Computer Science & Engineering",
    graduationYear: 2026,
    cgpa: 8.85,
    backlogs: 0,
    consentApproved: true,
    consentTimestamp: "2026-01-14T09:30:00Z",
    profileCompletion: 88,
    phone: "+91 98765 43210",
    email: "aarav.sharma@campus.edu",
    avatar: "AS",
    skills: [
      "Python",
      "PyTorch",
      "Distributed Systems",
      "React",
      "SQL",
      "Docker",
      "FastAPI",
      "C++",
      "Kafka",
      "Data Structures"
    ],
    missingGoals: ["Kubernetes", "AWS CloudFormation", "GraphQL"],
    projects: [
      {
        id: "p1",
        title: "High-Throughput Vector Search Pipeline",
        tech: ["PyTorch", "Python", "FastAPI", "Docker"],
        description: "Engineered a low-latency approximate nearest neighbor (ANN) search engine achieving <12ms query latency across 2M high-dimensional text embeddings.",
        repo: "github.com/aaravsharma/vector-ann-engine"
      },
      {
        id: "p2",
        title: "Distributed Stream Processing Engine",
        tech: ["Kafka", "Distributed Systems", "C++"],
        description: "Implemented an event-driven consensus log based on Raft with automated partition rebalancing handling 45,000 events/sec.",
        repo: "github.com/aaravsharma/distributed-raft-stream"
      }
    ],
    preferredLocations: ["Bengaluru", "Hyderabad", "Gurugram"],
    targetRoles: ["Machine Learning Systems", "Backend Platform", "Distributed Infrastructure"],
    appliedJobIds: ["job-001"],
    activityTimeline: [
      {
        id: "act-1",
        type: "shortlist",
        title: "Interview Shortlist: Databricks",
        detail: "Recruiter reviewed your project 'High-Throughput Vector Search Pipeline' and scheduled Round 1 Technical Screening.",
        timestamp: "2 hours ago",
        badge: "Shortlisted"
      },
      {
        id: "act-2",
        type: "match",
        title: "New 92% Match: Razorpay Backend Platform",
        detail: "Matching engine identified high overlap with Kafka and Distributed Systems.",
        timestamp: "Yesterday, 4:15 PM",
        badge: "New Match"
      },
      {
        id: "act-3",
        type: "verification",
        title: "Academic Registry Verified",
        detail: "CGPA 8.85 and 0 active backlogs authenticated via Placement Office Registrar.",
        timestamp: "3 days ago",
        badge: "Verified"
      },
      {
        id: "act-4",
        type: "consent",
        title: "Consent Directive 2026 Executed",
        detail: "Consent granted for Tier-1 technology companies. Contact details remain redacted until offer release.",
        timestamp: "Oct 12, 2026",
        badge: "Consent Active"
      }
    ]
  },
  {
    id: "std-102",
    name: "Ananya Iyer",
    rollNo: "22IT044",
    department: "Information Technology",
    graduationYear: 2026,
    cgpa: 9.12,
    backlogs: 0,
    consentApproved: true,
    consentTimestamp: "2026-01-15T11:00:00Z",
    profileCompletion: 95,
    email: "ananya.iyer@campus.edu",
    avatar: "AI",
    skills: ["Go", "Distributed Systems", "PostgreSQL", "Kafka", "Docker", "Kubernetes", "System Design", "Python", "Data Structures"],
    missingGoals: ["PyTorch", "GraphQL"],
    projects: [
      {
        id: "p3",
        title: "Distributed Fault-Tolerant Key-Value Store",
        tech: ["Go", "Distributed Systems", "Docker"],
        description: "Implemented a Raft-backed key-value store with linearizable read guarantees and dynamic membership reconfigurations."
      }
    ],
    preferredLocations: ["Bengaluru", "Pune"],
    targetRoles: ["Backend Platform Engineer", "Systems Infrastructure"],
    appliedJobIds: ["job-002"]
  },
  {
    id: "std-103",
    name: "Vikram Aditya",
    rollNo: "22EC012",
    department: "Electronics & Communication",
    graduationYear: 2026,
    cgpa: 7.90,
    backlogs: 0,
    consentApproved: true,
    consentTimestamp: "2026-01-18T14:20:00Z",
    profileCompletion: 80,
    email: "vikram.aditya@campus.edu",
    avatar: "VA",
    skills: ["C++", "Linux Internals", "Networking", "Python", "Docker", "Data Structures"],
    missingGoals: ["Distributed Systems", "Kubernetes"],
    projects: [
      {
        id: "p4",
        title: "Kernel-level Packet Filter via eBPF",
        tech: ["C++", "Linux Internals", "Networking"],
        description: "Designed a high-throughput network firewall module discarding malicious SYN packets at wire speed."
      }
    ],
    preferredLocations: ["Bengaluru", "Chennai"],
    targetRoles: ["Systems Infrastructure Engineer"]
  },
  {
    id: "std-104",
    name: "Sneha Patel",
    rollNo: "22CS105",
    department: "Computer Science & Engineering",
    graduationYear: 2026,
    cgpa: 8.45,
    backlogs: 0,
    consentApproved: true,
    consentTimestamp: "2026-01-20T16:00:00Z",
    profileCompletion: 90,
    email: "sneha.patel@campus.edu",
    avatar: "SP",
    skills: ["React", "TypeScript", "SQL", "FastAPI", "Data Structures", "Node.js", "Docker"],
    missingGoals: ["Distributed Systems", "Kubernetes"],
    projects: [
      {
        id: "p5",
        title: "Real-time Collaborative Whiteboard",
        tech: ["React", "TypeScript", "WebSocket"],
        description: "Built canvas synchronization engine supporting 50 concurrent editors with CRDT conflict resolution."
      }
    ],
    preferredLocations: ["Bengaluru", "Mumbai"],
    targetRoles: ["Full Stack Product Engineer"]
  },
  {
    id: "std-105",
    name: "Rohan Deshmukh",
    rollNo: "22DS019",
    department: "Data Science & AI",
    graduationYear: 2026,
    cgpa: 8.60,
    backlogs: 0,
    consentApproved: false, // Consent pending
    consentTimestamp: null,
    profileCompletion: 65,
    email: "rohan.deshmukh@campus.edu",
    avatar: "RD",
    skills: ["Python", "PyTorch", "SQL", "Data Structures", "Statistics"],
    missingGoals: ["Docker", "Distributed Systems"],
    projects: [],
    preferredLocations: ["Bengaluru", "Pune"],
    targetRoles: ["Data Intelligence Associate", "Machine Learning"]
  },
  {
    id: "std-106",
    name: "Meera Nambiar",
    rollNo: "22CS072",
    department: "Computer Science & Engineering",
    graduationYear: 2026,
    cgpa: 8.95,
    backlogs: 0,
    consentApproved: true,
    consentTimestamp: "2026-01-11T10:00:00Z",
    profileCompletion: 92,
    email: "meera.nambiar@campus.edu",
    avatar: "MN",
    skills: ["Application Security", "Python", "Cryptography", "OWASP", "Cloud Security", "Docker", "Linux Internals", "C++"],
    missingGoals: ["Kubernetes", "Kafka"],
    projects: [
      {
        id: "p6",
        title: "Automated JWT Vulnerability Scanner",
        tech: ["Python", "Cryptography", "OWASP"],
        description: "Static and dynamic analysis tool identifying misconfigured algorithm headers and signature bypass flaws."
      }
    ],
    preferredLocations: ["Bengaluru", "Hyderabad"],
    targetRoles: ["Security Engineer (AppSec)"]
  }
];

export const initialJobs = [
  {
    id: "opp-amazon",
    title: "Software Development Engineer Intern — May 2027 (2 Month)",
    company: "Amazon",
    opportunity_type: "internship",
    domain: "Software Development & Distributed Systems",
    location: "Bengaluru, Karnataka, India",
    work_arrangement: "hybrid",
    compensation: "Competitive Amazon University Stipend + Benefits",
    cgpa_cutoff: null,
    target_batches: [2027],
    eligible_branches: [],
    required_skills: ["Data Structures", "Algorithms", "Object Oriented Programming", "Java", "Python", "C++"],
    preferred_skills: ["Distributed Systems", "SQL", "Cloud Architecture"],
    description: "Amazon University Talent Acquisition is looking for Software Development Engineer Interns for May 2027. Work alongside industry leaders, solve real customer problems at scale, and architect resilient software systems.",
    source_url: "https://www.amazon.jobs/en/jobs/10513277/software-development-engineer-intern-may-2027-2-month-amazon-university-talent-acquisition",
    application_url: "https://www.amazon.jobs/en/jobs/10513277/software-development-engineer-intern-may-2027-2-month-amazon-university-talent-acquisition",
    verification_status: "verified",
    source_type: "official_careers_page",
    is_active: true,
    notes: "Official Amazon Jobs listing (Job ID 10513277). Target graduation cohort: 2027."
  },
  {
    id: "opp-02",
    title: "Software Engineering Intern",
    company: "Red Hat",
    opportunity_type: "internship",
    domain: "Open Source Systems & Cloud",
    location: "Bengaluru & Pune, India",
    work_arrangement: "hybrid",
    compensation: "Not Specified in Announcement",
    cgpa_cutoff: null,
    target_batches: [2027],
    eligible_branches: [],
    required_skills: ["Linux", "Python", "Go", "Git"],
    preferred_skills: ["Kubernetes", "OpenShift", "Containers"],
    description: "Contribute to enterprise Linux, container virtualization, and cloud infrastructure platforms across Red Hat engineering offices.",
    source_url: "https://redhat.wd5.myworkdayjobs.com/jobs/job/Pune---Tower-6/Software-Engineering-Intern_R-058560",
    application_url: "https://redhat.wd5.myworkdayjobs.com/jobs/job/Pune---Tower-6/Software-Engineering-Intern_R-058560",
    verification_status: "verified",
    source_type: "official_careers_page",
    is_active: true,
    notes: "Eligible graduation cohort: 2027. Official workday careers page."
  },
  {
    id: "opp-01",
    title: "Energy Tech Hackathon",
    company: "Schneider Electric",
    opportunity_type: "hackathon",
    domain: "Energy & Sustainability Tech",
    location: "India (Hybrid / Virtual)",
    work_arrangement: "any",
    compensation: "INR 45 Lakh Prize Pool + Pre-Placement Interviews + SE Ventures",
    cgpa_cutoff: null,
    target_batches: [],
    eligible_branches: [],
    required_skills: [],
    preferred_skills: ["Energy Systems", "IoT", "AI", "Sustainability"],
    description: "Innovate for the future of sustainable energy infrastructure. Chance of pre-placement interviews, executive mentorship, and corporate venture capital access.",
    source_url: "https://bit.ly/EnergyTechHackathon",
    application_url: "https://bit.ly/EnergyTechHackathon",
    verification_status: "unverified",
    source_type: "shared_announcement",
    is_active: true,
    notes: "Shared announcement; eligibility is open to all college students."
  },
  {
    id: "opp-17",
    title: "Software Engineering Intern",
    company: "Automation Anywhere",
    opportunity_type: "internship",
    domain: "Robotic Process Automation & AI",
    location: "Bengaluru, Karnataka",
    work_arrangement: "hybrid",
    compensation: "Stipend: INR 40,000 / month",
    cgpa_cutoff: null,
    target_batches: [2027],
    eligible_branches: ["Computer Science & Engineering", "Information Technology", "Electronics & Communication"],
    required_skills: ["Java", "Python", "Data Structures", "Algorithms", "Object Oriented Programming"],
    preferred_skills: ["RPA", "Cloud Computing", "Spring Boot"],
    description: "Build automated cognitive bots, generative AI orchestration wrappers, and enterprise automation infrastructure at Automation Anywhere.",
    source_url: "https://automationanywhere.wd5.myworkdayjobs.com/en-US/AutomationAnywhereJobs/job/Bengaluru-India/Software-Engineering-Intern_JR1504",
    application_url: "https://automationanywhere.wd5.myworkdayjobs.com/en-US/AutomationAnywhereJobs/job/Bengaluru-India/Software-Engineering-Intern_JR1504",
    verification_status: "verified",
    source_type: "official_careers_page",
    is_active: true,
    notes: "Workday jobs listing for 2027 graduating cohort with INR 40,000/month stipend."
  },
  {
    id: "opp-15",
    title: "Software Engineering Intern",
    company: "HPE",
    opportunity_type: "internship",
    domain: "Systems & Cloud Computing",
    location: "Bengaluru, Karnataka",
    work_arrangement: "hybrid",
    compensation: "Not Specified",
    cgpa_cutoff: null,
    target_batches: [2027, 2028, 2029],
    eligible_branches: [],
    required_skills: ["C++", "Java", "Python", "Data Structures", "Linux"],
    preferred_skills: ["Cloud Architecture", "Networking", "Distributed Systems"],
    description: "Design high-reliability software components for enterprise storage, compute infrastructure, and edge services.",
    source_url: "https://careers.hpe.com/us/en/job/1211844/Intern?utm_source=KrishanKumarLinkedin",
    application_url: "https://careers.hpe.com/us/en/job/1211844/Intern?utm_source=KrishanKumarLinkedin",
    verification_status: "verified",
    source_type: "official_careers_page",
    is_active: true,
    notes: "Official HPE careers portal with tracking parameters intact."
  },
  {
    id: "opp-18",
    title: "Software Engineering Intern",
    company: "Flam",
    opportunity_type: "internship",
    domain: "Spatial Computing & AR",
    location: "Bengaluru, Karnataka",
    work_arrangement: "onsite",
    compensation: "Not Specified",
    cgpa_cutoff: null,
    target_batches: [2027, 2028, 2029],
    eligible_branches: [],
    required_skills: ["Python", "C++", "Data Structures", "Computer Graphics Basics"],
    preferred_skills: ["Unity", "AR/VR", "OpenGL"],
    description: "Build high-performance 3D spatial experiences and mobile interactive rendering engines.",
    source_url: "https://www.linkedin.com/jobs/view/4466665437/",
    application_url: "https://www.linkedin.com/jobs/view/4466665437/",
    verification_status: "unverified",
    source_type: "shared_announcement",
    is_active: true,
    notes: "Candidate listing on LinkedIn (view/4466665437). Direct URL preserved."
  },
  {
    id: "opp-16",
    title: "Graduate Engineer Trainee (GET) Program — 2027",
    company: "Reliance Industries Limited",
    opportunity_type: "job",
    domain: "Core Engineering & Industrial Operations",
    location: "Multiple Locations (India)",
    work_arrangement: "onsite",
    compensation: "Announced INR 8.0 LPA (non-IIT) / INR 9.5 LPA (IIT) + annual cash bonus",
    cgpa_cutoff: null,
    target_batches: [2027],
    eligible_branches: [
      "Chemical Engineering",
      "Mechanical Engineering",
      "Electrical Engineering",
      "Fire Engineering",
      "Civil Engineering",
      "Metallurgical Engineering",
      "Instrumentation Engineering"
    ],
    required_skills: ["Core Engineering Fundamentals", "Process Operations", "Problem Solving"],
    preferred_skills: ["Industrial Automation", "Safety Protocols"],
    description: "Flagship Graduate Engineer Trainee cohort for 2027 graduates in core manufacturing, petrochemical, and energy sectors. Strict branch eligibility: Chemical, Mechanical, Electrical, Fire, Civil, Metallurgy, and Instrumentation only. Do NOT match with CSBS / CSE cohorts.",
    source_url: "https://bit.ly/RelianceHiring2027",
    application_url: "https://bit.ly/RelianceHiring2027",
    verification_status: "unverified",
    source_type: "shared_announcement",
    is_active: true,
    notes: "Announced compensation ranges. Must NOT match to CSBS students unless official criteria confirm."
  },
  {
    id: "opp-19",
    title: "Hiring Announcement & Offer Wave Update",
    company: "Park+",
    opportunity_type: "lead",
    domain: "AutoTech & Mobility Platform",
    location: "Gurugram / India",
    work_arrangement: "any",
    compensation: "Unspecified",
    cgpa_cutoff: null,
    target_batches: [],
    eligible_branches: [],
    required_skills: [],
    preferred_skills: [],
    description: "Informational hiring bulletin: Applicants reportedly started receiving offers, and candidates with pending AI interviews were encouraged to complete them. Official role or application URL not provided in shared announcement.",
    source_url: null,
    application_url: null,
    verification_status: "unverified",
    source_type: "shared_announcement",
    is_active: false,
    notes: "Informational hiring lead only. No application URL exists. Apply action is disabled."
  },
  {
    id: "opp-14",
    title: "Data Science Intern",
    company: "Mico",
    opportunity_type: "internship",
    domain: "Data Science",
    location: "Bengaluru / Remote",
    work_arrangement: "hybrid",
    compensation: "Not Specified",
    cgpa_cutoff: null,
    target_batches: [2027, 2028, 2029],
    eligible_branches: [],
    required_skills: ["Python", "SQL", "Data Science", "Machine Learning"],
    preferred_skills: ["PyTorch", "Statistics", "Docker"],
    description: "Collaborate with data engineering team to optimize predictive pipelines and customer segmentation models.",
    source_url: "https://job-boards.greenhouse.io/micoworks/jobs/5456507008",
    application_url: "https://job-boards.greenhouse.io/micoworks/jobs/5456507008",
    verification_status: "closed",
    source_type: "official_careers_page",
    is_active: false,
    notes: "Greenhouse application portal returns error=true (vacancy confirmed closed/expired). Marked inactive."
  }
];

export const initialWorkflowStages = [
  {
    id: "stage-1",
    index: 1,
    name: "Job Created",
    summary: "18 vacancies synchronized from authorized corporate portal.",
    status: "completed",
    lastRun: "2026-10-22 09:15 AM",
    itemsCount: 18,
    details: "All 18 active recruitment vacancies validated with formal job descriptions, CTC disclosures, and eligibility criteria."
  },
  {
    id: "stage-2",
    index: 2,
    name: "Matching Engine",
    summary: "482 candidate-job vectors computed via multi-dimensional relevance matrix.",
    status: "completed",
    lastRun: "2026-10-22 09:18 AM",
    itemsCount: 482,
    details: "Relevance scores generated using skill overlap (50%), verified project evidence (20%), academic index (15%), and preferred domains (15%)."
  },
  {
    id: "stage-3",
    index: 3,
    name: "Eligibility Validation",
    summary: "Automated registrar verification against active backlogs & department policies.",
    status: "completed",
    lastRun: "2026-10-22 09:20 AM",
    itemsCount: 479,
    flaggedCount: 3,
    details: "3 candidates flagged for branch mismatch or CGPA boundary criteria. Flags isolated without blocking eligible cohort."
  },
  {
    id: "stage-4",
    index: 4,
    name: "Email Preview & Idempotency",
    summary: "412 personalized notifications staged. 0 duplicates detected.",
    status: "active",
    lastRun: "2026-10-22 09:22 AM",
    itemsCount: 412,
    details: "Idempotency hash verification passed. Email templates populated with student-specific match rationale."
  },
  {
    id: "stage-5",
    index: 5,
    name: "Recruiter Shortlist",
    summary: "15 consent-cleared candidate dossiers made accessible to partner recruiters.",
    status: "in_progress",
    lastRun: "2026-10-22 09:30 AM",
    itemsCount: 15,
    details: "Only students with verified consent and 100% eligibility criteria exposed. PII protected under Placement Privacy Guidelines."
  }
];

export const initialNotifications = [
  {
    id: "notif-001",
    type: "Opportunity Match",
    subject: "New High Relevance Match: Databricks Machine Learning Systems Engineer",
    recipientName: "Aarav Sharma",
    recipientEmail: "aarav.sharma@campus.edu",
    jobId: "job-001",
    jobTitle: "Machine Learning Systems Engineer",
    company: "Databricks",
    matchScore: 94,
    status: "Delivered",
    deliveryTimestamp: "2026-10-22 09:25 AM",
    idempotencyKey: "HASH-NOTIF-2026-1001-AARAV",
    duplicateStatus: "Clean (0 duplicates)",
    bodyPreview: "Hello Aarav, CampusMatch AI has identified a 94% alignment between your verified profile and Databricks. Your experience in PyTorch and Distributed Systems directly matches their core tech stack...",
    fullHtml: `
<div style="font-family: 'Inter', -apple-system, sans-serif; color: #18181B; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #D8CEF8; border-radius: 8px; overflow: hidden; background: #FFFFFF;">
  <div style="background: #FAFAFA; padding: 24px 32px; border-bottom: 2px solid #BC87F5;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-family: 'Instrument Serif', Georgia, serif; font-size: 26px; font-weight: bold; color: #18181B; letter-spacing: -0.5px;">CampusMatch <span style="color: #BC87F5;">AI</span></span>
      <span style="background: #C2E4D9; color: #2A6858; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">Verified Placement Alert</span>
    </div>
  </div>
  <div style="padding: 32px;">
    <p style="font-size: 15px; margin-top: 0;">Dear <strong>Aarav Sharma</strong>,</p>
    <p style="font-size: 14px; color: #3F3F46;">The placement intelligence engine has detected a high-affinity vacancy that aligns directly with your verified skills and academic record.</p>
    
    <div style="background: #E4DEFC; border-left: 4px solid #BC87F5; padding: 20px; border-radius: 4px; margin: 24px 0;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h3 style="margin: 0 0 4px 0; font-size: 18px; color: #18181B;">Machine Learning Systems Engineer</h3>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #5B21B6;">Databricks &bull; Bengaluru (Hybrid)</p>
        </div>
        <div style="text-align: right;">
          <span style="background: #18181B; color: #FFFFFF; font-size: 16px; font-weight: 700; padding: 6px 12px; border-radius: 6px; display: inline-block;">94% Match</span>
        </div>
      </div>
      <div style="margin-top: 14px; font-size: 13px; color: #3F3F46;">
        <div><strong>CTC Package:</strong> INR 32.0 LPA + Relocation Allowance</div>
        <div><strong>Application Deadline:</strong> November 04, 2026</div>
        <div><strong>Eligibility Check:</strong> 100% Passed (CGPA 8.85 vs 8.50 Cutoff)</div>
      </div>
    </div>

    <h4 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #71717A; margin-bottom: 8px;">Why You Matched:</h4>
    <ul style="font-size: 13px; color: #3F3F46; padding-left: 20px; margin-top: 0;">
      <li>5 of 5 core required skills matched: <em>PyTorch, Distributed Systems, Python, C++, Docker</em>.</li>
      <li>Evidence found in your repository: <em>High-Throughput Vector Search Pipeline</em>.</li>
      <li>Placement Consent 2026 is fully active on your student profile.</li>
    </ul>

    <div style="margin-top: 28px; text-align: center;">
      <a href="https://campusmatch.placement.university.edu/drives/databricks-mls-2026" style="background: #BC87F5; color: #18181B; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px; display: inline-block; box-shadow: 2px 2px 0px #18181B;">Inspect Match & Apply &rarr;</a>
    </div>

    <div style="border-top: 1px solid #E5E7EB; margin-top: 36px; padding-top: 16px; font-size: 11px; color: #9CA3AF;">
      <p style="margin: 0;">This communication was automatically generated by CampusMatch AI for verified student ID 22CS089. No third-party data broker access permitted.</p>
      <p style="margin: 4px 0 0 0;">Idempotency Hash: HASH-NOTIF-2026-1001-AARAV | Delivery Node: IN-BLR-01</p>
    </div>
  </div>
</div>
`
  },
  {
    id: "notif-002",
    type: "Recruiter Shortlist",
    subject: "Candidate Dossier Access Granted: Aarav Sharma",
    recipientName: "Priya Nair (Google/Databricks Recruiter)",
    recipientEmail: "p.nair@recruiting-partner.com",
    jobId: "job-001",
    jobTitle: "Machine Learning Systems Engineer",
    company: "Databricks",
    matchScore: 94,
    status: "Delivered",
    deliveryTimestamp: "2026-10-22 09:28 AM",
    idempotencyKey: "HASH-NOTIF-2026-1002-RECRUITER",
    duplicateStatus: "Clean (0 duplicates)",
    bodyPreview: "Hello Priya, Placement Operations has approved candidate dossier access for Aarav Sharma (Match Score: 94%). Student consent verified under placement bylaws...",
    fullHtml: `
<div style="font-family: 'Inter', -apple-system, sans-serif; color: #18181B; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #D8CEF8; border-radius: 8px; overflow: hidden; background: #FFFFFF;">
  <div style="background: #FAFAFA; padding: 24px 32px; border-bottom: 2px solid #BC87F5;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-family: 'Instrument Serif', Georgia, serif; font-size: 26px; font-weight: bold; color: #18181B; letter-spacing: -0.5px;">CampusMatch <span style="color: #BC87F5;">AI</span></span>
      <span style="background: #E4DEFC; color: #5B21B6; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 4px;">Recruiter Shortlist Dossier</span>
    </div>
  </div>
  <div style="padding: 32px;">
    <p style="font-size: 15px; margin-top: 0;">Dear <strong>Priya Nair</strong>,</p>
    <p style="font-size: 14px; color: #3F3F46;">The University Placement Directorate has cleared candidate dossier access for your active requisition: <strong>Machine Learning Systems Engineer</strong>.</p>
    
    <div style="background: #FAFAFA; border: 1px solid #E5E7EB; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <div style="font-size: 16px; font-weight: 700; color: #18181B;">Aarav Sharma (B.Tech CSE '26)</div>
      <div style="font-size: 13px; color: #6B7280; margin-top: 4px;">Verified CGPA: 8.85 / 10.0 &bull; 0 Active Backlogs</div>
      <div style="margin-top: 12px; display: inline-block; background: #C2E4D9; color: #2A6858; font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 4px;">Consent Verified: Active</div>
    </div>

    <p style="font-size: 13px; color: #4B5563;">You may now view the candidate's verified GitHub project artifacts and schedule Round 1 Technical Screening directly via your Recruiter Dashboard.</p>
  </div>
</div>
`
  },
  {
    id: "notif-003",
    type: "Eligibility Alert",
    subject: "Action Notice: Razorpay Platform Engineer Registration Open",
    recipientName: "Aarav Sharma",
    recipientEmail: "aarav.sharma@campus.edu",
    jobId: "job-002",
    jobTitle: "Backend Platform Engineer",
    company: "Razorpay",
    matchScore: 92,
    status: "Delivered",
    deliveryTimestamp: "2026-10-21 04:15 PM",
    idempotencyKey: "HASH-NOTIF-2026-1003-AARAV",
    duplicateStatus: "Clean (0 duplicates)",
    bodyPreview: "Razorpay campus drive registration is now live. Your match score is 92%. Minimum CGPA 8.0 requirement met...",
    fullHtml: `
<div style="font-family: 'Inter', -apple-system, sans-serif; color: #18181B; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #D8CEF8; border-radius: 8px; overflow: hidden; background: #FFFFFF;">
  <div style="padding: 32px;">
    <h3 style="font-family: 'Instrument Serif', Georgia, serif; font-size: 24px; margin-top: 0;">Razorpay Drive Registration Open</h3>
    <p style="font-size: 14px; color: #3F3F46;">Your profile satisfies all eligibility benchmarks (CGPA 8.85 vs 8.00 Cutoff). Kafka and Distributed Systems skill indicators matched.</p>
  </div>
</div>
`
  },
  {
    id: "notif-004",
    type: "Placement Broadcast",
    subject: "Policy Advisory: Tier-1 Dream Company Consent Deadlines",
    recipientName: "All 2026 Graduating Students",
    recipientEmail: "batch2026@campus.edu",
    jobId: null,
    jobTitle: "General Advisory",
    company: "Placement Office",
    matchScore: null,
    status: "Delivered",
    deliveryTimestamp: "2026-10-20 10:00 AM",
    idempotencyKey: "HASH-NOTIF-2026-1004-BROADCAST",
    duplicateStatus: "Suppressed 4 duplicate dispatches",
    bodyPreview: "All graduating candidates must review their Consent Directive 2026 preferences. Candidates with unconfirmed consent will not be released to recruiter shortlists...",
    fullHtml: `
<div style="font-family: 'Inter', -apple-system, sans-serif; color: #18181B; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #D8CEF8; border-radius: 8px; overflow: hidden; background: #FFFFFF;">
  <div style="padding: 32px;">
    <h3 style="font-family: 'Instrument Serif', Georgia, serif; font-size: 24px; margin-top: 0;">Placement Office Policy Advisory</h3>
    <p style="font-size: 14px; color: #3F3F46;">Reminder: Consent status controls recruiter visibility. Verify your consent directive before November 1st.</p>
  </div>
</div>
`
  }
];

export const initialAdminAuditLog = [
  {
    id: "log-1",
    timestamp: "2026-10-22 09:30:14",
    user: "System (Automation Engine)",
    action: "Cron Batch Cycle #148 Executed",
    details: "Evaluated 18 active jobs against 482 students. 412 match notifications queued.",
    level: "INFO"
  },
  {
    id: "log-2",
    timestamp: "2026-10-22 09:20:05",
    user: "Dr. Rajesh Sen (Admin)",
    action: "Vacancy Approved: Databricks MLS-2026",
    details: "Validated INR 32 LPA CTC document and minimum CGPA threshold 8.5.",
    level: "SUCCESS"
  },
  {
    id: "log-3",
    timestamp: "2026-10-22 09:12:44",
    user: "System (Consent Validator)",
    action: "Consent Check: 6 Profiles Suppressed",
    details: "Unconsented candidate profiles withheld from partner recruiter feeds.",
    level: "SECURITY"
  },
  {
    id: "log-4",
    timestamp: "2026-10-22 08:45:00",
    user: "Priya Nair (Recruiter)",
    action: "Candidate Dossier Download Request",
    details: "Authorized download of 14 consent-approved dossiers for Databricks MLS drive.",
    level: "AUDIT"
  }
];
