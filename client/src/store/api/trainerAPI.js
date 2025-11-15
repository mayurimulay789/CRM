import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for trainer API
const trainerApi = axios.create({
  baseURL: `${API_URL}/trainers`,
});

// Add auth interceptor to trainer API
trainerApi.interceptors.request.use(
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

const trainerAPI = {
  // Create a new trainer
  createTrainer: async (trainerData) => {
    const response = await trainerApi.post('/', trainerData);
    return response;
  },

  // Get all trainers with optional filters
  getTrainers: async (params = {}) => {
    const response = await trainerApi.get('/', { params });
    return response;
  },

  // Get single trainer by ID
  getTrainer: async (id) => {
    const response = await trainerApi.get(`/${id}`);
    return response;
  },

  // Update trainer
  updateTrainer: async (id, trainerData) => {
    const response = await trainerApi.put(`/${id}`, trainerData);
    return response;
  },

  // Delete trainer
  deleteTrainer: async (id) => {
    const response = await trainerApi.delete(`/${id}`);
    return response;
  },
};

export default trainerAPI;
