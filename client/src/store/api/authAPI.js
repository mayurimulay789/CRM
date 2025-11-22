import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL:", API_URL);

// Create axios instance for auth API
const authApi = axios.create({
  baseURL: `${API_URL}/auth`,
});

// Add auth interceptor to auth API
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = Bearer `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await authApi.post('/register', userData);
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await authApi.post('/login', credentials);
    return response;
  },

  // Logout user
  logout: async () => {
    const response = await authApi.post('/logout');
    return response;
  },

  // Get current user
  getMe: async () => {
    const response = await authApi.get('/me');
    return response;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await authApi.put('/myprofile', userData);
    return response;
  },
    // ✅ NEW: Get all counsellors (Admin only)
  getAllCounsellors: async (queryParams = {}) => {
    const response = await authApi.get('/allCounsellor', {
      params: queryParams // Pass query parameters like page, limit, search
    });
    return response;
  }
};

export default authAPI;