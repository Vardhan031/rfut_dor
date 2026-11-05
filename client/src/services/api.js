import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach either voter or admin token
api.interceptors.request.use((config) => {
  // If the request is directed to admin endpoints, attach admin token
  if (config.url?.startsWith('/admin') || config.url?.startsWith('/nominees') && config.method !== 'get') {
    const adminToken = localStorage.getItem('rfut_admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else {
    // Voter endpoints attach voter token
    const voterToken = localStorage.getItem('rfut_voter_token');
    if (voterToken) {
      config.headers.Authorization = `Bearer ${voterToken}`;
    }
  }
  return config;
});

export default api;
