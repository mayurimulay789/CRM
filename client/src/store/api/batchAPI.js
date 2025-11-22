import axiosInstance from '../../utils/axios';

const batchAPI = {
  // Create a new batch
  createBatch: async (batchData) => {
    const response = await axiosInstance.post('/batches', batchData);
    return response;
  },

  // Get all batches with optional filters
  getBatches: async (params = {}) => {
    const response = await axiosInstance.get('/batches', { params });
    return response;
  },

  // Get single batch by ID
  getBatch: async (id) => {
    const response = await axiosInstance.get(`/batches/${id}`);
    return response;
  },

  // Update batch
  updateBatch: async (id, batchData) => {
    const response = await axiosInstance.put(`/batches/${id}, batchData`);
    return response;
  },

  // Delete batch
  deleteBatch: async (id) => {
    const response = await axiosInstance.delete(`/batches/${id}`);
    return response;
  },

  // Get batch statistics
  getBatchStats: async () => {
    const response = await axiosInstance.get('/batches/stats');
    return response;
  },
};

export default batchAPI;