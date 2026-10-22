import React, { useState } from 'react';
import { 
  Compass, 
  Briefcase, 
  Users, 
  Sliders, 
  Bell, 
  Menu, 
  X, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  LogOut,
  LogIn,
  UserCheck
} from 'lucide-react';

export default function Navbar({
  activeView,
  setActiveView,
  currentUser,
  onOpenAuthModal,
  onOpenOnboardingModal,
  onLogout,
  notifications = []
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => n.status !== 'read').length;

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="app-header">
      <div className="nav-container">
        {/* Brand Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a 
            href="#home" 
            className="nav-brand"
            onClick={(e) => { e.preventDefault(); handleNavClick('landing'); }}
            title="CampusMatch AI — Career Intelligence"
          >
            <div className="brand-wordmark">
              CampusMatch <span className="accent">AI</span>
            </div>
          </a>

          {/* Primary Nav Links */}
          <nav>
            <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              {currentUser?.role === 'student' && (
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeView === 'student' ? 'active' : ''}`}
                    onClick={() => handleNavClick('student')}
                  >
                    <Briefcase size={16} />
                    <span>My Career Space</span>
                  </button>
                </li>
              )}

              <li className="nav-item">
                <button
                  className={`nav-link ${activeView === 'jobs' ? 'active' : ''}`}
                  onClick={() => handleNavClick('jobs')}
                >
                  <Compass size={16} />
                  <span>Opportunity Explorer</span>
                </button>
              </li>

              {(currentUser?.role === 'recruiter' || currentUser?.role === 'admin') && (
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeView === 'recruiter' ? 'active' : ''}`}
                    onClick={() => handleNavClick('recruiter')}
                  >
                    <Users size={16} />
                    <span>Talent Discovery</span>
                  </button>
                </li>
              )}

              {currentUser?.role === 'admin' && (
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeView === 'admin' ? 'active' : ''}`}
                    onClick={() => handleNavClick('admin')}
                  >
                    <Sliders size={16} />
                    <span>Operations Control</span>
                  </button>
                </li>
              )}

              <li className="nav-item">
                <button
                  className={`nav-link ${activeView === 'notifications' ? 'active' : ''}`}
                  onClick={() => handleNavClick('notifications')}
                >
                  <Bell size={16} />
                  <span>Notification Center</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Right Section: User Identity, Profile Button & Logout */}
        <div className="nav-actions">
          {currentUser ? (
            <>
              {/* If student, show Edit Profile Onboarding button */}
              {currentUser.role === 'student' && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={onOpenOnboardingModal}
                  title="Update your student profile and preferences"
                >
                  <UserCheck size={14} />
                  <span>Edit Profile</span>
                </button>
              )}

              {/* Notification Inbox Button */}
              <button 
                className="notif-bell-btn"
                onClick={() => handleNavClick('notifications')}
                title="Open Notification Center & Email Previews"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="notif-indicator-badge">{unreadCount}</span>
                )}
              </button>

              {/* Authenticated User Pill */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '4px 10px 4px 4px',
                  backgroundColor: 'var(--color-surface-white)',
                  border: '1px solid var(--color-gray-border)',
                  borderRadius: '20px',
                  fontSize: '0.8rem'
                }}
              >
                <div 
                  style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--pale-lavender)',
                    color: '#4C1D95',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    border: '1px solid var(--primary-lavender)'
                  }}
                >
                  {currentUser.full_name?.slice(0, 2).toUpperCase() || 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>
                    {currentUser.full_name}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-gray-secondary)' }}>
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                className="btn btn-ghost btn-sm"
                onClick={onLogout}
                title="Log out of session"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button 
              className="btn btn-primary btn-sm"
              onClick={onOpenAuthModal}
            >
              <LogIn size={15} />
              <span>Log In / Register</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="btn btn-ghost btn-sm"
            style={{ display: 'none' }}
            id="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
