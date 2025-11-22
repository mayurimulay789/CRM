import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const paymentApi = axios.create({
  baseURL: `${API_URL}/payments`,
});

paymentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const paymentAPI = {
  getAllPayments: async (params = {}) => {
    console.log("Fetching payments with params:", params);
    const response = await paymentApi.get('/', { params });
    console.log("Received payments response:", response);
    return response;
  },

  getPaymentById: async (paymentId) => {
    const response = await paymentApi.get(`/${paymentId}`);
    return response;
  },

  createPayment: async (paymentData) => {
    const response = await paymentApi.post('/', paymentData);
    return response;
  },

  approvePayment: async (paymentId, approvalData) => {
    const response = await paymentApi.put(`/${paymentId}/approve`, approvalData);
    return response;
  },

  rejectPayment: async (paymentId, rejectionData) => {
    const response = await paymentApi.put(`/${paymentId}/reject`, rejectionData);
    return response;
  },

  getPendingApprovals: async () => {
    const response = await paymentApi.get('/pending-approval');
    return response;
  },

  getPaymentStats: async (params = {}) => {
    const response = await paymentApi.get('/stats/overview', { params });
    return response;
  },

  bulkApprovePayments: async (paymentIds, verificationNotes) => {
    const response = await paymentApi.post('/bulk-approve', {
      paymentIds,
      verificationNotes
    });
    return response;
  },
};

export default paymentAPI;