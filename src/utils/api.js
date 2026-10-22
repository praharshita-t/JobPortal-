/**
 * CampusMatch AI — API Client
 * Connects directly to versioned FastAPI endpoints with cookie + token support.
 */

const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const token = localStorage.getItem('campusmatch_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include' // Transmit HTTP-only cookies
  });

  if (!response.ok) {
    let errMessage = 'An unexpected error occurred';
    try {
      const errData = await response.json();
      errMessage = errData.detail || errData.message || JSON.stringify(errData);
    } catch {
      errMessage = `Server returned ${response.status}: ${response.statusText}`;
    }
    const error = new Error(errMessage);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export const api = {
  auth: {
    register: async (payload) => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.access_token) {
        localStorage.setItem('campusmatch_token', res.access_token);
      }
      return res;
    },
    login: async (payload) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.access_token) {
        localStorage.setItem('campusmatch_token', res.access_token);
      }
      return res;
    },
    logout: async () => {
      localStorage.removeItem('campusmatch_token');
      try {
        await request('/auth/logout', { method: 'POST' });
      } catch (e) {
        // Ignore logout errors
      }
    },
    getMe: () => request('/auth/me')
  },

  students: {
    getProfile: () => request('/students/me'),
    updateProfile: (payload) => request('/students/me', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
    getCompletion: () => request('/students/me/completion'),
    getMatches: () => request('/students/me/matches'),
    updateConsent: (payload) => request('/students/me/consent', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
    getNotifications: () => request('/students/me/notifications')
  },

  jobs: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'All') {
          query.append(k, v);
        }
      });
      const qStr = query.toString();
      return request(`/jobs${qStr ? '?' + qStr : ''}`);
    },
    getOne: (id) => request(`/jobs/${id}`),
    updateVerification: (jobId, verification_status, notes = null) => {
      const query = new URLSearchParams({ verification_status });
      if (notes) query.append('notes', notes);
      return request(`/jobs/${jobId}/verification?${query.toString()}`, {
        method: 'PATCH'
      });
    }
  },

  recruiter: {
    getCandidates: (jobId = null) => {
      const q = jobId ? `?job_id=${encodeURIComponent(jobId)}` : '';
      return request(`/recruiter/candidates${q}`);
    }
  },

  admin: {
    getOverview: () => request('/admin/overview'),
    getAuditLogs: (limit = 50) => request(`/admin/audit-logs?limit=${limit}`),
    triggerCycle: () => request('/admin/trigger-matching-cycle', { method: 'POST' }),
    getSources: () => request('/admin/sources'),
    runSources: () => request('/admin/sources/run', { method: 'POST' })
  }
};
