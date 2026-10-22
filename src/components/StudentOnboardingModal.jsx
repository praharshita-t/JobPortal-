import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Building, 
  GraduationCap, 
  Code, 
  FolderGit2, 
  Briefcase, 
  Sparkles,
  Lock,
  Mail,
  AlertCircle
} from 'lucide-react';

const COMMON_SKILLS = [
  "Python", "JavaScript", "TypeScript", "C++", "Java", "Go", "SQL",
  "React", "Node.js", "FastAPI", "Docker", "Kubernetes", "PyTorch", "TensorFlow",
  "PostgreSQL", "MongoDB", "Kafka", "Redis", "AWS", "Linux",
  "Cyber Security", "Penetration Testing", "Cryptography", "Git",
  "Data Structures", "Algorithms", "System Design", "Problem Solving"
];

export default function StudentOnboardingModal({
  isOpen,
  onClose,
  initialProfile,
  onSaveProfile
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    current_city: '',
    preferred_locations: [],
    newLocation: '',

    college: '',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    academic_year: '4th Year',
    graduation_year: 2026,
    cgpa: 8.5,
    cgpa_scale: 10.0,
    backlogs: 0,

    skills: [],
    newSkill: '',

    projects: [],
    // New project temp state
    newProjTitle: '',
    newProjDesc: '',
    newProjTech: '',
    newProjUrl: '',

    preferred_roles: [],
    newRole: '',
    preferred_industries: [],
    newIndustry: '',
    work_arrangement: 'any',
    employment_type: 'both',
    min_salary_expectation: '',
    job_alert_emails: true,

    consent_job_alerts: true,
    consent_recruiter_sharing: true,
    consent_matching: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (initialProfile) {
      setFormData(prev => ({
        ...prev,
        full_name: initialProfile.full_name || prev.full_name,
        email: initialProfile.email || prev.email,
        phone: initialProfile.phone || '',
        current_city: initialProfile.current_city || '',
        preferred_locations: initialProfile.preferred_locations || ['Bengaluru', 'Hyderabad'],
        college: initialProfile.college || '',
        degree: initialProfile.degree || 'B.Tech',
        branch: initialProfile.branch || 'Computer Science & Engineering',
        academic_year: initialProfile.academic_year || '4th Year',
        graduation_year: initialProfile.graduation_year || 2026,
        cgpa: initialProfile.cgpa !== null && initialProfile.cgpa !== undefined ? initialProfile.cgpa : 8.5,
        cgpa_scale: initialProfile.cgpa_scale || 10.0,
        backlogs: initialProfile.backlogs || 0,
        skills: initialProfile.skills || ['Python', 'SQL', 'Data Structures'],
        projects: initialProfile.projects || [],
        preferred_roles: initialProfile.preferred_roles || ['Software Engineer'],
        preferred_industries: initialProfile.preferred_industries || ['Technology'],
        work_arrangement: initialProfile.work_arrangement || 'any',
        employment_type: initialProfile.employment_type || 'both',
        min_salary_expectation: initialProfile.min_salary_expectation || '',
        consent_job_alerts: initialProfile.consent_job_alerts !== undefined ? initialProfile.consent_job_alerts : true,
        consent_recruiter_sharing: initialProfile.consent_recruiter_sharing !== undefined ? initialProfile.consent_recruiter_sharing : false,
        consent_matching: initialProfile.consent_matching !== undefined ? initialProfile.consent_matching : true
      }));
    }
  }, [initialProfile]);

  if (!isOpen) return null;

  // Skill handlers
  const handleAddSkill = (skillName) => {
    const s = skillName.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, s], newSkill: '' }));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  // Project handlers
  const handleAddProject = () => {
    if (!formData.newProjTitle.trim() || !formData.newProjDesc.trim()) return;
    const newProj = {
      title: formData.newProjTitle.trim(),
      description: formData.newProjDesc.trim(),
      technologies: formData.newProjTech.split(',').map(t => t.trim()).filter(Boolean),
      project_url: formData.newProjUrl.trim() || null
    };
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, newProj],
      newProjTitle: '',
      newProjDesc: '',
      newProjTech: '',
      newProjUrl: ''
    }));
  };

  const handleRemoveProject = (index) => {
    setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
  };

  const handleSaveProgress = async (markComplete = false) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        phone: formData.phone,
        current_city: formData.current_city,
        preferred_locations: formData.preferred_locations,
        college: formData.college,
        degree: formData.degree,
        branch: formData.branch,
        academic_year: formData.academic_year,
        graduation_year: parseInt(formData.graduation_year) || 2026,
        cgpa: parseFloat(formData.cgpa) || null,
        cgpa_scale: parseFloat(formData.cgpa_scale) || 10.0,
        backlogs: parseInt(formData.backlogs) || 0,
        skills: formData.skills,
        projects: formData.projects,
        preferred_roles: formData.preferred_roles,
        preferred_industries: formData.preferred_industries,
        work_arrangement: formData.work_arrangement,
        employment_type: formData.employment_type,
        min_salary_expectation: formData.min_salary_expectation ? parseFloat(formData.min_salary_expectation) : null,
        consent_job_alerts: formData.consent_job_alerts,
        consent_recruiter_sharing: formData.consent_recruiter_sharing,
        consent_matching: formData.consent_matching,
        is_onboarded: markComplete ? true : (initialProfile?.is_onboarded || false)
      };

      await onSaveProfile(payload);
      setIsSubmitting(false);
      if (markComplete) {
        onClose();
      }
    } catch (e) {
      setIsSubmitting(false);
      setErrorMsg(e.message || 'Failed to persist student profile');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-lg" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', minHeight: '600px' }}
      >
        {/* Onboarding Header */}
        <div className="modal-header">
          <div>
            <div className="label-eyebrow" style={{ color: 'var(--color-charcoal-soft)', marginBottom: '4px' }}>
              <span>Step 0{currentStep} of 06</span>
              <span>&bull;</span>
              <span>Student Profile Intelligence</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', margin: 0 }}>
              {currentStep === 1 && "Personal Information & Geography"}
              {currentStep === 2 && "Academic Standing & Education"}
              {currentStep === 3 && "Verified Technical & Soft Skills"}
              {currentStep === 4 && "Projects, GitHub & Experience"}
              {currentStep === 5 && "Career & Opportunity Preferences"}
              {currentStep === 6 && "Privacy, Sharing & Consent Directive"}
            </h2>
          </div>

          <button className="btn btn-ghost" onClick={onClose} title="Save & Close">
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div style={{ height: '4px', backgroundColor: '#E5E7EB', display: 'flex' }}>
          {[1, 2, 3, 4, 5, 6].map(step => (
            <div 
              key={step} 
              style={{ 
                flex: 1, 
                backgroundColor: step <= currentStep ? 'var(--primary-lavender)' : '#E5E7EB',
                borderRight: '1px solid white',
                transition: 'background-color 0.3s'
              }} 
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
          {errorMsg && (
            <div className="eligibility-alert-fail" style={{ marginBottom: '16px' }}>
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Personal Info */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-secondary)', margin: 0 }}>
                Basic contact and location parameters used for location-based drive matching and verified student badges.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Full Name (Verified)
                  </label>
                  <input
                    type="text"
                    className="input-text"
                    value={formData.full_name}
                    disabled
                    style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    University Email (Read-Only)
                  </label>
                  <input
                    type="text"
                    className="input-text"
                    value={formData.email}
                    disabled
                    style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Contact Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <span style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)' }}>
                    Phone number remains strictly redacted from recruiters without explicit consent.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Current Base City
                  </label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="e.g. Bengaluru, Pune, Delhi NCR"
                    value={formData.current_city}
                    onChange={(e) => setFormData({ ...formData, current_city: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Preferred Work Locations
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="Add location (e.g. Bengaluru, Remote, Hyderabad)..."
                    value={formData.newLocation}
                    onChange={(e) => setFormData({ ...formData, newLocation: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (formData.newLocation.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            preferred_locations: [...prev.preferred_locations, prev.newLocation.trim()],
                            newLocation: ''
                          }));
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      if (formData.newLocation.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          preferred_locations: [...prev.preferred_locations, prev.newLocation.trim()],
                          newLocation: ''
                        }));
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
                <div className="skills-chip-group">
                  {formData.preferred_locations.map((loc, idx) => (
                    <span key={idx} className="skill-chip skill-chip-lavender">
                      {loc}
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, preferred_locations: prev.preferred_locations.filter((_, i) => i !== idx) }))}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: '4px' }}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Education */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-secondary)', margin: 0 }}>
                Academic records are evaluated against company CGPA thresholds, target graduation cohorts, and department branch restrictions.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  College or University Name *
                </label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="e.g. Indian Institute of Technology / BITS Pilani"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Degree Program *
                  </label>
                  <select
                    className="select-compact"
                    style={{ width: '100%' }}
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  >
                    <option value="B.Tech">B.Tech / B.E.</option>
                    <option value="Dual Degree (B.Tech + M.Tech)">Dual Degree (B.Tech + M.Tech)</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="B.Sc / BCA">B.Sc / BCA</option>
                    <option value="MCA / M.Sc">MCA / M.Sc</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Department / Branch of Study *
                  </label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="e.g. Computer Science & Engineering"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Graduation Year *
                  </label>
                  <select
                    className="select-compact"
                    style={{ width: '100%' }}
                    value={formData.graduation_year}
                    onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
                  >
                    <option value="2026">2026 (Graduating Batch)</option>
                    <option value="2027">2027 (Pre-final Year)</option>
                    <option value="2028">2028 (Sophomore)</option>
                    <option value="2029">2029 (Freshman)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Current Cumulative CGPA *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.cgpa_scale}
                    className="input-text"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    CGPA Scale (Default 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-text"
                    value={formData.cgpa_scale}
                    onChange={(e) => setFormData({ ...formData, cgpa_scale: parseFloat(e.target.value) || 10.0 })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Active Academic Backlogs
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-text"
                  style={{ maxWidth: '140px' }}
                  value={formData.backlogs}
                  onChange={(e) => setFormData({ ...formData, backlogs: parseInt(e.target.value) || 0 })}
                />
                <span style={{ fontSize: '0.725rem', color: 'var(--color-gray-secondary)', display: 'block', marginTop: '4px' }}>
                  Placement policy requires accurate disclosure. 0 active backlogs indicates a clean academic record.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Skills */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-secondary)', margin: 0 }}>
                Add your technical competencies, programming languages, databases, cloud platforms, and soft skills. The matching engine evaluates 50% score weighting from this inventory.
              </p>

              {/* Dynamic Skill Input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="input-text"
                  placeholder="Type any custom skill (e.g. PyTorch, Rust, Kubernetes, OWASP)..."
                  value={formData.newSkill}
                  onChange={(e) => setFormData({ ...formData, newSkill: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(formData.newSkill);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleAddSkill(formData.newSkill)}
                >
                  <Plus size={16} />
                  <span>Add Skill</span>
                </button>
              </div>

              {/* Verified Profile Skills */}
              <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', padding: '16px', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-charcoal)', marginBottom: '8px' }}>
                  Your Profile Skills ({formData.skills.length})
                </div>
                {formData.skills.length > 0 ? (
                  <div className="skills-chip-group">
                    {formData.skills.map((s, idx) => (
                      <span key={idx} className="skill-chip skill-chip-verified" style={{ fontSize: '0.8rem' }}>
                        <CheckCircle2 size={13} />
                        {s}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSkill(s)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: '6px', color: '#991B1B' }}
                          title="Remove skill"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-secondary)', fontStyle: 'italic' }}>
                    No skills added yet. Select from common suggestions below or type your own.
                  </div>
                )}
              </div>

              {/* Searchable Common Suggestions */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-secondary)', marginBottom: '8px' }}>
                  Common Industry Suggestions (Click to Add):
                </div>
                <div className="skills-chip-group">
                  {COMMON_SKILLS.filter(s => !formData.skills.includes(s)).map((cs, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className="skill-chip skill-chip-neutral"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleAddSkill(cs)}
                    >
                      + {cs}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Projects & Experience */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-secondary)', margin: 0 }}>
                Validated repositories and practical project demonstrations provide up to 20 points in deterministic match scoring.
              </p>

              {/* Add Project Form Box */}
              <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', padding: '16px', borderRadius: '4px' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-charcoal)', marginBottom: '12px' }}>
                  + Add Project or Internship Artifact
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                      Project Title *
                    </label>
                    <input
                      type="text"
                      className="input-text"
                      placeholder="e.g. Distributed Consensus Engine"
                      value={formData.newProjTitle}
                      onChange={(e) => setFormData({ ...formData, newProjTitle: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                      Repository / Demo URL
                    </label>
                    <input
                      type="text"
                      className="input-text"
                      placeholder="https://github.com/..."
                      value={formData.newProjUrl}
                      onChange={(e) => setFormData({ ...formData, newProjUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                    Technologies Used (Comma separated)
                  </label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="e.g. PyTorch, Python, Docker, FastAPI"
                    value={formData.newProjTech}
                    onChange={(e) => setFormData({ ...formData, newProjTech: e.target.value })}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                    Short Technical Summary & Contributions *
                  </label>
                  <textarea
                    className="input-text"
                    rows="2"
                    placeholder="Describe architecture, throughput metrics, or key algorithms implemented..."
                    value={formData.newProjDesc}
                    onChange={(e) => setFormData({ ...formData, newProjDesc: e.target.value })}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddProject}
                  disabled={!formData.newProjTitle.trim() || !formData.newProjDesc.trim()}
                >
                  <Plus size={14} />
                  <span>Insert Project Artifact</span>
                </button>
              </div>

              {/* List of Added Projects */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-charcoal)', marginBottom: '8px' }}>
                  Saved Project Artifacts ({formData.projects.length})
                </div>
                {formData.projects.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {formData.projects.map((proj, idx) => (
                      <div key={idx} style={{ backgroundColor: 'var(--warm-offwhite)', border: '1px solid var(--color-gray-border)', padding: '12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>{proj.title}</strong>
                          <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-secondary)', margin: '4px 0' }}>{proj.description}</p>
                          <div className="skills-chip-group" style={{ margin: 0 }}>
                            {(proj.technologies || []).map((t, ti) => (
                              <span key={ti} className="skill-chip skill-chip-lavender" style={{ fontSize: '0.675rem' }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleRemoveProject(idx)}
                          style={{ color: '#DC2626' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-secondary)', fontStyle: 'italic' }}>
                    No project artifacts entered yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Career Preferences */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-secondary)', margin: 0 }}>
                Configure work modes and role preferences to prioritize opportunities matching your career direction.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Work Arrangement Preference
                  </label>
                  <select
                    className="select-compact"
                    style={{ width: '100%' }}
                    value={formData.work_arrangement}
                    onChange={(e) => setFormData({ ...formData, work_arrangement: e.target.value })}
                  >
                    <option value="any">Open to Any (Remote / Hybrid / Onsite)</option>
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid Preferred</option>
                    <option value="onsite">On-site Preferred</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Employment Type
                  </label>
                  <select
                    className="select-compact"
                    style={{ width: '100%' }}
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                  >
                    <option value="both">Both Full-time & Internships</option>
                    <option value="full_time">Full-time Roles Only</option>
                    <option value="internship">Internships Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Target Job Roles
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="e.g. Machine Learning Engineer, Backend Developer..."
                    value={formData.newRole}
                    onChange={(e) => setFormData({ ...formData, newRole: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (formData.newRole.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            preferred_roles: [...prev.preferred_roles, prev.newRole.trim()],
                            newRole: ''
                          }));
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      if (formData.newRole.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          preferred_roles: [...prev.preferred_roles, prev.newRole.trim()],
                          newRole: ''
                        }));
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
                <div className="skills-chip-group">
                  {formData.preferred_roles.map((r, i) => (
                    <span key={i} className="skill-chip skill-chip-lavender">
                      {r}
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, preferred_roles: prev.preferred_roles.filter((_, idx) => idx !== i) }))}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: '4px' }}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                  Minimum CTC Expectation (INR in LPA, Optional)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="input-text"
                  placeholder="e.g. 15.0"
                  style={{ maxWidth: '200px' }}
                  value={formData.min_salary_expectation}
                  onChange={(e) => setFormData({ ...formData, min_salary_expectation: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 6: Privacy & Consent Directive */}
          {currentStep === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: 'var(--pale-lavender)', border: '1px solid var(--color-lavender-border)', padding: '16px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#4C1D95', fontSize: '0.85rem' }}>
                  <ShieldCheck size={18} />
                  <span>Granular Student Privacy Directives (Independent Controls)</span>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--color-charcoal-soft)' }}>
                  Per university placement regulations, permissions are not bundled into a single mandatory checkbox. You may independently enable, disable, or withdraw consent at any time.
                </p>
              </div>

              {/* Control 1: Automated Job Matching */}
              <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', padding: '16px', borderRadius: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.consent_matching}
                    onChange={(e) => setFormData({ ...formData, consent_matching: e.target.checked })}
                    style={{ accentColor: 'var(--primary-lavender)', width: '18px', height: '18px', marginTop: '2px' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                      1. Enable Deterministic Opportunity Matching
                    </strong>
                    <p style={{ fontSize: '0.775rem', color: 'var(--color-gray-secondary)', margin: '4px 0 0 0' }}>
                      Allows the CampusMatch deterministic matching engine to compare your verified education, CGPA, and skills against active vacancies.
                    </p>
                  </div>
                </label>
              </div>

              {/* Control 2: Personalized Alerts */}
              <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', padding: '16px', borderRadius: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.consent_job_alerts}
                    onChange={(e) => setFormData({ ...formData, consent_job_alerts: e.target.checked })}
                    style={{ accentColor: 'var(--primary-lavender)', width: '18px', height: '18px', marginTop: '2px' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                      2. Receive Personalized High-Affinity Job Alerts
                    </strong>
                    <p style={{ fontSize: '0.775rem', color: 'var(--color-gray-secondary)', margin: '4px 0 0 0' }}>
                      Sends cryptographic idempotency-verified email previews and notifications when a role with &ge;80% match is published.
                    </p>
                  </div>
                </label>
              </div>

              {/* Control 3: Recruiter Shortlist Sharing */}
              <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', padding: '16px', borderRadius: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.consent_recruiter_sharing}
                    onChange={(e) => setFormData({ ...formData, consent_recruiter_sharing: e.target.checked })}
                    style={{ accentColor: 'var(--primary-lavender)', width: '18px', height: '18px', marginTop: '2px' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                      3. Share Verified Profile with Authorized Partner Recruiters
                    </strong>
                    <p style={{ fontSize: '0.775rem', color: 'var(--color-gray-secondary)', margin: '4px 0 0 0' }}>
                      Allows approved campus recruiters (e.g. Google, Databricks, Razorpay) to inspect your verified academic standing, skills, and projects for interview shortlisting. Withdrawing this immediately redacts your information.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Footer */}
        <div style={{ padding: '16px 24px', backgroundColor: 'var(--warm-offwhite)', borderTop: '1px solid var(--color-gray-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                <ChevronLeft size={16} />
                <span>Previous Step</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onClose}
              >
                Save Draft & Exit
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {currentStep < 6 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  await handleSaveProgress(false);
                  setCurrentStep(prev => prev + 1);
                }}
              >
                <span>Save & Continue</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSubmitting}
                onClick={() => handleSaveProgress(true)}
              >
                <CheckCircle2 size={16} />
                <span>{isSubmitting ? 'Saving Profile...' : 'Complete Onboarding & View Matches'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
