import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  BookOpen, 
  Code, 
  FolderGit2, 
  GraduationCap, 
  FileCheck,
  Award,
  ArrowRight
} from 'lucide-react';
import { evaluateMatch } from '../utils/matchingEngine';

export default function ExplainMatchModal({
  job,
  student,
  isOpen,
  onClose,
  onApply
}) {
  if (!isOpen || !job || !student) return null;

  const analysis = evaluateMatch(student, job);
  const {
    relevanceScore,
    isEligible,
    eligibilityFailures,
    scoreBreakdown,
    matchingRequired,
    matchingPreferred,
    missingSkills,
    projectEvidence,
    preparationSuggestions
  } = analysis;

  const isApplied = (student.appliedJobIds || []).includes(job.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-lg" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-modal-title"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div className="label-eyebrow" style={{ color: 'var(--color-charcoal-soft)', marginBottom: '4px' }}>
              <span>CampusMatch Explainable Intelligence</span>
              <span>&bull;</span>
              <span>{job.domain}</span>
            </div>
            <h2 id="match-modal-title" style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', margin: 0, color: 'var(--color-charcoal)' }}>
              {job.title}
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-gray-secondary)', marginTop: '2px' }}>
              <strong>{job.company}</strong> &bull; {job.location} &bull; {job.salary}
            </div>
          </div>

          <button 
            className="btn btn-ghost" 
            onClick={onClose}
            aria-label="Close match intelligence modal"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Top Score & Eligibility Gating Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px', alignItems: 'center' }}>
            {/* Circular Arc Score */}
            <div className="score-arc-container" style={{ minWidth: '150px' }}>
              <svg className="score-arc-svg" viewBox="0 0 100 100">
                <circle className="score-arc-bg" cx="50" cy="50" r="40" />
                <circle 
                  className="score-arc-fill" 
                  cx="50" 
                  cy="50" 
                  r="40"
                  strokeDasharray={`${(relevanceScore / 100) * 251.2} 251.2`}
                />
              </svg>
              <div className="score-arc-value">{relevanceScore}%</div>
              <div className="score-arc-label">Relevance Index</div>
            </div>

            {/* Eligibility Status Banner */}
            <div>
              {isEligible ? (
                <div className="eligibility-alert-pass">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '4px' }}>
                    <CheckCircle2 size={18} />
                    <span>MANDATORY ELIGIBILITY: VERIFIED & CLEARED</span>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    Student satisfies all university placement preconditions: CGPA threshold ({student.cgpa} &ge; {job.cgpaCutoff}), branch eligibility ({student.department}), zero active backlogs, and active student placement consent.
                  </div>
                </div>
              ) : (
                <div className="eligibility-alert-fail">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
                    <AlertTriangle size={18} />
                    <span>MANDATORY ELIGIBILITY: UNMET CRITERIA</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                    Although technical skill relevance is calculated at {relevanceScore}%, the student does not satisfy mandatory eligibility rules:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.825rem' }}>
                    {eligibilityFailures.map((failure, idx) => (
                      <li key={idx} style={{ marginBottom: '2px' }}>{failure}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Mathematical Component Breakdown */}
          <div className="score-breakdown-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px', borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-charcoal)' }}>
                Mathematical Component Breakdown (100 Point Model)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)' }}>
                Calculated by Deterministic Matching Engine
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {/* Component 1 */}
              <div className="score-bar-row">
                <div className="score-bar-meta">
                  <span className="score-bar-label">Required Skills Overlap</span>
                  <span className="score-bar-points">{scoreBreakdown.requiredSkillsScore} / 50 pts</span>
                </div>
                <div className="score-bar-track">
                  <div 
                    className="score-bar-progress lavender" 
                    style={{ width: `${(scoreBreakdown.requiredSkillsScore / 50) * 100}%` }}
                  />
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)', marginTop: '4px' }}>
                  {matchingRequired.length} of {job.requiredSkills.length} mandatory skills verified
                </div>
              </div>

              {/* Component 2 */}
              <div className="score-bar-row">
                <div className="score-bar-meta">
                  <span className="score-bar-label">Preferred Skills Alignment</span>
                  <span className="score-bar-points">{scoreBreakdown.preferredSkillsScore} / 15 pts</span>
                </div>
                <div className="score-bar-track">
                  <div 
                    className="score-bar-progress sage" 
                    style={{ width: `${(scoreBreakdown.preferredSkillsScore / 15) * 100}%` }}
                  />
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)', marginTop: '4px' }}>
                  {matchingPreferred.length} of {(job.preferredSkills || []).length} bonus technologies matched
                </div>
              </div>

              {/* Component 3 */}
              <div className="score-bar-row">
                <div className="score-bar-meta">
                  <span className="score-bar-label">Project Artifact Evidence</span>
                  <span className="score-bar-points">{scoreBreakdown.projectEvidenceScore} / 20 pts</span>
                </div>
                <div className="score-bar-track">
                  <div 
                    className="score-bar-progress purple" 
                    style={{ width: `${(scoreBreakdown.projectEvidenceScore / 20) * 100}%` }}
                  />
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)', marginTop: '4px' }}>
                  {projectEvidence.length} authenticated project artifacts found
                </div>
              </div>

              {/* Component 4 */}
              <div className="score-bar-row">
                <div className="score-bar-meta">
                  <span className="score-bar-label">Academic Index & Standing</span>
                  <span className="score-bar-points">{scoreBreakdown.academicIndexScore} / 15 pts</span>
                </div>
                <div className="score-bar-track">
                  <div 
                    className="score-bar-progress sage" 
                    style={{ width: `${(scoreBreakdown.academicIndexScore / 15) * 100}%` }}
                  />
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)', marginTop: '4px' }}>
                  CGPA {student.cgpa} normalized against cohort index
                </div>
              </div>
            </div>
          </div>

          {/* Structured Comparison Layout: Student vs Role Requirements */}
          <div className="match-comparison-layout">
            {/* Student Column */}
            <div className="comparison-column">
              <div className="comparison-col-header">
                Student Verified Qualifications ({student.name})
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
                  Verified Skills in Profile
                </div>
                <div className="skills-chip-group">
                  {student.skills.map((skill, i) => {
                    const isReqMatch = matchingRequired.includes(skill);
                    const isPrefMatch = matchingPreferred.includes(skill);
                    return (
                      <span 
                        key={i} 
                        className={`skill-chip ${isReqMatch ? 'skill-chip-verified' : isPrefMatch ? 'skill-chip-lavender' : 'skill-chip-neutral'}`}
                      >
                        {isReqMatch && <CheckCircle2 size={12} />}
                        {skill}
                        {isReqMatch && ' (Req)'}
                        {isPrefMatch && ' (Pref)'}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '8px' }}>
                  Matched Project Artifacts & Repositories
                </div>
                {projectEvidence.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {projectEvidence.map((ev, i) => (
                      <div key={i} style={{ backgroundColor: 'var(--warm-offwhite)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-gray-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-charcoal)' }}>{ev.projectTitle}</span>
                          {ev.repo && (
                            <span style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <FolderGit2 size={12} /> verified
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.775rem', color: 'var(--color-gray-secondary)', margin: '0 0 6px 0' }}>{ev.description}</p>
                        <div className="skills-chip-group" style={{ margin: 0 }}>
                          {ev.matchedTech.map((t, idx) => (
                            <span key={idx} className="skill-chip skill-chip-verified" style={{ fontSize: '0.7rem' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-secondary)', fontStyle: 'italic' }}>
                    No project portfolio entries explicitly matched the job tech stack.
                  </div>
                )}
              </div>
            </div>

            {/* Role Requirements Column */}
            <div className="comparison-column">
              <div className="comparison-col-header">
                Role Requirements ({job.company})
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
                  Required Skills Evaluation
                </div>
                <div className="skills-chip-group">
                  {job.requiredSkills.map((req, i) => {
                    const matched = matchingRequired.includes(req);
                    return (
                      <span 
                        key={i} 
                        className={`skill-chip ${matched ? 'skill-chip-verified' : 'skill-chip-missing'}`}
                        title={matched ? "Verified in student skills" : "Missing from student profile"}
                      >
                        {matched ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        {req}
                        {matched ? " (Matched)" : " (Missing)"}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
                  Preferred & Bonus Technologies
                </div>
                <div className="skills-chip-group">
                  {(job.preferredSkills || []).map((pref, i) => {
                    const matched = matchingPreferred.includes(pref);
                    return (
                      <span 
                        key={i} 
                        className={`skill-chip ${matched ? 'skill-chip-lavender' : 'skill-chip-neutral'}`}
                      >
                        {pref}
                        {matched ? " (Bonus Matched)" : ""}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
                  Institutional Preconditions
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--color-charcoal-soft)' }}>
                  <li>Minimum CGPA: <strong>{job.cgpaCutoff.toFixed(2)}</strong></li>
                  <li>Target Cohort: <strong>Class of {job.targetBatch.join(', ')}</strong></li>
                  <li>Eligible Branches: <strong>{job.eligibleBranches.join(', ')}</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actionable Preparation Suggestions */}
          <div>
            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-charcoal)', marginBottom: '12px' }}>
              Actionable Preparation & Gap Remediation
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {preparationSuggestions.map((prep, i) => (
                <div 
                  key={i} 
                  style={{ 
                    backgroundColor: 'var(--color-surface-white)', 
                    border: '1px solid var(--color-gray-border)', 
                    padding: '14px', 
                    borderRadius: '4px',
                    borderLeft: prep.type === 'eligibility_warning' ? '3px solid var(--color-danger)' : '3px solid var(--primary-lavender)'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-charcoal)', marginBottom: '4px' }}>
                    {prep.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-secondary)', lineHeight: 1.5 }}>
                    {prep.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-gray-border)', paddingTop: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-secondary)' }}>
              Official application links open directly on the verified employer portal in a new tab.
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Close Analysis
              </button>
              
              {(job.application_url || job.applicationUrl || job.officialUrl) ? (
                <a 
                  href={job.application_url || job.applicationUrl || job.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <ExternalLink size={16} />
                  <span>Apply on Official Site ↗</span>
                </a>
              ) : (
                <button 
                  className="btn btn-secondary" 
                  disabled 
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  title="Application link unavailable — contact placement cell or recruiter directly"
                >
                  Application URL Unavailable (Lead Only)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
