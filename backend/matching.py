from typing import Dict, Any, List
from .models import StudentProfile, Job

def calculate_profile_completion(profile: StudentProfile) -> Dict[str, Any]:
    fields = [
        ("phone", bool(profile.phone)),
        ("current_city", bool(profile.current_city)),
        ("college", bool(profile.college)),
        ("degree", bool(profile.degree)),
        ("branch", bool(profile.branch)),
        ("graduation_year", profile.graduation_year is not None),
        ("cgpa", profile.cgpa is not None),
        ("skills", bool(profile.skills and len(profile.skills) > 0)),
        ("projects", bool(profile.projects and len(profile.projects) > 0)),
        ("preferred_roles", bool(profile.preferred_roles and len(profile.preferred_roles) > 0)),
        ("preferred_locations", bool(profile.preferred_locations and len(profile.preferred_locations) > 0)),
    ]

    completed = [f[0] for f in fields if f[1]]
    missing = [f[0] for f in fields if not f[1]]
    percentage = int((len(completed) / len(fields)) * 100)

    # Basic threshold to perform matching: graduation_year, branch, or skills must exist
    can_match = bool(profile.skills or profile.graduation_year or profile.branch)

    return {
        "completion_percentage": percentage,
        "completed_fields": completed,
        "missing_fields": missing,
        "can_match": can_match
    }

