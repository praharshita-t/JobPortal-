import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function JobDiscoveryView({
  jobs = [],
  selectedJobId,
  onSelectJob,
  onOpenMatchModal,
  onOpenApplyModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedVerification, setSelectedVerification] = useState('All');

  // Active selected job in the detail panel
  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Filtered job list
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.required_skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDomain = selectedDomain === 'All' || job.domain === selectedDomain;
    const matchesType = selectedType === 'All' || job.opportunity_type === selectedType;
    const matchesVerification = selectedVerification === 'All' || job.verification_status === selectedVerification;
    const matchesBatch = selectedBatch === 'All' || 
      (job.target_batches && job.target_batches.includes(Number(selectedBatch)));

    return matchesSearch && matchesDomain && matchesType && matchesVerification && matchesBatch;
  });

  return (
    <div className="main-wrapper">
      {/* Editorial Header */}
      <section className="editorial-page-header">
        <div className="editorial-header-left">
          <div className="editorial-header-eyebrow">
            <span className="badge-editorial badge-charcoal">Real-World Opportunity Explorer</span>
            <span className="badge-editorial badge-sage">Verified URLs &bull; No Fabricated Data</span>
          </div>
          <h1 className="editorial-headline-xl">
            Opportunity <span className="font-editorial-italic">Explorer.</span>
          </h1>
          <p className="editorial-subhead" style={{ marginTop: '6px' }}>
            Genuine tech opportunities, internships, hackathons, and corporate programs with authentic application links and verification audits.
          </p>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--color-charcoal-soft)', textAlign: 'right' }}>
          <div>Displaying <strong>{filteredJobs.length}</strong> active opportunities</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)' }}>All external referral links preserved</div>
        </div>
      </section>

      {/* Horizontal Filter Controls */}
      <div className="explorer-filters">
        <div className="search-input-wrap">
          <input
            type="text"
            className="input-text"
            placeholder="Search roles, organizations, or skills (e.g. Red Hat, Python)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '34px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-gray-subtle)' }} />
        </div>

        {/* Opportunity Type */}
        <select 
          className="select-compact"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="job">Jobs</option>
          <option value="internship">Internships</option>
          <option value="hackathon">Hackathons</option>
          <option value="lead">Informational Leads</option>
        </select>

        {/* Target Graduation Batch */}
        <select 
          className="select-compact"
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="All">All Batches</option>
          <option value="2026">Class of 2026</option>
          <option value="2027">Class of 2027</option>
          <option value="2028">Class of 2028</option>
          <option value="2029">Class of 2029</option>
        </select>

        {/* Verification Status */}
        <select 
          className="select-compact"
          value={selectedVerification}
          onChange={(e) => setSelectedVerification(e.target.value)}
        >
          <option value="All">All Verification States</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Announcements</option>
        </select>
      </div>

      {/* Two-Column Explorer Layout */}
      <div className="explorer-container">
        {/* Left Column: Job Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => {
              const isSelected = activeJob?.id === job.id;
              return (
                <div 
                  key={job.id}
                  onClick={() => onSelectJob(job.id)}
                  style={{ 
                    backgroundColor: isSelected ? 'var(--pale-lavender)' : 'var(--color-surface-white)',
                    border: `1px solid ${isSelected ? 'var(--primary-lavender)' : 'var(--color-gray-border)'}`,
                    borderLeft: isSelected ? '4px solid var(--primary-lavender)' : '1px solid var(--color-gray-border)',
                    padding: '16px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-charcoal)', margin: 0 }}>
                          {job.title}
                        </h3>
                        <span 
                          style={{ 
                            fontSize: '0.675rem', 
                            fontWeight: 700, 
                            padding: '1px 5px', 
                            borderRadius: '3px',
                            backgroundColor: job.verification_status === 'verified' ? 'var(--muted-sage-bg)' : '#F3F4F6',
                            color: job.verification_status === 'verified' ? 'var(--muted-sage-dark)' : 'var(--color-charcoal-soft)',
                            border: `1px solid ${job.verification_status === 'verified' ? '#C2E4D9' : '#E5E7EB'}`
                          }}
                        >
                          {job.verification_status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-secondary)', marginTop: '2px' }}>
                        <strong>{job.company || 'Unspecified Organization'}</strong> &bull; {job.domain}
                      </div>
                    </div>

                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: '#F3F4F6' }}>
                      {job.opportunity_type.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem', color: 'var(--color-charcoal-soft)', marginTop: '8px' }}>
                    <span>{job.location} ({job.work_arrangement})</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>
                      {job.compensation || 'Compensation Unspecified'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '40px', backgroundColor: 'var(--color-surface-white)', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--color-gray-border)' }}>
              <p style={{ color: 'var(--color-gray-secondary)' }}>No opportunities found matching selected filters.</p>
            </div>
          )}
        </div>

        {/* Right Column: Selected Opportunity Detail Panel */}
        {activeJob && (
          <div 
            style={{ 
              position: 'sticky', 
              top: '80px', 
              backgroundColor: 'var(--color-surface-white)', 
              border: '1px solid var(--color-charcoal)', 
              boxShadow: 'var(--shadow-editorial)',
              borderRadius: '6px', 
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="label-eyebrow" style={{ color: 'var(--color-gray-secondary)' }}>
                  {activeJob.opportunity_type.toUpperCase()} &bull; {activeJob.domain}
                </span>
                <span 
                  style={{ 
                    fontSize: '0.725rem', 
                    fontWeight: 700, 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    backgroundColor: activeJob.verification_status === 'verified' ? 'var(--muted-sage-bg)' : '#F3F4F6',
                    color: activeJob.verification_status === 'verified' ? 'var(--muted-sage-dark)' : 'var(--color-charcoal-soft)',
                    border: `1px solid ${activeJob.verification_status === 'verified' ? '#C2E4D9' : '#E5E7EB'}`
                  }}
                >
                  Verification: {activeJob.verification_status.toUpperCase()}
                </span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '2.1rem', lineHeight: 1.1, margin: '0 0 6px 0', color: 'var(--color-charcoal)' }}>
                {activeJob.title}
              </h2>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-charcoal-soft)' }}>
                {activeJob.company || 'Unspecified Organization'} &bull; <span>{activeJob.location}</span>
              </div>
            </div>

            {/* Opportunity Specs Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: 'var(--warm-offwhite)', padding: '14px', borderRadius: '4px', border: '1px solid var(--color-gray-border)', fontSize: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)', display: 'block' }}>Compensation / Reward</span>
                <strong>{activeJob.compensation || 'Unspecified in Announcement'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)', display: 'block' }}>Eligible Batches</span>
                <strong>{activeJob.target_batches?.length > 0 ? `Class of ${activeJob.target_batches.join(', ')}` : 'Open to all students'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)', display: 'block' }}>Source Classification</span>
                <strong>{activeJob.source_type.replace(/_/g, ' ')}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)', display: 'block' }}>Work Arrangement</span>
                <strong>{activeJob.work_arrangement}</strong>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-secondary)', marginBottom: '6px' }}>
                Opportunity Overview & Details
              </h4>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-charcoal-soft)', margin: 0 }}>
                {activeJob.description}
              </p>
              {activeJob.notes && (
                <div style={{ marginTop: '8px', fontSize: '0.775rem', color: 'var(--color-gray-secondary)', fontStyle: 'italic' }}>
                  Note: {activeJob.notes}
                </div>
              )}
            </div>

            {/* Mandatory Eligible Branches if specified */}
            {activeJob.eligible_branches?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '4px' }}>
                  Restricted Department Branches:
                </div>
                <div className="skills-chip-group" style={{ margin: 0 }}>
                  {activeJob.eligible_branches.map((b, i) => (
                    <span key={i} className="skill-chip skill-chip-lavender" style={{ fontSize: '0.75rem' }}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Requirement Chips */}
            {activeJob.required_skills?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '4px' }}>
                  Key Required Skills:
                </div>
                <div className="skills-chip-group" style={{ margin: 0 }}>
                  {activeJob.required_skills.map((s, i) => (
                    <span key={i} className="skill-chip skill-chip-verified" style={{ fontSize: '0.75rem' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Official Application URL Preserved */}
            {activeJob.application_url && (
              <div style={{ backgroundColor: 'var(--warm-offwhite)', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--color-gray-border)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gray-secondary)', display: 'block', marginBottom: '2px' }}>
                  Preserved Original Application URL:
                </span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all', color: '#1E293B' }}>
                  {activeJob.application_url}
                </span>
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              {activeJob.application_url ? (
                <a 
                  href={activeJob.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ flex: 1, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <ExternalLink size={16} />
                  <span>Apply on Official Site ↗</span>
                </a>
              ) : (
                <button 
                  className="btn btn-secondary"
                  style={{ flex: 1, opacity: 0.6, cursor: 'not-allowed' }}
                  disabled
                  title="Application link unavailable — contact placement cell or recruiter directly"
                >
                  Application URL Unavailable (Lead Only)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
