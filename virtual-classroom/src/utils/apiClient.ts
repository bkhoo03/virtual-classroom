import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Configured axios instance for API calls
 * Automatically includes auth token in requests
 */
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    // Bypass ngrok browser warning
    'ngrok-skip-browser-warning': 'true',
  },
  withCredentials: true,
});

/**
 * Request interceptor to add auth token
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (using 'accessToken' key for consistency with AuthService)
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle auth errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