def evaluate_job_match(profile: StudentProfile, job: Job) -> Dict[str, Any]:
    """
    Deterministic matching engine executing:
    1. Independent Mandatory Eligibility Gating
    2. Unknown / Review-required criteria identification
    3. Mathematical 100-point component breakdown
    4. Project evidence extraction from authenticated profile
    5. Actionable preparation suggestions
    """
    eligibility_failures = []
    unknown_criteria = []

    # Check student matching consent
    if not profile.consent_matching:
        eligibility_failures.append("Student has opted out of automated job matching in privacy settings.")

    # 1. CGPA Check
    if job.cgpa_cutoff is not None:
        if profile.cgpa is None:
            unknown_criteria.append(f"Student CGPA is not set in profile (Job requires minimum {job.cgpa_cutoff:.2f}).")
        else:
            # Normalize student CGPA to 10.0 scale if different
            normalized_student_cgpa = (profile.cgpa / (profile.cgpa_scale or 10.0)) * 10.0
            if normalized_student_cgpa < job.cgpa_cutoff:
                eligibility_failures.append(
                    f"CGPA Cutoff Unmet: Requires minimum {job.cgpa_cutoff:.2f}. Verified current CGPA is {normalized_student_cgpa:.2f}."
                )

    # 2. Graduation Batch Check
    if job.target_batches and len(job.target_batches) > 0:
        if profile.graduation_year is None:
            unknown_criteria.append(f"Student graduation year is unset (Job requires Class of {', '.join(map(str, job.target_batches))}).")
        elif profile.graduation_year not in job.target_batches:
            eligibility_failures.append(
                f"Graduation Cohort Unmet: Role is restricted to Class of {', '.join(map(str, job.target_batches))}. Student cohort is {profile.graduation_year}."
            )

    # 3. Branch / Department Check
    if job.eligible_branches and len(job.eligible_branches) > 0:
        if not profile.branch:
            unknown_criteria.append(f"Student branch is unset (Job requires {', '.join(job.eligible_branches)}).")
        else:
            # Special check for Reliance: Do not match to CSBS / CSE unless explicitly accepted
            student_branch_lower = profile.branch.lower().strip()
            branch_matched = any(
                b.lower().strip() in student_branch_lower or student_branch_lower in b.lower().strip()
                for b in job.eligible_branches
            )
            if not branch_matched:
                eligibility_failures.append(
                    f"Department Ineligible: Role restricted to {', '.join(job.eligible_branches)}. Current branch is {profile.branch}."
                )

    # 4. Backlog Policy
    if profile.backlogs > 0 and job.opportunity_type in ["job", "internship"]:
        eligibility_failures.append(
            f"Active Backlogs Policy: Candidate has {profile.backlogs} recorded active academic backlogs."
        )

    # Determine eligibility status
    if len(eligibility_failures) > 0:
        is_eligible = False
        eligibility_status = "FAILED_CRITERIA"
    elif len(unknown_criteria) > 0:
        is_eligible = False
        eligibility_status = "REVIEW_REQUIRED"
    else:
        is_eligible = True
        eligibility_status = "ELIGIBLE"

    # --- 2. Relevance Score Calculation (100 Point Model) ---
    student_skills = [s.lower().strip() for s in (profile.skills or [])]
    required_skills = job.required_skills or []
    preferred_skills = job.preferred_skills or []

    # Required Skills Overlap (Weight: 50 max points)
    matching_required = []
    missing_skills = []
    for req in required_skills:
        req_clean = req.lower().strip()
        if any(req_clean == s or req_clean in s or s in req_clean for s in student_skills):
            matching_required.append(req)
        else:
            missing_skills.append(req)

    if len(required_skills) > 0:
        required_score = int((len(matching_required) / len(required_skills)) * 50)
    else:
        # Hackathon or role with no mandatory skills: give baseline 45
        required_score = 45

    # Preferred Skills Overlap (Weight: 15 max points)
    matching_preferred = []
    for pref in preferred_skills:
        pref_clean = pref.lower().strip()
        if any(pref_clean == s or pref_clean in s or s in pref_clean for s in student_skills):
            matching_preferred.append(pref)

    if len(preferred_skills) > 0:
        preferred_score = int((len(matching_preferred) / len(preferred_skills)) * 15)
    else:
        preferred_score = 10

    # Project Artifact Evidence (Weight: 20 max points)
    project_evidence = []
    all_job_skills = [s.lower().strip() for s in (required_skills + preferred_skills)]

    for proj in (profile.projects or []):
        proj_title = proj.get("title", "")
        proj_desc = proj.get("description", "")
        proj_tech = [t.lower().strip() for t in proj.get("technologies", [])]
        proj_corpus = f"{proj_title} {proj_desc}".lower()

        matched_in_proj = []
        for j_skill in all_job_skills:
            if j_skill in proj_tech or j_skill in proj_corpus:
                matched_in_proj.append(j_skill.capitalize())

        if matched_in_proj:
            project_evidence.append({
                "project_title": proj_title,
                "matched_tech": list(set(matched_in_proj)),
                "description": proj_desc,
                "project_url": proj.get("project_url")
            })

    if len(project_evidence) >= 2:
        project_evidence_score = 20
    elif len(project_evidence) == 1:
        project_evidence_score = 14
    elif (profile.projects or []):
        project_evidence_score = 8
    else:
        project_evidence_score = 0

    # Academic Cohort Standing (Weight: 15 max points)
    if profile.cgpa is not None:
        normalized_cgpa = (profile.cgpa / (profile.cgpa_scale or 10.0)) * 10.0
        academic_score = int(max(4, min(15, ((normalized_cgpa - 6.0) / 4.0) * 15)))
    else:
        academic_score = 8

    # Role Preference & Location bonus (Up to +5 cap)
    pref_bonus = 0
    if profile.preferred_roles and any(r.lower() in job.title.lower() for r in profile.preferred_roles):
        pref_bonus += 3
    if profile.work_arrangement in ["any", job.work_arrangement]:
        pref_bonus += 2

    raw_relevance = required_score + preferred_score + project_evidence_score + academic_score + pref_bonus
    relevance_score = min(99, max(20, raw_relevance))

    # --- 3. Actionable Preparation Suggestions ---
    preparation_suggestions = []
    if missing_skills:
        preparation_suggestions.append({
            "type": "skill_gap",
            "title": f"Target Essential Gap: {missing_skills[0]}",
            "action": f"Acquire practical implementation experience in {', '.join(missing_skills[:2])} before technical rounds."
        })

    if not project_evidence and required_skills:
        preparation_suggestions.append({
            "type": "portfolio",
            "title": "Add Relevant GitHub Project Evidence",
            "action": f"Build a public proof-of-concept demonstrating {required_skills[0]} to bolster match relevance."
        })

    if job.opportunity_type == "hackathon":
        preparation_suggestions.append({
            "type": "hackathon_prep",
            "title": "Form a Cross-Disciplinary Team",
            "action": f"Review challenge tracks on the official hackathon portal ({job.application_url}) and register early."
        })
    elif eligibility_failures:
        preparation_suggestions.append({
            "type": "eligibility_warning",
            "title": "Notice: Mandatory Threshold Unmet",
            "action": eligibility_failures[0]
        })
    else:
        preparation_suggestions.append({
            "type": "interview_prep",
            "title": f"Review Core Domain: {job.domain}",
            "action": f"Prepare system trade-offs and architectural problem solving for {job.company or 'this opportunity'}."
        })

    return {
        "job": job,
        "relevance_score": relevance_score,
        "is_eligible": is_eligible,
        "eligibility_status": eligibility_status,
        "eligibility_failures": eligibility_failures,
        "unknown_criteria": unknown_criteria,
        "score_breakdown": {
            "required_skills_score": required_score,
            "preferred_skills_score": preferred_score,
            "project_evidence_score": project_evidence_score,
            "academic_index_score": academic_score,
        },
        "matching_required": matching_required,
        "matching_preferred": matching_preferred,
        "missing_skills": missing_skills,
        "project_evidence": project_evidence,
        "preparation_suggestions": preparation_suggestions
    }
