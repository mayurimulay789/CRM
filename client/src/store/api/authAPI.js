import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL:", API_URL);

const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response;
  },

  // Logout user
  logout: async () => {
    const response = await axios.post(`${API_URL}/auth/logout`);
    return response;
  },

  // Get current user
  getMe: async () => {
    const response = await axios.get(`${API_URL}/auth/me`);
    return response;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await axios.put(`${API_URL}/auth/myprofile`, userData);
    return response;
  },



};

export default authAPI;