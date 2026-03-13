import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const enrollmentApi = axios.create({
  baseURL: `${API_URL}/enrollments`,
});

enrollmentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('🚀 API Request:', {
    url: config.url,
    method: config.method,
    params: config.params,
    data: config.data
  });
  return config;
});

enrollmentApi.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return Promise.reject(error);
  }
);

const enrollmentAPI = {
  getAllEnrollments: async (params = {}) => {
    console.log('📡 Fetching enrollments with params:', params);
    const response = await enrollmentApi.get('/', { params });
    return response;
  },

  getEnrollmentById: async (enrollmentId) => {
    const response = await enrollmentApi.get(`/${enrollmentId}`);
    return response;
  },

  createEnrollment: async (enrollmentData) => {
    const response = await enrollmentApi.post('/', enrollmentData);
    return response;
  },

  updateEnrollment: async (enrollmentId, enrollmentData) => {
    const response = await enrollmentApi.put(`/${enrollmentId}`, enrollmentData);
    return response;
  },

  deleteEnrollment: async (enrollmentId) => {
    const response = await enrollmentApi.delete(`/${enrollmentId}`);
    return response;
  },

  getEnrollmentStats: async (params = {}) => {
    const response = await enrollmentApi.get('/stats/overview', { params });
    return response;
  },

  getFeeDelays: async () => {
    const response = await enrollmentApi.get('/fee-delays');
    return response;
  },

  approveEnrollment: async (enrollmentId) => {
    const response = await enrollmentApi.put(`/${enrollmentId}/approve`);
    return response;
  },

  rejectEnrollment: async (enrollmentId) => {
    const response = await enrollmentApi.put(`/${enrollmentId}/reject`);
    return response;
  },

  addActivity: async (enrollmentId, activityData) => {
    const response = await enrollmentApi.post(`/${enrollmentId}/activities`, activityData);
    return response;
  },

  getPendingEnrollments: async () => {
    const response = await enrollmentApi.get('/', { 
      params: { enrollmentStatus: 'pending' } 
    });
    return response;
  },

  getApprovedEnrollments: async () => {
    const response = await enrollmentApi.get('/', { 
      params: { enrollmentStatus: 'approved' } 
    });
    return response;
  },

  getRejectedEnrollments: async () => {
    const response = await enrollmentApi.get('/', { 
      params: { enrollmentStatus: 'rejected' } 
    });
    return response;
  },

  getActiveStudents: async () => {
    const response = await enrollmentApi.get('/', { 
      params: { status: 'active' } 
    });
    return response;
  },

  getCompletedStudents: async () => {
    const response = await enrollmentApi.get('/', { 
      params: { status: 'completed' } 
    });
    return response;
  }
};

export default enrollmentAPI;