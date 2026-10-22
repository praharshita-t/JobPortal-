import {
  initialStudents,
  initialJobs,
  initialWorkflowStages,
  initialNotifications,
  initialAdminAuditLog
} from '../data/initialData';

const STORAGE_KEYS = {
  STUDENTS: 'campusmatch_students_v1',
  JOBS: 'campusmatch_jobs_v1',
  WORKFLOW: 'campusmatch_workflow_v1',
  NOTIFICATIONS: 'campusmatch_notifications_v1',
  AUDIT_LOGS: 'campusmatch_audit_logs_v1',
  CURRENT_USER: 'campusmatch_current_user_v1',
  AUTOMATION_ACTIVE: 'campusmatch_automation_active_v1'
};

export function getStoredData() {
  try {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS)) || initialStudents;
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS)) || initialJobs;
    const workflow = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKFLOW)) || initialWorkflowStages;
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || initialNotifications;
    const auditLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) || initialAdminAuditLog;
    const automationActive = localStorage.getItem(STORAGE_KEYS.AUTOMATION_ACTIVE) !== 'false';
    const currentUserRole = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'student'; // 'student' | 'recruiter' | 'admin'

    return {
      students,
      jobs,
      workflow,
      notifications,
      auditLogs,
      automationActive,
      currentUserRole
    };
  } catch (e) {
    console.error('Storage reading error:', e);
    return {
      students: initialStudents,
      jobs: initialJobs,
      workflow: initialWorkflowStages,
      notifications: initialNotifications,
      auditLogs: initialAdminAuditLog,
      automationActive: true,
      currentUserRole: 'student'
    };
  }
}

export function saveStoredData(data) {
  try {
    if (data.students) localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
    if (data.jobs) localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(data.jobs));
    if (data.workflow) localStorage.setItem(STORAGE_KEYS.WORKFLOW, JSON.stringify(data.workflow));
    if (data.notifications) localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));
    if (data.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data.auditLogs));
    if (typeof data.automationActive === 'boolean') {
      localStorage.setItem(STORAGE_KEYS.AUTOMATION_ACTIVE, String(data.automationActive));
    }
    if (data.currentUserRole) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, data.currentUserRole);
  } catch (e) {
    console.error('Storage saving error:', e);
  }
}

export function resetToDefaults() {
  localStorage.clear();
  return {
    students: initialStudents,
    jobs: initialJobs,
    workflow: initialWorkflowStages,
    notifications: initialNotifications,
    auditLogs: initialAdminAuditLog,
    automationActive: true,
    currentUserRole: 'student'
  };
}
