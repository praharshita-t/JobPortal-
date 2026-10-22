import React, { useState } from 'react';
import { X, Plus, CheckCircle, AlertCircle, Building, Briefcase } from 'lucide-react';

export default function VacancyCreateModal({
  isOpen,
  onClose,
  onSaveVacancy
}) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    domain: 'AI & Distributed Systems',
    location: '',
    salary: '',
    deadline: '2026-11-30',
    cgpaCutoff: '8.0',
    eligibleBranches: ['Computer Science & Engineering', 'Information Technology'],
    requiredSkills: '',
    preferredSkills: '',
    description: '',
    vacancyCount: '5'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const branchOptions = [
    'Computer Science & Engineering',
    'Data Science & AI',
    'Information Technology',
    'Electronics & Communication',
    'Mathematics & Computing',
    'Mechanical Engineering'
  ];

  const handleBranchToggle = (branch) => {
    setFormData(prev => {
      const exists = prev.eligibleBranches.includes(branch);
      return {
        ...prev,
        eligibleBranches: exists
          ? prev.eligibleBranches.filter(b => b !== branch)
          : [...prev.eligibleBranches, branch]
      };
    });
  };

  const validate = () => {
    const err = {};
    if (!formData.title.trim()) err.title = 'Job title is required';
    if (!formData.company.trim()) err.company = 'Company name is required';
    if (!formData.location.trim()) err.location = 'Location is required';
    if (!formData.requiredSkills.trim()) err.requiredSkills = 'Specify at least one required skill';
    if (formData.eligibleBranches.length === 0) err.eligibleBranches = 'Select at least one eligible department';
    const cgpa = parseFloat(formData.cgpaCutoff);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) err.cgpaCutoff = 'Enter a valid CGPA between 0 and 10';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newJob = {
        id: `job-${Date.now().toString().slice(-4)}`,
        title: formData.title.trim(),
        company: formData.company.trim(),
        domain: formData.domain,
        location: formData.location.trim(),
        salary: formData.salary.trim() || 'Undisclosed CTC',
        deadline: formData.deadline,
        deadlineLabel: `Closes ${formData.deadline}`,
        cgpaCutoff: parseFloat(formData.cgpaCutoff),
        eligibleBranches: formData.eligibleBranches,
        targetBatch: [2026],
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: formData.preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
        description: formData.description.trim() || 'Role details reviewed and approved by university corporate relations office.',
        matchReason: `Matches candidate profile in ${formData.requiredSkills.split(',')[0]} and core computing fundamentals.`,
        officialUrl: `https://campusmatch.placement.university.edu/drives/${formData.company.toLowerCase().replace(/\s+/g, '-')}-2026`,
        postedDate: new Date().toISOString().split('T')[0],
        vacancyCount: parseInt(formData.vacancyCount) || 3,
        shortlistedCount: 0,
        status: 'Active'
      };

      onSaveVacancy(newJob);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-lg" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px' }}
      >
        <div className="modal-header">
          <div>
            <div className="label-eyebrow" style={{ color: 'var(--color-charcoal-soft)', marginBottom: '4px' }}>
              Corporate Relations &bull; Requisition Setup
            </div>
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.85rem', margin: 0 }}>
              Create New Placement Vacancy
            </h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ gap: '22px' }}>
          {/* Section 1: Role & Organization */}
          <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', padding: '20px', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-secondary)', marginBottom: '14px' }}>
              1. Organization & Core Identity
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Role Title *
                </label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="e.g. Distributed Systems Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                {errors.title && <div style={{ fontSize: '0.725rem', color: 'var(--color-danger)', marginTop: '3px' }}>{errors.title}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="e.g. Snowflake India"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
                {errors.company && <div style={{ fontSize: '0.725rem', color: 'var(--color-danger)', marginTop: '3px' }}>{errors.company}</div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Domain Category
                </label>
                <select 
                  className="select-compact"
                  style={{ width: '100%' }}
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                >
                  <option value="AI & Distributed Systems">AI & Distributed Systems</option>
                  <option value="Fintech Platform">Fintech Platform</option>
                  <option value="Product Engineering">Product Engineering</option>
                  <option value="Cloud & Networking">Cloud & Networking</option>
                  <option value="Information Security">Information Security</option>
                  <option value="Analytics & Strategy">Analytics & Strategy</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Work Location *
                </label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="e.g. Bengaluru (Hybrid)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                {errors.location && <div style={{ fontSize: '0.725rem', color: 'var(--color-danger)', marginTop: '3px' }}>{errors.location}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  CTC Package
                </label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="e.g. INR 28.0 LPA"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Eligibility Criteria */}
          <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', padding: '20px', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-secondary)', marginBottom: '14px' }}>
              2. University Placement Preconditions
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Minimum CGPA Cutoff *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  className="input-text"
                  value={formData.cgpaCutoff}
                  onChange={(e) => setFormData({ ...formData, cgpaCutoff: e.target.value })}
                />
                {errors.cgpaCutoff && <div style={{ fontSize: '0.725rem', color: 'var(--color-danger)', marginTop: '3px' }}>{errors.cgpaCutoff}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Application Deadline
                </label>
                <input
                  type="date"
                  className="input-text"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Open Positions
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-text"
                  value={formData.vacancyCount}
                  onChange={(e) => setFormData({ ...formData, vacancyCount: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>
                Eligible Departments / Branches *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {branchOptions.map(branch => {
                  const selected = formData.eligibleBranches.includes(branch);
                  return (
                    <button
                      type="button"
                      key={branch}
                      className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      onClick={() => handleBranchToggle(branch)}
                    >
                      {selected && '✓ '}
                      {branch}
                    </button>
                  );
                })}
              </div>
              {errors.eligibleBranches && <div style={{ fontSize: '0.725rem', color: 'var(--color-danger)', marginTop: '4px' }}>{errors.eligibleBranches}</div>}
            </div>
          </div>

          {/* Section 3: Technical Skills & Matching Blueprint */}
          <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', padding: '20px', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-secondary)', marginBottom: '14px' }}>
              3. Matching Blueprint (Skills & Description)
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Mandatory Required Skills * (Comma separated)
              </label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. PyTorch, Distributed Systems, Python, C++, Docker"
                value={formData.requiredSkills}
                onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              />
              <div style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)', marginTop: '3px' }}>
                Engine evaluates 50% match weighting directly from this list.
              </div>
              {errors.requiredSkills && <div style={{ fontSize: '0.725rem', color: 'var(--color-danger)', marginTop: '3px' }}>{errors.requiredSkills}</div>}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Preferred / Bonus Skills (Comma separated)
              </label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. Kubernetes, Kafka, FastAPI, CUDA"
                value={formData.preferredSkills}
                onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Job Overview & Team Mission
              </label>
              <textarea
                className="input-text"
                rows="3"
                placeholder="Detailed scope of responsibility, engineering challenges, and technical expectations..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Submission Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Validating Requisition...' : 'Publish Vacancy to Campus Pool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
