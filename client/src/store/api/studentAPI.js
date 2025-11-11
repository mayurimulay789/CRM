import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for student API
const studentApi = axios.create({
  baseURL: `${API_URL}/students`,
});

// Add auth interceptor to student API
studentApi.interceptors.request.use(
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

const studentAPI = {
  // Get all students with filtering and pagination
  getAllStudents: async (params = {}) => {
    const response = await studentApi.get('/', { params });
    return response;
  },

  // Get student by ID
  getStudentById: async (studentId) => {
    const response = await studentApi.get(`/${studentId}`);
    return response;
  },

  // Get student by studentId
  getStudentByStudentId: async (studentId) => {
    const response = await studentApi.get(`/studentId/${studentId}`);
    return response;
  },

  // Create new student
  createStudent: async (studentData) => {
    const response = await studentApi.post('/', studentData);
    return response;
  },

  // Update student
  updateStudent: async (studentId, studentData) => {
    const response = await studentApi.put(`/${studentId}`, studentData);
    return response;
  },

  // Delete student
  deleteStudent: async (studentId) => {
    const response = await studentApi.delete(`/${studentId}`);
    return response;
  },

  // Toggle student status
  toggleStudentStatus: async (studentId) => {
    const response = await studentApi.patch(`/${studentId}/toggle-status`);
    return response;
  },

  // Get student statistics
  getStudentStats: async () => {
    const response = await studentApi.get('/stats/summary');
    return response;
  },
};

export default studentAPI;