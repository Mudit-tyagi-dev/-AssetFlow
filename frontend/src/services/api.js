import axios from 'axios';

const API_BASE_URL = 'https://undeferrable-nonclimactic-giavanna.ngrok-free.dev/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Bypass ngrok's landing/warning page
    'ngrok-skip-browser-warning': 'true',
  },
});

// Add a request interceptor to attach the JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    // Check both standard keys for JWT tokens
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
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
// Add a response interceptor to catch 403 errors for orgless users
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      const detail = error.response.data?.detail;
      const isOrgless = typeof detail === 'string' && detail.toLowerCase().includes('organization');
      if (isOrgless) {
        window.location.href = '/organization-setup';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
