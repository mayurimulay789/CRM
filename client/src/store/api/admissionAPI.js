import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for admission API
const admissionApi = axios.create({
  baseURL: `${API_URL}/admissions`,
});

// Add auth interceptor to admission API
admissionApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
  // Get all admissions with filters - FIXED ENDPOINT
  getAllAdmissions: async (params = {}) => {
    const response = await admissionApi.get('', { params });
    return response;
  },

  // Get admission by ID
  getAdmissionById: async (admissionId) => {
    const response = await admissionApi.get(`/${admissionId}`);
    return response;
  },

  // Get admission by admission number
  getAdmissionByAdmissionNo: async (admissionNo) => {
    const response = await admissionApi.get(`/admissionNo/${admissionNo}`);
    return response;
  },

  // Get admissions by student
  getAdmissionsByStudent: async (studentId) => {
    const response = await admissionApi.get(`/student/${studentId}`);
    return response;
  },

  // Get admissions by course
  getAdmissionsByCourse: async (courseId) => {
    const response = await admissionApi.get(`/course/${courseId}`);
    return response;
  },

  // Create new admission
  createAdmission: async (admissionData) => {
    const response = await admissionApi.post('', admissionData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Update admission
  updateAdmission: async (admissionId, admissionData) => {
    const response = await admissionApi.put(`/${admissionId}`, admissionData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Update admission status
  updateAdmissionStatus: async (admissionId, statusData) => {
    const response = await admissionApi.patch(`/${admissionId}/status`, statusData);
    return response;
  },

  // Verify admission email
  verifyAdmissionEmail: async (admissionId) => {
    const response = await admissionApi.patch(`/${admissionId}/verify-email`);
    return response;
  },

  // Delete admission
  deleteAdmission: async (admissionId) => {
    const response = await admissionApi.delete(`/${admissionId}`);
    return response;
  },

  // Get admission statistics
  getAdmissionStats: async () => {
    const response = await admissionApi.get('/stats/summary');
    return response;
  },
};

export default admissionAPI;