import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2, 
  Sparkles,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
  Edit3,
  HelpCircle
} from 'lucide-react';

export default function StudentDashboard({
  studentProfile,
  matches = [],
  profileCompletion,
  onOpenMatchModal,
  onOpenApplyModal,
  onOpenOnboardingModal,
  onSelectJobForExplorer
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState('All');
  const [filterType, setFilterType] = useState('All');

  // Featured job match (highest score eligible match, or top match)
  const featuredMatch = matches.find(m => m.is_eligible && m.job.is_active) || matches[0];
  const remainingMatches = matches.filter(m => m.job.id !== featuredMatch?.job.id);

  // Filter matches
  const filteredMatches = remainingMatches.filter(m => {
    const j = m.job;
    const matchesSearch = 
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.required_skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDomain = filterDomain === 'All' || j.domain === filterDomain;
    const matchesType = filterType === 'All' || j.opportunity_type === filterType;

    return matchesSearch && matchesDomain && matchesType;
  });

  return (
    <div className="main-wrapper">
      {/* Editorial Welcome Section */}
      <section className="editorial-page-header">
        <div className="editorial-header-left">
          <div className="editorial-header-eyebrow">
            <span className="badge-editorial badge-lavender">Personalized Career Space</span>
            <span className="badge-editorial badge-sage">
              {studentProfile?.consent_recruiter_sharing ? 'Consent Active' : 'Private Profile'}
            </span>
            <span className="label-eyebrow">
              &bull; {studentProfile?.branch || 'Department Unset'} &bull; Class of {studentProfile?.graduation_year || 'Unset'}
            </span>
          </div>

          <h1 className="editorial-headline-xl">
            Your next opportunity <span className="font-editorial-italic">starts here.</span>
          </h1>

          <p className="editorial-subhead" style={{ marginTop: '8px' }}>
            Career intelligence for <strong>{studentProfile?.full_name || 'Student'}</strong> &bull; CGPA: {studentProfile?.cgpa ? `${studentProfile.cgpa.toFixed(2)} / ${studentProfile.cgpa_scale}` : 'Pending update'} &bull; {studentProfile?.skills?.length || 0} Verified Skills.
          </p>
        </div>

        {/* Profile Completion Index Surface */}
        <div 
          style={{ 
            backgroundColor: 'var(--color-surface-white)', 
            border: '1px solid var(--color-charcoal)', 
            boxShadow: '3px 3px 0px var(--color-charcoal)',
            padding: '16px 20px', 
            borderRadius: '4px',
            minWidth: '290px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-charcoal)' }}>
              Profile Completion Index
            </span>
            <span style={{ fontFamily: 'var(--font-display-modern)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-charcoal)' }}>
              {profileCompletion?.completion_percentage || 0}%
            </span>
          </div>

          <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${profileCompletion?.completion_percentage || 0}%`, 
                backgroundColor: 'var(--primary-lavender)',
                borderRadius: '3px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--color-gray-secondary)' }}>
              {profileCompletion?.missing_fields?.length > 0 
                ? `Missing: ${profileCompletion.missing_fields.slice(0, 2).join(', ')}`
                : 'All fields completed!'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', borderTop: '1px solid #E5E7EB', paddingTop: '8px' }}>
            <button
              className="btn btn-sm btn-ghost"
              onClick={onOpenOnboardingModal}
              style={{ flex: 1, padding: '4px 6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-charcoal)' }}
            >
              <Edit3 size={12} />
              <span>Edit Profile</span>
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={onOpenOnboardingModal}
              style={{ flex: 1, padding: '4px 6px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              title="Upload resume to autofill profile"
            >
              <Sparkles size={12} />
              <span>Upload Resume</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Asymmetric Grid */}
      <div className="student-grid">
        {/* Left Column: Featured Opportunity + Discovery Feed */}
        <div>
          {/* Prominent Featured Opportunity */}
          {featuredMatch && (
            <section className="featured-opportunity-surface">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge-editorial badge-charcoal">
                    Top Verified Recommendation
                  </span>
                  <span className={`badge-editorial ${featuredMatch.job.verification_status === 'verified' ? 'badge-sage' : 'badge-lavender'}`}>
                    {featuredMatch.job.verification_status.toUpperCase()}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-charcoal-soft)' }}>
                  {featuredMatch.job.opportunity_type.toUpperCase()}
                </span>
              </div>

              <div className="featured-grid">
                <div>
                  <h2 className="featured-role-title">
                    {featuredMatch.job.title}
                  </h2>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                    {featuredMatch.job.company || 'Unspecified Organization'} &bull; <span style={{ fontWeight: 400, color: 'var(--color-charcoal-soft)' }}>{featuredMatch.job.domain}</span>
                  </div>

                  <div className="featured-meta">
                    <span className="meta-item">
                      <MapPin size={16} />
                      {featuredMatch.job.location} ({featuredMatch.job.work_arrangement})
                    </span>
                    {featuredMatch.job.compensation && (
                      <span className="meta-item" style={{ fontWeight: 600 }}>
                        {featuredMatch.job.compensation}
                      </span>
                    )}
                  </div>

                  {/* Explainable Match Reason Box */}
                  <div className="match-explanation-box">
                    <strong>Match Intelligence:</strong> {featuredMatch.matching_required.length} of {featuredMatch.job.required_skills?.length || 0} core skills verified. 
                    {featuredMatch.project_evidence?.length > 0 && ` Found matching evidence in '${featuredMatch.project_evidence[0].project_title}'.`}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => onOpenMatchModal(featuredMatch)}
                    >
                      <span>Explain Match Breakdown</span>
                      <ArrowUpRight size={16} />
                    </button>

                    {featuredMatch.job.application_url ? (
                      <a 
                        href={featuredMatch.job.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-dark"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <ExternalLink size={15} />
                        <span>Apply on Official Site ↗</span>
                      </a>
                    ) : (
                      <button 
                        className="btn btn-dark"
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        title="Application link unavailable — contact placement cell or recruiter directly"
                      >
                        <span>Link Unavailable (Lead Only)</span>
                      </button>
                    )}

                    <button 
                      className="btn btn-ghost"
                      onClick={() => onSelectJobForExplorer(featuredMatch.job.id)}
                    >
                      View in Explorer &rarr;
                    </button>
                  </div>
                </div>

                {/* Score Arc Indicator */}
                <div className="score-arc-container">
                  <svg className="score-arc-svg" viewBox="0 0 100 100">
                    <circle className="score-arc-bg" cx="50" cy="50" r="40" />
                    <circle 
                      className="score-arc-fill" 
                      cx="50" 
                      cy="50" 
                      r="40"
                      strokeDasharray={`${(featuredMatch.relevance_score / 100) * 251.2} 251.2`}
                    />
                  </svg>
                  <div className="score-arc-value">{featuredMatch.relevance_score}%</div>
                  <div className="score-arc-label">Relevance Index</div>
                  <div style={{ marginTop: '4px', fontSize: '0.675rem', fontWeight: 700, color: featuredMatch.is_eligible ? 'var(--muted-sage-dark)' : 'var(--color-danger)' }}>
                    {featuredMatch.eligibility_status}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Opportunity Discovery Feed */}
          <section className="discovery-section">
            <div className="section-editorial-title">
              <div>
                <h2>Real-World Opportunities & Drives</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-secondary)', marginTop: '2px' }}>
                  Live database opportunities evaluated against your saved profile.
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="Search roles, tech..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '32px', width: '200px', fontSize: '0.8rem' }}
                  />
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-gray-subtle)' }} />
                </div>

                <select 
                  className="select-compact"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="job">Full-time Job</option>
                  <option value="internship">Internship</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
            </div>

            {/* Editorial Opportunity Rows */}
            <div className="job-editorial-list">
              {filteredMatches.length > 0 ? (
                filteredMatches.map(m => {
                  const job = m.job;
                  return (
                    <div
                      key={job.id}
                      className="job-editorial-row"
                      onClick={() => onOpenMatchModal(m)}
                    >
                      {/* Role & Company */}
                      <div>
                        <div className="job-row-title">{job.title}</div>
                        <div className="job-row-company">
                          <strong>{job.company || 'Unspecified Organization'}</strong> &bull; {job.domain}
                        </div>
                      </div>

                      {/* Location & Compensation */}
                      <div style={{ fontSize: '0.825rem', color: 'var(--color-charcoal-soft)' }}>
                        <div>{job.location}</div>
                        {job.compensation && <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>{job.compensation}</div>}
                      </div>

                      {/* Verification Status */}
                      <div>
                        <span 
                          style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 600, 
                            padding: '2px 6px', 
                            borderRadius: '3px',
                            backgroundColor: job.verification_status === 'verified' ? 'var(--muted-sage-bg)' : '#F3F4F6',
                            color: job.verification_status === 'verified' ? 'var(--muted-sage-dark)' : 'var(--color-charcoal-soft)',
                            border: `1px solid ${job.verification_status === 'verified' ? '#C2E4D9' : '#E5E7EB'}`
                          }}
                        >
                          {job.verification_status.toUpperCase()}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-secondary)', marginTop: '2px' }}>
                          {job.source_type.replace(/_/g, ' ')}
                        </div>
                      </div>

                      {/* Match Score & Eligibility Badge */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'var(--font-display-modern)', fontWeight: 800, fontSize: '1rem', color: 'var(--color-charcoal)' }}>
                            {m.relevance_score}%
                          </span>
                          <span 
                            style={{ 
                              fontSize: '0.675rem', 
                              fontWeight: 700, 
                              padding: '2px 5px', 
                              borderRadius: '3px',
                              backgroundColor: m.is_eligible ? 'var(--muted-sage)' : '#FEE2E2',
                              color: m.is_eligible ? 'var(--muted-sage-dark)' : '#DC2626'
                            }}
                          >
                            {m.eligibility_status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-secondary)', marginTop: '2px' }}>
                          {m.matching_required.length}/{job.required_skills?.length || 0} skills
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMatchModal(m);
                          }}
                        >
                          Explain
                        </button>

                        {job.application_url ? (
                          <a 
                            href={job.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={(e) => e.stopPropagation()}
                            title="Apply directly on official website (opens in new tab)"
                          >
                            <span>Apply</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <button 
                            className="btn btn-sm btn-secondary"
                            disabled
                            style={{ opacity: 0.5, cursor: 'not-allowed' }}
                            onClick={(e) => e.stopPropagation()}
                            title="Application link unavailable — contact placement cell or recruiter directly"
                          >
                            <span>No Link</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '36px', textAlign: 'center', backgroundColor: 'var(--color-surface-white)', color: 'var(--color-gray-secondary)' }}>
                  No matches found for the selected filters.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar: Verified Profile & Skills */}
        <div>
          {/* Skills & Preparation Panel */}
          <section className="career-readiness-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '8px', marginBottom: '14px' }}>
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.45rem', margin: 0 }}>
                Your Technical Inventory
              </h3>
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={onOpenOnboardingModal}
                style={{ fontSize: '0.75rem', padding: '2px 6px' }}
              >
                + Add Skills
              </button>
            </div>

            {studentProfile?.resume_filename && (
              <div style={{ backgroundColor: 'var(--pale-lavender)', padding: '6px 10px', borderRadius: '4px', marginBottom: '12px', border: '1px solid var(--primary-lavender)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--color-charcoal)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--muted-sage-dark)' }} />
                  Synced: <strong>{studentProfile.resume_filename}</strong>
                </span>
                <span className="badge-editorial badge-sage" style={{ fontSize: '0.65rem' }}>
                  Autofilled
                </span>
              </div>
            )}

            <div className="skills-chip-group">
              {(studentProfile?.skills || []).map((skill, idx) => (
                <span key={idx} className="skill-chip skill-chip-verified">
                  <CheckCircle2 size={12} />
                  {skill}
                </span>
              ))}
            </div>

            {/* Saved Projects */}
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-gray-border)', paddingTop: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-charcoal)', marginBottom: '8px' }}>
                Saved Project Repositories ({(studentProfile?.projects || []).length})
              </div>
              {(studentProfile?.projects || []).map((p, idx) => (
                <div key={idx} style={{ backgroundColor: 'var(--warm-offwhite)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-gray-border)', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)', margin: '2px 0 4px 0' }}>{p.description}</div>
                  <div className="skills-chip-group" style={{ margin: 0 }}>
                    {(p.technologies || []).map((t, ti) => (
                      <span key={ti} className="skill-chip skill-chip-lavender" style={{ fontSize: '0.675rem' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy & Consent Status Strip */}
          <section className="career-readiness-panel">
            <div style={{ borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '8px', marginBottom: '14px' }}>
              <h3 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.35rem', margin: 0 }}>
                Active Privacy Directives
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Recruiter Profile Sharing:</span>
                <strong style={{ color: studentProfile?.consent_recruiter_sharing ? 'var(--muted-sage-dark)' : 'var(--color-danger)' }}>
                  {studentProfile?.consent_recruiter_sharing ? 'Active / Visible' : 'Redacted / Private'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Job Alerts via Email:</span>
                <strong style={{ color: studentProfile?.consent_job_alerts ? 'var(--muted-sage-dark)' : 'var(--color-gray-secondary)' }}>
                  {studentProfile?.consent_job_alerts ? 'Opted In' : 'Disabled'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Deterministic Match Engine:</span>
                <strong style={{ color: studentProfile?.consent_matching ? 'var(--muted-sage-dark)' : 'var(--color-danger)' }}>
                  {studentProfile?.consent_matching ? 'Enabled' : 'Paused'}
                </strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
