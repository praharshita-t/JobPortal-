import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  FolderGit2, 
  GraduationCap, 
  Mail, 
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import { evaluateMatch } from '../utils/matchingEngine';

export default function CandidateDetailDrawer({
  candidate,
  selectedJob,
  isOpen,
  onClose,
  onShortlist
}) {
  if (!isOpen || !candidate) return null;

  const analysis = selectedJob ? evaluateMatch(candidate, selectedJob) : null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div 
        className="modal-content-lg" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '560px', 
          height: '100vh', 
          maxHeight: '100vh', 
          borderRadius: 0, 
          borderLeft: '1px solid var(--color-charcoal)',
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: 'none'
        }}
      >
        {/* Drawer Header */}
        <div className="modal-header" style={{ padding: '20px 24px' }}>
          <div>
            <div className="label-eyebrow" style={{ color: 'var(--color-charcoal-soft)', marginBottom: '4px' }}>
              Authorized Candidate Dossier
            </div>
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.85rem', margin: 0 }}>
              {candidate.name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-secondary)' }}>
              {candidate.department} &bull; Class of {candidate.graduationYear}
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="modal-body" style={{ padding: '24px', overflowY: 'auto' }}>
          {/* Consent Status Badge & Privacy Shield */}
          <div 
            style={{ 
              backgroundColor: candidate.consentApproved ? 'var(--muted-sage-bg)' : 'var(--color-danger-bg)',
              border: `1px solid ${candidate.consentApproved ? '#C2E4D9' : '#FECACA'}`,
              padding: '14px',
              borderRadius: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: candidate.consentApproved ? 'var(--muted-sage-dark)' : 'var(--color-danger)', fontSize: '0.85rem' }}>
              {candidate.consentApproved ? <ShieldCheck size={18} /> : <Lock size={18} />}
              <span>{candidate.consentApproved ? 'PLACEMENT CONSENT DIRECTIVE: ACTIVE' : 'CONSENT PENDING: DATA RESTRICTED'}</span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--color-charcoal-soft)' }}>
              {candidate.consentApproved 
                ? 'Candidate has executed formal consent to share academic records, technical portfolio, and project repositories with corporate partners.'
                : 'Direct personal telephone and address redacted. Student has not approved external disclosure. Recruiter cannot export unconsented records.'}
            </p>
          </div>

          {/* Academic Registry Records */}
          <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', padding: '16px', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-secondary)', marginBottom: '10px' }}>
              Authenticated University Records
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--color-gray-secondary)', display: 'block', fontSize: '0.75rem' }}>Roll Number</span>
                <strong>{candidate.rollNo}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-gray-secondary)', display: 'block', fontSize: '0.75rem' }}>Verified CGPA</span>
                <strong>{candidate.cgpa.toFixed(2)} / 10.0</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-gray-secondary)', display: 'block', fontSize: '0.75rem' }}>Active Backlogs</span>
                <strong style={{ color: candidate.backlogs === 0 ? 'var(--muted-sage-dark)' : 'var(--color-danger)' }}>
                  {candidate.backlogs === 0 ? '0 (Clean)' : `${candidate.backlogs} Backlogs`}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-gray-secondary)', display: 'block', fontSize: '0.75rem' }}>Institutional Verification</span>
                <span style={{ color: 'var(--muted-sage-dark)', fontWeight: 600 }}>Verified by Registrar</span>
              </div>
            </div>
          </div>

          {/* Requisition Match Evaluation (if job selected) */}
          {selectedJob && analysis && (
            <div style={{ backgroundColor: 'var(--pale-lavender)', border: '1px solid var(--color-lavender-border)', padding: '16px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#4C1D95' }}>
                  Match Index for {selectedJob.title}
                </span>
                <span style={{ backgroundColor: 'var(--color-charcoal)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                  {analysis.relevanceScore}%
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--color-charcoal-soft)', marginBottom: '10px' }}>
                <strong>Eligibility:</strong> {analysis.isEligible ? 'Eligible for Shortlist' : 'Ineligible based on criteria'}
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '4px' }}>
                Matching Mandatory Skills ({analysis.matchingRequired.length} of {selectedJob.requiredSkills.length}):
              </div>
              <div className="skills-chip-group" style={{ margin: '0 0 10px 0' }}>
                {analysis.matchingRequired.map((s, idx) => (
                  <span key={idx} className="skill-chip skill-chip-verified" style={{ fontSize: '0.7rem' }}>
                    ✓ {s}
                  </span>
                ))}
              </div>

              {analysis.missingSkills.length > 0 && (
                <>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-secondary)', marginBottom: '4px' }}>
                    Missing Required Skills:
                  </div>
                  <div className="skills-chip-group" style={{ margin: 0 }}>
                    {analysis.missingSkills.map((s, idx) => (
                      <span key={idx} className="skill-chip skill-chip-missing" style={{ fontSize: '0.7rem' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Verified Skills */}
          <div>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-secondary)', marginBottom: '8px' }}>
              Candidate Skill Inventory
            </h3>
            <div className="skills-chip-group">
              {candidate.skills.map((skill, i) => (
                <span key={i} className="skill-chip skill-chip-neutral">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Verified Projects & Artifacts */}
          <div>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-secondary)', marginBottom: '8px' }}>
              Authorized Project Artifacts
            </h3>
            {(candidate.projects || []).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {candidate.projects.map((proj, idx) => (
                  <div key={idx} style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', padding: '12px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.85rem' }}>{proj.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-secondary)' }}>GitHub Verified</span>
                    </div>
                    <p style={{ fontSize: '0.775rem', color: 'var(--color-gray-secondary)', margin: '0 0 6px 0' }}>{proj.description}</p>
                    <div className="skills-chip-group" style={{ margin: 0 }}>
                      {(proj.tech || []).map((t, tidx) => (
                        <span key={tidx} className="skill-chip skill-chip-lavender" style={{ fontSize: '0.675rem' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-secondary)' }}>
                No public projects submitted yet.
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--color-gray-border)', display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1 }}
              disabled={!candidate.consentApproved}
              onClick={() => onShortlist(candidate.id)}
            >
              <CheckCircle2 size={16} />
              {candidate.consentApproved ? 'Shortlist Candidate' : 'Consent Approval Required'}
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
