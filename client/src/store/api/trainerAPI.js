import axiosInstance from '../../utils/axios';

const trainerAPI = {
  // Create a new trainer
  createTrainer: async (trainerData) => {
    const response = await axiosInstance.post('/trainers', trainerData);
    return response;
  },

  // Get all trainers with optional filters
  getTrainers: async (params = {}) => {
    const response = await axiosInstance.get('/trainers', { params });
    return response;
  },

  // Get single trainer by ID
  getTrainer: async (id) => {
    const response = await axiosInstance.get(`/trainers/${id}`);
    return response;
  },

  // Update trainer
  updateTrainer: async (id, trainerData) => {
    const response = await axiosInstance.put(`/trainers/${id}, trainerData`);
    return response;
  },

  // Delete trainer
  deleteTrainer: async (id) => {
    const response = await axiosInstance.delete(`/trainers/${id}`);
    return response;
  },
};

export default trainerAPI;