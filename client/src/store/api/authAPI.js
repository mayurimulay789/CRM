import axiosInstance from '../../utils/axios';

const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response;
  },

  // Logout user
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response;
  },

  // Get current user
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await axiosInstance.put('/auth/myprofile', userData);
    return response;
  },
};

export default authAPI;