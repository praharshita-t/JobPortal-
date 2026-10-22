import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Briefcase, 
  Users, 
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../utils/api';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login', // 'login' | 'register'
  onAuthSuccess
}) {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'student'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'register') {
      if (formData.password !== formData.confirm_password) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (formData.password.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        const res = await api.auth.register({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
          role: formData.role
        });
        setSuccessMsg('Registration successful! Redirecting to student profile onboarding...');
        setTimeout(() => {
          onAuthSuccess(res.user, true); // true = requires onboarding
          onClose();
        }, 600);
      } else {
        const res = await api.auth.login({
          email: formData.email,
          password: formData.password
        });
        setSuccessMsg('Authentication successful!');
        setTimeout(() => {
          onAuthSuccess(res.user, !res.user.is_onboarded);
          onClose();
        }, 500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'student') {
      setFormData({
        full_name: 'Aarav Sharma',
        email: 'aarav.sharma@campus.edu',
        password: 'Password123!',
        confirm_password: 'Password123!',
        role: 'student'
      });
    } else if (role === 'recruiter') {
      setFormData({
        full_name: 'Priya Nair',
        email: 'priya.nair@talent-partner.com',
        password: 'Password123!',
        confirm_password: 'Password123!',
        role: 'recruiter'
      });
    } else {
      setFormData({
        full_name: 'Dr. Rajesh Sen',
        email: 'rajesh.sen@placement.university.edu',
        password: 'Password123!',
        confirm_password: 'Password123!',
        role: 'admin'
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-lg" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="label-eyebrow" style={{ color: 'var(--color-charcoal-soft)', marginBottom: '4px' }}>
              CampusMatch AI Security
            </div>
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: '2rem', margin: 0 }}>
              {mode === 'register' ? 'Register Real Account' : 'Sign In with Credentials'}
            </h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: '28px' }}>
          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-gray-border)', paddingBottom: '14px', marginBottom: '18px' }}>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => { setMode('login'); setErrorMsg(null); }}
            >
              Log In
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
              onClick={() => { setMode('register'); setErrorMsg(null); }}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="eligibility-alert-fail" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="eligibility-alert-pass" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-text"
                  placeholder="e.g. Ananya Sharma"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                className="input-text"
                placeholder="name@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Password * (Argon2id Protected)
              </label>
              <input
                type="password"
                required
                className="input-text"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    className="input-text"
                    placeholder="Repeat password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Account Type *
                  </label>
                  <select
                    className="select-compact"
                    style={{ width: '100%' }}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="student">Student (Job matching & verified profile)</option>
                    <option value="recruiter">Corporate Recruiter (Talent discovery)</option>
                  </select>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-secondary)', display: 'block', marginTop: '2px' }}>
                    Administrator accounts require direct authorization from the Placement Office.
                  </span>
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ marginTop: '10px', padding: '12px' }}
              disabled={isLoading}
            >
              <span>{isLoading ? 'Verifying with Backend...' : mode === 'register' ? 'Complete Registration' : 'Authenticate & Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Development Demo Convenience Box */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-gray-border)', backgroundColor: 'var(--warm-offwhite)', padding: '12px', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gray-secondary)', marginBottom: '8px' }}>
              Optional Development Convenience (Pre-seeded Demo Credentials):
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.725rem', padding: '3px 8px' }}
                onClick={() => fillDemoAccount('student')}
              >
                Autofill Student Demo (Aarav)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.725rem', padding: '3px 8px' }}
                onClick={() => fillDemoAccount('recruiter')}
              >
                Autofill Recruiter Demo (Priya)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.725rem', padding: '3px 8px' }}
                onClick={() => fillDemoAccount('admin')}
              >
                Autofill Admin Demo (Dr. Sen)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
