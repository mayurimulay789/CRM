import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for batch API
const batchApi = axios.create({
  baseURL: `${API_URL}/batches`,
});

// Add auth interceptor to batch API
batchApi.interceptors.request.use(
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

const batchAPI = {
  // Create a new batch
  createBatch: async (batchData) => {
    const response = await batchApi.post('/', batchData);
    return response;
  },

  // Get all batches with optional filters
  getBatches: async (params = {}) => {
    const response = await batchApi.get('/', { params });
    return response;
  },

  // Get single batch by ID
  getBatch: async (id) => {
    const response = await batchApi.get(`/${id}`);
    return response;
  },

  // Update batch
  updateBatch: async (id, batchData) => {
    const response = await batchApi.put(`/${id}`, batchData);
    return response;
  },

  // Delete batch
  deleteBatch: async (id) => {
    const response = await batchApi.delete(`/${id}`);
    return response;
  },

  // Get batch statistics
  getBatchStats: async () => {
    const response = await batchApi.get('/stats');
    return response;
  },
};

export default batchAPI;
