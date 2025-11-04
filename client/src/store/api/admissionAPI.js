import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with auth header
const api = axios.create({
  baseURL: `${API_URL}/admission`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Attaching token to request:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const admissionAPI = {
  // Create new admission
  createAdmission: async (admissionData) => {
    const response = await api.post('/admissions', admissionData); // Use api instead of axios
    return response;
  },

  // Get all admissions
  getAdmissions: async () => {
    const response = await api.get('/admissions'); // Use api instead of axios
    return response;
  },

  // Get single admission by admissionNo
  getAdmission: async (admissionNo) => {
    const response = await api.get(`/admissions/${admissionNo}`); // Use api instead of axios
    return response;
  },

  // Update admission
  updateAdmission: async (admissionNo, admissionData) => {
    const response = await api.put(`/admissions/${admissionNo}`, admissionData); // Use api instead of axios
    return response;
  },

  // Delete admission
  deleteAdmission: async (admissionNo) => {
    const response = await api.delete(`/admissions/${admissionNo}`); // Use api instead of axios
    return response;
  },

  // Verify email
  verifyEmail: async (admissionNo) => {
    const response = await api.patch(`/admissions/${admissionNo}/verify-email`); // Use api instead of axios
    return response;
  }
};

export default admissionAPI;