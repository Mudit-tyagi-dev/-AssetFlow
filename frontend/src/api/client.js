import axios from 'axios';

// Use environment variable for API URL or fallback to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'https://undeferrable-nonclimactic-giavanna.ngrok-free.dev/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' // Necessary for ngrok
  }
});

// Request interceptor to attach JWT token to protected routes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    const publicEndpoints = [
      '/auth/login',
      '/auth/signup',
      '/auth/register-organization',
      '/auth/forgot-password',
      '/auth/reset-password'
    ];
    
    const isPublic = publicEndpoints.some(endpoint => config.url && config.url.includes(endpoint));
    
    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401s (token refresh logic would go here)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
          if (res.data.access_token) {
            localStorage.setItem('access_token', res.data.access_token);
            localStorage.setItem('refresh_token', res.data.refresh_token);
            
            originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
            return axios(originalRequest);
          }
        } catch (err) {
          // Refresh token is invalid/expired
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
