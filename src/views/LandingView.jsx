import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Briefcase, 
  Users, 
  Sliders, 
  Sparkles,
  Lock
} from 'lucide-react';

export default function LandingView({
  onSelectRoleAndLogin
}) {
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('aarav.sharma@campus.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleRoleQuickSelect = (role) => {
    setSelectedRole(role);
    if (role === 'student') setEmail('aarav.sharma@campus.edu');
    else if (role === 'recruiter') setEmail('priya.nair@talent-partner.com');
    else setEmail('rajesh.sen@placement.university.edu');
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onSelectRoleAndLogin(selectedRole);
    }, 400);
  };

  return (
    <div style={{ backgroundColor: 'var(--warm-offwhite)', minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', flexDirection: 'column' }}>
      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {/* Editorial Hero Block */}
        <div style={{ maxWidth: '980px', margin: '20px 0 48px 0' }}>
          <div className="editorial-header-eyebrow">
            <span className="badge-editorial badge-charcoal">Campus Placement Intelligence</span>
            <span className="badge-editorial badge-lavender">2026 Academic Season</span>
            <span className="label-eyebrow">&bull; Explainable Gating Engine</span>
          </div>

          <h1 className="editorial-headline-xl" style={{ fontSize: 'clamp(3rem, 6vw, 5.2rem)', margin: '14px 0 20px 0' }}>
            Better matches. <br />
            <span className="font-editorial-italic">Fewer missed opportunities.</span>
          </h1>

          <p className="editorial-subhead" style={{ fontSize: '1.25rem', maxWidth: '720px', lineHeight: 1.6 }}>
            CampusMatch AI unites institutional student records, deterministic skill overlap calculations, and consent-protected recruiter shortlists into one coherent career intelligence system.
          </p>
        </div>

        {/* 4-Part Visual Workflow Representation */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--color-charcoal-soft)', marginBottom: '14px' }}>
            Integrated Institutional Lifecycle
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Step 1 */}
            <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', padding: '20px', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gray-secondary)', marginBottom: '6px' }}>
                01 / VACANCIES
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
                Verified Job Openings
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-gray-secondary)', margin: 0, lineHeight: 1.5 }}>
                Authorized recruitment drives with validated CGPA cutoffs, department restrictions, and formal compensation disclosures.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ backgroundColor: 'var(--pale-lavender)', border: '1px solid var(--color-lavender-border)', padding: '20px', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4C1D95', marginBottom: '6px' }}>
                02 / MATCHING
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
                Multi-Vector Intelligence
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-charcoal-soft)', margin: 0, lineHeight: 1.5 }}>
                Rigorous calculation combining skill overlap, project repositories, academic standing, and uncompromised eligibility gating.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ backgroundColor: 'var(--color-surface-white)', border: '1px solid var(--color-gray-border)', padding: '20px', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gray-secondary)', marginBottom: '6px' }}>
                03 / ALERTS
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
                Personalized Notifications
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-gray-secondary)', margin: 0, lineHeight: 1.5 }}>
                Idempotency-audited candidate communications with full transparent explanations of why the candidate matched.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ backgroundColor: 'var(--muted-sage-bg)', border: '1px solid #C2E4D9', padding: '20px', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-sage-dark)', marginBottom: '6px' }}>
                04 / SHORTLISTS
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
                Consent-Cleared Talent
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--muted-sage-dark)', margin: 0, lineHeight: 1.5 }}>
                Recruiter candidate discovery strictly governed by student consent. Personal PII protected from unauthorized release.
              </p>
            </div>
          </div>
        </div>

        {/* Lightweight, Professional Sign-in Area */}
        <div 
          style={{ 
            backgroundColor: 'var(--color-surface-white)', 
            border: '1px solid var(--color-charcoal)', 
            boxShadow: 'var(--shadow-editorial)',
            borderRadius: '6px', 
            padding: '36px',
            maxWidth: '640px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '18px', borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '12px' }}>
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '1.85rem', margin: 0 }}>
              Access Placement Portal
            </h2>
            <span style={{ fontSize: '0.775rem', color: 'var(--color-gray-secondary)' }}>
              Authorized University Single Sign-On
            </span>
          </div>

          {/* Quick Role Select Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              type="button"
              className={`btn btn-sm ${selectedRole === 'student' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleRoleQuickSelect('student')}
              style={{ flex: 1 }}
            >
              <Briefcase size={14} />
              <span>Student Account</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${selectedRole === 'recruiter' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleRoleQuickSelect('recruiter')}
              style={{ flex: 1 }}
            >
              <Users size={14} />
              <span>Partner Recruiter</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${selectedRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleRoleQuickSelect('admin')}
              style={{ flex: 1 }}
            >
              <Sliders size={14} />
              <span>Placement Admin</span>
            </button>
          </div>

          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Authorized University Email
              </label>
              <input
                type="email"
                className="input-text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Institutional Password
              </label>
              <input
                type="password"
                className="input-text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ marginTop: '10px', padding: '12px', fontSize: '0.95rem' }}
              disabled={isAuthenticating}
            >
              <span>{isAuthenticating ? 'Authenticating Credentials...' : `Enter CampusMatch AI as ${selectedRole.toUpperCase()}`}</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-secondary)', textAlign: 'center', marginTop: '6px' }}>
              Connected to institutional authentication authority &bull; Session data saved locally
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
