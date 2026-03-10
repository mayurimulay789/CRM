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
  // Existing methods
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

  getEnrollmentStats: async (params = {}) => {
    const response = await enrollmentApi.get('/stats/overview', { params });
    return response;
  },

  getFeeDelays: async () => {
    const response = await enrollmentApi.get('/fee-delays');
    return response;
  },

  addActivity: async (enrollmentId, activityData) => {
    const response = await enrollmentApi.post(`/${enrollmentId}/activities`, activityData);
    return response;
  },

  deleteEnrollmentByCounsellor: async (enrollmentId) => {
    const response = await enrollmentApi.delete(`/counsellor/${enrollmentId}`);
    return response;
  },

  // NEW METHODS FOR LATE FEES AND UPFRONT PAYMENTS

  /**
   * Get enrollments with late fees
   * @returns {Promise} Response with enrollments that have pending late fees
   */
  getEnrollmentsWithLateFees: async () => {
    const response = await enrollmentApi.get('/late-fees');
    return response;
  },

  /**
   * Get enrollments with upfront payments
   * @returns {Promise} Response with enrollments that have upfront payments
   */
  getEnrollmentsWithUpfrontPayment: async () => {
    const response = await enrollmentApi.get('/upfront-payments');
    return response;
  },

  /**
   * Apply late fees to an enrollment
   * @param {string} enrollmentId - The enrollment ID
   * @param {Object} data - { amount: number, reason: string }
   * @returns {Promise} Response with updated enrollment
   */
  applyLateFees: async (enrollmentId, data) => {
    const response = await enrollmentApi.post(`/${enrollmentId}/late-fees`, data);
    return response;
  },

  /**
   * Filter enrollments by late fees status
   * @param {Object} params - Query parameters including hasLateFees boolean
   * @returns {Promise} Response with filtered enrollments
   */
  filterEnrollmentsByLateFees: async (hasLateFees = true) => {
    const response = await enrollmentApi.get('/', { 
      params: { hasLateFees: hasLateFees.toString() } 
    });
    return response;
  },

  /**
   * Filter enrollments by upfront payment status
   * @param {Object} params - Query parameters including hasUpfrontPayment boolean
   * @returns {Promise} Response with filtered enrollments
   */
  filterEnrollmentsByUpfrontPayment: async (hasUpfrontPayment = true) => {
    const response = await enrollmentApi.get('/', { 
      params: { hasUpfrontPayment: hasUpfrontPayment.toString() } 
    });
    return response;
  },

  /**
   * Get late fees summary for an enrollment
   * @param {string} enrollmentId - The enrollment ID
   * @returns {Promise} Response with late fees details
   */
  getLateFeesSummary: async (enrollmentId) => {
    const response = await enrollmentApi.get(`/${enrollmentId}`);
    return response;
  },

  /**
   * Process upfront payment for enrollment
   * Note: This uses the payment API, but we're adding it here for convenience
   * @param {string} enrollmentId - The enrollment ID
   * @param {Object} paymentData - Payment data including amount, date, etc.
   * @returns {Promise} Response with updated enrollment
   */
  processUpfrontPayment: async (enrollmentId, paymentData) => {
    // This would typically be handled by payment API, but we're noting it here
    console.log('💳 Process upfront payment for enrollment:', enrollmentId, paymentData);
    // Forward to payment API (you might want to import paymentAPI here)
    const paymentAPI = (await import('./paymentAPI')).default;
    return paymentAPI.createPayment({
      ...paymentData,
      enrollment: enrollmentId,
      paymentType: 'upfront'
    });
  }
};

export default enrollmentAPI;