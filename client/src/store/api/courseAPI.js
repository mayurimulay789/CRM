import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for course API
const courseApi = axios.create({
  baseURL: `${API_URL}/courses`,
});

// Add auth interceptor to course API
courseApi.interceptors.request.use(
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

const courseAPI = {
  // Get all courses
  getAllCourses: async (active = null) => {
    const params = active !== null ? { active } : {};
    const response = await courseApi.get('/', { params });
    return response;
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    const response = await courseApi.get(`/${courseId}`);
    return response;
  },

  // Create new course
  createCourse: async (courseData) => {
    const response = await courseApi.post('/', courseData);
    return response;
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    const response = await courseApi.put(`/${courseId}`, courseData);
    return response;
  },

  // Delete course
  deleteCourse: async (courseId) => {
    const response = await courseApi.delete(`/${courseId}`);
    return response;
  },

  // Toggle course status
  toggleCourseStatus: async (courseId) => {
    const response = await courseApi.patch(`/${courseId}/toggle-status`);
    return response;
  },
};

export default courseAPI;