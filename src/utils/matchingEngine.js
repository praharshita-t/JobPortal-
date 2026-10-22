/**
 * CampusMatch AI — Explainable Matching Engine
 * 
 * Strict deterministic algorithm computing:
 * 1. Independent Mandatory Eligibility Gating (never masked by high relevance score)
 * 2. Mathematical Component Breakdown (Skill Overlap, Preferred Skills, Project Evidence, Academic Index)
 * 3. Evidence Extraction from student projects
 * 4. Contextual Preparation Suggestions
 */

export function evaluateMatch(student, job) {
  if (!student || !job) {
    return {
      relevanceScore: 0,
      isEligible: false,
      eligibilityFailures: ["Missing profile or job specification."],
      scoreBreakdown: {
        requiredSkillsScore: 0,
        preferredSkillsScore: 0,
        projectEvidenceScore: 0,
        academicIndexScore: 0,
      },
      matchingRequired: [],
      matchingPreferred: [],
      missingSkills: [],
      projectEvidence: [],
      preparationSuggestions: []
    };
  }

  const studentSkillsLower = (student.skills || []).map(s => s.toLowerCase());

  // 1. Mandatory Eligibility Check
  const eligibilityFailures = [];

  const cgpaPass = typeof job.cgpaCutoff === 'number' ? student.cgpa >= job.cgpaCutoff : true;
  if (!cgpaPass) {
    eligibilityFailures.push(
      `CGPA Cutoff Unmet: Job requires minimum ${job.cgpaCutoff.toFixed(2)} CGPA. Current verified score is ${student.cgpa.toFixed(2)}.`
    );
  }

  const branchPass = Array.isArray(job.eligibleBranches) && job.eligibleBranches.length > 0
    ? job.eligibleBranches.some(b => b.toLowerCase().trim() === (student.department || "").toLowerCase().trim())
    : true;
  if (!branchPass) {
    eligibilityFailures.push(
      `Department Eligibility: Open exclusively to ${job.eligibleBranches.join(", ")}. Current department is ${student.department}.`
    );
  }

  const batchPass = Array.isArray(job.targetBatch) && job.targetBatch.length > 0
    ? job.targetBatch.includes(student.graduationYear)
    : true;
  if (!batchPass) {
    eligibilityFailures.push(
      `Graduation Cohort: Job is restricted to Class of ${job.targetBatch.join(", ")}. Student cohort is ${student.graduationYear}.`
    );
  }

  const backlogPass = (student.backlogs || 0) === 0;
  if (!backlogPass) {
    eligibilityFailures.push(
      `Active Backlog Policy: Placement drive requires 0 active academic backlogs. Student has ${student.backlogs} recorded.`
    );
  }

  const consentPass = student.consentApproved === true;
  if (!consentPass) {
    eligibilityFailures.push(
      `Placement Consent Directive: Student has not yet executed the Placement Data Consent Agreement for external recruitment.`
    );
  }

  const isEligible = eligibilityFailures.length === 0;

  // 2. Component 1: Required Skills Overlap (Weight: 50 max points)
  const requiredSkills = job.requiredSkills || [];
  const matchingRequired = [];
  const missingSkills = [];

  requiredSkills.forEach(req => {
    if (studentSkillsLower.includes(req.toLowerCase())) {
      matchingRequired.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  const requiredSkillsScore = requiredSkills.length > 0
    ? Math.round((matchingRequired.length / requiredSkills.length) * 50)
    : 50;

  // 3. Component 2: Preferred Skills Overlap (Weight: 15 max points)
  const preferredSkills = job.preferredSkills || [];
  const matchingPreferred = [];

  preferredSkills.forEach(pref => {
    if (studentSkillsLower.includes(pref.toLowerCase())) {
      matchingPreferred.push(pref);
    }
  });

  const preferredSkillsScore = preferredSkills.length > 0
    ? Math.round((matchingPreferred.length / preferredSkills.length) * 15)
    : 10;

  // 4. Component 3: Project Evidence & Artifact Match (Weight: 20 max points)
  const projectEvidence = [];
  const allJobTech = [...requiredSkills, ...preferredSkills].map(t => t.toLowerCase());

  (student.projects || []).forEach(project => {
    const techMatches = (project.tech || []).filter(t => allJobTech.includes(t.toLowerCase()));
    const textCorpus = `${project.title} ${project.description}`.toLowerCase();
    const keywordMatches = allJobTech.filter(t => textCorpus.includes(t) && !techMatches.some(m => m.toLowerCase() === t));

    if (techMatches.length > 0 || keywordMatches.length > 0) {
      projectEvidence.push({
        projectTitle: project.title,
        matchedTech: [...techMatches, ...keywordMatches],
        description: project.description,
        repo: project.repo || null
      });
    }
  });

  let projectEvidenceScore = 0;
  if (projectEvidence.length >= 2) {
    projectEvidenceScore = 20;
  } else if (projectEvidence.length === 1) {
    projectEvidenceScore = 14;
  } else if ((student.projects || []).length > 0) {
    projectEvidenceScore = 8;
  }

  // 5. Component 4: Academic Index Score (Weight: 15 max points)
  // Scaled from 6.0 to 10.0
  const normalizedCgpa = Math.max(0, Math.min(4, (student.cgpa || 7.0) - 6.0));
  const academicIndexScore = Math.round((normalizedCgpa / 4.0) * 15);

  // Total Relevance Score
  const rawRelevance = requiredSkillsScore + preferredSkillsScore + projectEvidenceScore + academicIndexScore;
  const relevanceScore = Math.min(99, Math.max(25, rawRelevance));

  // 6. Actionable Preparation Suggestions
  const preparationSuggestions = [];
  if (missingSkills.length > 0) {
    preparationSuggestions.push({
      type: "skill_gap",
      title: `Bridge Essential Skills: ${missingSkills.slice(0, 2).join(", ")}`,
      action: `Review university lab modules or complete a targeted implementation in ${missingSkills[0]} before technical screening.`
    });
  }

  if (projectEvidence.length < 2) {
    preparationSuggestions.push({
      type: "portfolio",
      title: "Add Targeted Project Evidence",
      action: `Publish a public GitHub demo showing practical usage of ${job.requiredSkills.slice(0, 2).join(" & ")}.`
    });
  }

  if (job.cgpaCutoff && student.cgpa < job.cgpaCutoff) {
    preparationSuggestions.push({
      type: "eligibility_warning",
      title: "CGPA Requirement Boundary Notice",
      action: `This requisition mandates a ${job.cgpaCutoff.toFixed(2)} CGPA cutoff. Consider applying for alternative ${job.domain} openings with 7.5–8.0 thresholds.`
    });
  } else {
    preparationSuggestions.push({
      type: "interview_prep",
      title: `Prepare Domain Core: ${job.domain}`,
      action: `Review architecture design patterns, concurrency limits, and sub-system trade-offs relevant to ${job.company}'s engineering stack.`
    });
  }

  return {
    relevanceScore,
    isEligible,
    eligibilityFailures,
    scoreBreakdown: {
      requiredSkillsScore, // max 50
      preferredSkillsScore, // max 15
      projectEvidenceScore, // max 20
      academicIndexScore,   // max 15
    },
    matchingRequired,
    matchingPreferred,
    missingSkills,
    projectEvidence,
    preparationSuggestions
  };
}

/**
 * Batch evaluation of all jobs against a candidate
 */
export function rankJobsForStudent(student, jobs) {
  return jobs.map(job => {
    const analysis = evaluateMatch(student, job);
    return {
      ...job,
      matchAnalysis: analysis,
      relevanceScore: analysis.relevanceScore,
      isEligible: analysis.isEligible
    };
  }).sort((a, b) => {
    // Eligible first, then higher relevance score
    if (a.isEligible !== b.isEligible) {
      return a.isEligible ? -1 : 1;
    }
    return b.relevanceScore - a.relevanceScore;
  });
}

/**
 * Batch evaluation of all students against a job (Recruiter view)
 */
export function rankStudentsForJob(job, students) {
  return students.map(student => {
    const analysis = evaluateMatch(student, job);
    return {
      ...student,
      matchAnalysis: analysis,
      relevanceScore: analysis.relevanceScore,
      isEligible: analysis.isEligible
    };
  }).sort((a, b) => {
    if (a.isEligible !== b.isEligible) {
      return a.isEligible ? -1 : 1;
    }
    return b.relevanceScore - a.relevanceScore;
  });
}
