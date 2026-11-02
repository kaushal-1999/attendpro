import axios from 'axios';

function normalizeBase(url) {
  if (!url) return 'http://localhost:5000';
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  return u.replace(/\/+$/, ''); // strip trailing slash
}

const BASE = normalizeBase(import.meta.env.VITE_API_URL);

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('attendpro_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('attendpro_token');
      localStorage.removeItem('attendpro_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const AuthAPI = {
  login: (mobile, password) => api.post('/api/auth/login', { mobile, password }),
  me:    () => api.get('/api/auth/me')
};

export const AdminAPI = {
  clients:             () => api.get('/api/admin/clients'),
  stats:               () => api.get('/api/admin/stats'),
  createClient:        (data) => api.post('/api/admin/clients', data),
  updateClient:        (id, data) => api.patch(`/api/admin/clients/${id}`, data),
  resetClientPassword: (id) => api.post(`/api/passwords/admin/clients/${id}/reset`),
  changeClientPassword:(id, newPassword) =>
    api.post(`/api/passwords/admin/clients/${id}/change`, { newPassword })
};
