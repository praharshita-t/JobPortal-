import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Briefcase, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { evaluateMatch, rankStudentsForJob } from '../utils/matchingEngine';

export default function RecruiterDashboard({
  students = [],
  jobs = [],
  onOpenCreateVacancy,
  onSelectCandidate,
  onShortlistCandidate
}) {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEligibility, setFilterEligibility] = useState('all'); // 'all' | 'eligible' | 'consented'
  const [filterGradYear, setFilterGradYear] = useState('All');

  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Evaluate candidate cohort against selected vacancy using real matching engine
  const rankedCandidates = activeJob ? rankStudentsForJob(activeJob, students) : [];

  // Shortlist metrics
  const totalEvaluated = rankedCandidates.length;
  const eligibleAndConsentedCount = rankedCandidates.filter(c => c.isEligible && c.consentApproved).length;
  const flaggedConsentCount = rankedCandidates.filter(c => !c.consentApproved).length;

  // Filter candidates
  const filteredCandidates = rankedCandidates.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEligibility = 
      filterEligibility === 'all' ? true :
      filterEligibility === 'eligible' ? candidate.isEligible :
      filterEligibility === 'consented' ? candidate.consentApproved : true;

    const matchesGrad = filterGradYear === 'All' || String(candidate.graduationYear) === filterGradYear;

    return matchesSearch && matchesEligibility && matchesGrad;
  });

  return (
    <div className="main-wrapper">
      {/* Editorial Header */}
      <section className="editorial-page-header">
        <div className="editorial-header-left">
          <div className="editorial-header-eyebrow">
            <span className="badge-editorial badge-charcoal">Campus Recruiting Workspace</span>
            <span className="badge-editorial badge-sage">Verified Cohort &bull; Privacy Protected</span>
          </div>
          <h1 className="editorial-headline-xl">
            Talent <span className="font-editorial-italic">Discovery.</span>
          </h1>
          <p className="editorial-subhead" style={{ marginTop: '6px' }}>
            Precision candidate matching and authorized dossier access for active campus hiring drives.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={onOpenCreateVacancy}>
            <Plus size={16} />
            <span>Create New Vacancy</span>
          </button>
        </div>
      </section>

      {/* Prominent Vacancy Management Section */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--color-charcoal)', paddingBottom: '8px', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.65rem', margin: 0 }}>
            Active Campus Requisitions ({jobs.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-secondary)' }}>
            Select a vacancy to compute cohort match matrix
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {jobs.map(job => {
            const isSelected = job.id === activeJob?.id;
            return (
              <div 
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                style={{ 
                  backgroundColor: isSelected ? 'var(--pale-lavender)' : 'var(--color-surface-white)',
                  border: `1px solid ${isSelected ? 'var(--color-charcoal)' : 'var(--color-gray-border)'}`,
                  boxShadow: isSelected ? '2px 2px 0px var(--color-charcoal)' : 'none',
                  padding: '16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gray-secondary)' }}>
                    {job.company}
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '3px', backgroundColor: '#F3F4F6', color: 'var(--color-charcoal)' }}>
                    {job.vacancyCount} Openings
                  </span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-charcoal)', margin: '0 0 6px 0' }}>
                  {job.title}
                </h3>
                <div style={{ fontSize: '0.775rem', color: 'var(--color-gray-secondary)' }}>
                  CGPA Cutoff: <strong>{job.cgpaCutoff.toFixed(1)}</strong> &bull; {job.salary}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Visually Distinctive Shortlist Header */}
      <section 
        style={{ 
          backgroundColor: 'var(--warm-offwhite)', 
          border: '1px solid var(--color-charcoal)', 
          boxShadow: 'var(--shadow-editorial)',
          borderRadius: '6px', 
          padding: '24px 32px',
          marginBottom: '28px',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '24px',
          alignItems: 'center'
        }}
      >
        <div>
          <div className="label-eyebrow" style={{ color: 'var(--color-charcoal-soft)', marginBottom: '4px' }}>
            Candidate Cohort Evaluation &bull; {activeJob?.title}
          </div>
          <div style={{ fontFamily: 'var(--font-display-modern)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-charcoal)', lineHeight: 1 }}>
            {eligibleAndConsentedCount} Candidates
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--muted-sage-dark)', marginTop: '4px' }}>
            Currently 100% Eligible & Consent-Approved for Direct Interview Scheduling
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-secondary)', marginTop: '8px' }}>
            Calculated across {totalEvaluated} candidates in the 2026 graduation pool. Unapproved personal phone and address information strictly protected.
          </div>
        </div>

        {/* Consent Protection Callout */}
        <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', padding: '16px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.825rem', color: 'var(--color-charcoal)' }}>
            <ShieldCheck size={18} color="#2A6858" />
            <span>Placement Consent Directive Enforced</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
            Recruiter access is cryptographically authenticated. Candidate profiles without active student consent ({flaggedConsentCount} in cohort) are flagged and redacted.
          </p>
        </div>
      </section>

      {/* Candidate Discovery Table Filters */}
      <div className="explorer-filters" style={{ marginBottom: '16px' }}>
        <div className="search-input-wrap">
          <input
            type="text"
            className="input-text"
            placeholder="Search candidates by name, roll number, or technical skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '34px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-gray-subtle)' }} />
        </div>

        <select 
          className="select-compact"
          value={filterEligibility}
          onChange={(e) => setFilterEligibility(e.target.value)}
        >
          <option value="all">All Evaluated Candidates</option>
          <option value="eligible">100% Eligible Only</option>
          <option value="consented">Consent Approved Only</option>
        </select>

        <select 
          className="select-compact"
          value={filterGradYear}
          onChange={(e) => setFilterGradYear(e.target.value)}
        >
          <option value="All">All Cohorts</option>
          <option value="2026">Class of 2026</option>
        </select>
      </div>

      {/* Candidate Discovery Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Department / Cohort</th>
              <th>CGPA & Backlogs</th>
              <th>Skills Overlap</th>
              <th>Match Relevance</th>
              <th>Eligibility</th>
              <th>Consent Directive</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map(candidate => {
                const analysis = evaluateMatch(candidate, activeJob);
                return (
                  <tr 
                    key={candidate.id}
                    onClick={() => onSelectCandidate(candidate)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>{candidate.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)' }}>{candidate.rollNo}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.825rem', color: 'var(--color-charcoal)' }}>{candidate.department}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)' }}>Batch of {candidate.graduationYear}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{candidate.cgpa.toFixed(2)} CGPA</div>
                      <div style={{ fontSize: '0.725rem', color: candidate.backlogs === 0 ? 'var(--muted-sage-dark)' : 'var(--color-danger)' }}>
                        {candidate.backlogs === 0 ? '0 Backlogs' : `${candidate.backlogs} Backlogs`}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                        {candidate.skills.slice(0, 3).map((s, idx) => {
                          const isReq = activeJob?.requiredSkills.includes(s);
                          return (
                            <span 
                              key={idx} 
                              className={`skill-chip ${isReq ? 'skill-chip-verified' : 'skill-chip-neutral'}`}
                              style={{ fontSize: '0.675rem', padding: '2px 6px' }}
                            >
                              {s}
                            </span>
                          );
                        })}
                        {candidate.skills.length > 3 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-secondary)' }}>
                            +{candidate.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontFamily: 'var(--font-display-modern)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-charcoal)' }}>
                        {analysis.relevanceScore}%
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-secondary)' }}>
                        {analysis.matchingRequired.length}/{activeJob?.requiredSkills.length} core skills
                      </div>
                    </td>

                    <td>
                      <span 
                        style={{ 
                          fontSize: '0.725rem', 
                          fontWeight: 700, 
                          padding: '3px 8px', 
                          borderRadius: '3px',
                          backgroundColor: analysis.isEligible ? 'var(--muted-sage)' : '#FEE2E2',
                          color: analysis.isEligible ? 'var(--muted-sage-dark)' : '#DC2626'
                        }}
                      >
                        {analysis.isEligible ? 'Passed Criteria' : 'Unmet Criteria'}
                      </span>
                    </td>

                    <td>
                      {candidate.consentApproved ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--muted-sage-dark)', fontWeight: 600 }}>
                          <CheckCircle2 size={14} /> Approved
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                          <Lock size={14} /> Redacted
                        </span>
                      )}
                    </td>

                    <td>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCandidate(candidate);
                        }}
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-gray-secondary)' }}>
                  No candidates match the filter parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
