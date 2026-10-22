import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import StudentOnboardingModal from './components/StudentOnboardingModal';
import ExternalApplyModal from './components/ExternalApplyModal';
import ExplainMatchModal from './components/ExplainMatchModal';
import VacancyCreateModal from './components/VacancyCreateModal';
import CandidateDetailDrawer from './components/CandidateDetailDrawer';

import LandingView from './views/LandingView';
import StudentDashboard from './views/StudentDashboard';
import JobDiscoveryView from './views/JobDiscoveryView';
import RecruiterDashboard from './views/RecruiterDashboard';
import AdminDashboard from './views/AdminDashboard';
import NotificationCenter from './views/NotificationCenter';

import { api } from './utils/api';
import { initialWorkflowStages, initialNotifications, initialAdminAuditLog } from './data/initialData';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('landing');
  const [isInitializing, setIsInitializing] = useState(true);

  // Data from backend
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [matches, setMatches] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState(initialAdminAuditLog);

  // Modals & Drawers
  const [authModalState, setAuthModalState] = useState({ isOpen: false, mode: 'login' });
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [externalApplyJob, setExternalApplyJob] = useState(null);
  const [explainMatchItem, setExplainMatchItem] = useState(null);
  const [vacancyModalOpen, setVacancyModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedJobIdForExplorer, setSelectedJobIdForExplorer] = useState(null);

  // 1. Initial Load: Check session & load jobs
  useEffect(() => {
    async function initApp() {
      try {
        // Load opportunities from backend
        const allJobs = await api.jobs.getAll();
        setJobs(allJobs);
        if (allJobs.length > 0) {
          setSelectedJobIdForExplorer(allJobs[0].id);
        }

        // Check active session
        const me = await api.auth.getMe();
        if (me && me.id) {
          setCurrentUser(me);
          if (me.role === 'student') {
            await refreshStudentData();
            setActiveView('student');
            if (!me.is_onboarded) {
              setOnboardingOpen(true);
            }
          } else if (me.role === 'recruiter') {
            setActiveView('recruiter');
          } else {
            setActiveView('admin');
          }
        }
      } catch (e) {
        // Not logged in or anonymous
        setCurrentUser(null);
        setActiveView('landing');
      } finally {
        setIsInitializing(false);
      }
    }
    initApp();
  }, []);

  const refreshStudentData = async () => {
    try {
      const [prof, comp, matchResults, notifs] = await Promise.all([
        api.students.getProfile(),
        api.students.getCompletion(),
        api.students.getMatches(),
        api.students.getNotifications()
      ]);
      setStudentProfile(prof);
      setProfileCompletion(comp);
      setMatches(matchResults);
      setNotifications(notifs.length > 0 ? notifs : initialNotifications);
    } catch (e) {
      console.error('Error loading student data:', e);
    }
  };

  const handleAuthSuccess = async (user, requiresOnboarding) => {
    setCurrentUser(user);
    if (user.role === 'student') {
      await refreshStudentData();
      setActiveView('student');
      if (requiresOnboarding) {
        setOnboardingOpen(true);
      }
    } else if (user.role === 'recruiter') {
      setActiveView('recruiter');
    } else {
      setActiveView('admin');
    }
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setCurrentUser(null);
    setStudentProfile(null);
    setMatches([]);
    setActiveView('landing');
  };

  const handleSaveStudentProfile = async (payload) => {
    const updated = await api.students.updateProfile(payload);
    await refreshStudentData();
  };

  return (
    <div className="app-root">
      {/* Navigation Shell */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalState({ isOpen: true, mode: 'login' })}
        onOpenOnboardingModal={() => setOnboardingOpen(true)}
        onLogout={handleLogout}
        notifications={notifications}
      />

      {/* Main Views */}
      <main>
        {activeView === 'landing' && (
          <LandingView
            onSelectRoleAndLogin={(role) => {
              setAuthModalState({ isOpen: true, mode: 'login' });
            }}
          />
        )}

        {activeView === 'student' && (
          <StudentDashboard
            studentProfile={studentProfile}
            matches={matches}
            profileCompletion={profileCompletion}
            onOpenMatchModal={(matchItem) => setExplainMatchItem(matchItem)}
            onOpenApplyModal={(job) => setExternalApplyJob(job)}
            onOpenOnboardingModal={() => setOnboardingOpen(true)}
            onSelectJobForExplorer={(jobId) => {
              setSelectedJobIdForExplorer(jobId);
              setActiveView('jobs');
            }}
          />
        )}

        {activeView === 'jobs' && (
          <JobDiscoveryView
            jobs={jobs}
            selectedJobId={selectedJobIdForExplorer}
            onSelectJob={(id) => setSelectedJobIdForExplorer(id)}
            onOpenMatchModal={(matchItem) => setExplainMatchItem(matchItem)}
            onOpenApplyModal={(job) => setExternalApplyJob(job)}
          />
        )}

        {activeView === 'recruiter' && (
          <RecruiterDashboard
            students={[]} // Handled by Recruiter table API
            jobs={jobs}
            onOpenCreateVacancy={() => setVacancyModalOpen(true)}
            onSelectCandidate={(candidate) => setSelectedCandidate(candidate)}
            onShortlistCandidate={(id) => alert(`Candidate ID ${id} shortlisted!`)}
          />
        )}

        {activeView === 'admin' && (
          <AdminDashboard
            workflowStages={initialWorkflowStages}
            auditLogs={auditLogs}
            notifications={notifications}
            automationActive={true}
            onToggleAutomation={() => {}}
            onTriggerManualMatchingCycle={async () => {
              await api.admin.triggerCycle();
              const logs = await api.admin.getAuditLogs();
              setAuditLogs(logs);
            }}
          />
        )}

        {activeView === 'notifications' && (
          <NotificationCenter
            notifications={notifications.length > 0 ? notifications : initialNotifications}
            onSendTestNotification={() => alert('Test alert transmitted to SMTP dispatch relay.')}
          />
        )}
      </main>

      {/* Real User Auth Modal */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ isOpen: false, mode: 'login' })}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Multi-Step Student Onboarding Modal */}
      <StudentOnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        initialProfile={studentProfile}
        onSaveProfile={handleSaveStudentProfile}
      />

      {/* External Opportunity Apply Modal */}
      <ExternalApplyModal
        job={externalApplyJob}
        isOpen={!!externalApplyJob}
        onClose={() => setExternalApplyJob(null)}
      />

      {/* Explainable Matching Intelligence Modal */}
      {explainMatchItem && (
        <ExplainMatchModal
          job={explainMatchItem.job || explainMatchItem}
          student={studentProfile || {
            name: currentUser?.full_name || 'Student',
            department: studentProfile?.branch || 'Computer Science',
            cgpa: studentProfile?.cgpa || 8.5,
            graduationYear: studentProfile?.graduation_year || 2026,
            skills: studentProfile?.skills || [],
            projects: studentProfile?.projects || [],
            consentApproved: studentProfile?.consent_matching !== false
          }}
          isOpen={!!explainMatchItem}
          onClose={() => setExplainMatchItem(null)}
          onApply={() => setExternalApplyJob(explainMatchItem.job || explainMatchItem)}
        />
      )}

      {/* Vacancy Creation Modal */}
      <VacancyCreateModal
        isOpen={vacancyModalOpen}
        onClose={() => setVacancyModalOpen(false)}
        onSaveVacancy={(newJob) => {
          setJobs(prev => [newJob, ...prev]);
        }}
      />

      {/* Recruiter Candidate Detail Drawer */}
      <CandidateDetailDrawer
        candidate={selectedCandidate}
        selectedJob={jobs.find(j => j.id === selectedJobIdForExplorer) || jobs[0]}
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onShortlist={(id) => {
          alert('Candidate shortlisted!');
          setSelectedCandidate(null);
        }}
      />
    </div>
  );
}
