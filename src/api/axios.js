import axios from 'axios';

// Connect directly to the newly deployed live backend
const api = axios.create({ baseURL: 'https://easeexam-backend.onrender.com/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const { response } = err;
    if (response && response.status === 401) {
      // Only logout if we actually have a token but it's rejected by the server
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(err);
  }

);

export default api;
