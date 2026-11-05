import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach either voter or admin token
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('rfut_admin_token');
  const voterToken = localStorage.getItem('rfut_voter_token');

  const isAdminRequest =
    config.url?.startsWith('/admin') ||
    config.url?.startsWith('/nominees') ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

  if (isAdminRequest && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (voterToken) {
    config.headers.Authorization = `Bearer ${voterToken}`;
  }

  return config;
});

export default api;
