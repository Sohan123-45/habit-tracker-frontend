import axios from 'axios';

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_REDIRECT}api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Optional request interceptor if we ever need to append anything dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to catch unauthorized access globally
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    const requestUrl = error.config?.url || '';
    // Skip auth-error dispatch for login/register — those pages handle their
    // own error toasts locally. The global event is only for "session expired"
    // scenarios on protected routes.
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (!isAuthEndpoint) {
      // Clear user from local storage so UI doesn't think they're logged in
      localStorage.removeItem('user');
      
      let errMsg = error.response?.data?.message || 'Authentication failed';
      if (errMsg.toLowerCase().includes('success')) {
        errMsg = 'Access denied or session expired.';
      }

      // Dispatch a custom event to handled by React without a full page reload
      window.dispatchEvent(new CustomEvent('auth-error', { 
        detail: { message: errMsg } 
      }));
    }
  }
  return Promise.reject(error);
});
