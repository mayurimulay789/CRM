import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentAPI from '../api/paymentAPI';

// Async Thunks
export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getAllPayments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.createPayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment');
    }
  }
);

export const approvePayment = createAsyncThunk(
  'payments/approvePayment',
  async ({ paymentId, verificationNotes }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.approvePayment(paymentId, { verificationNotes });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve payment');
    }
  }
);

export const rejectPayment = createAsyncThunk(
  'payments/rejectPayment',
  async ({ paymentId, verificationNotes }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.rejectPayment(paymentId, { verificationNotes });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject payment');
    }
  }
);

export const fetchPaymentStats = createAsyncThunk(
  'payments/fetchPaymentStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getPaymentStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment statistics');
    }
  }
);

// Initial State
const initialState = {
  payments: [],
  pendingApprovals: [],
  currentPayment: null,
  stats: null,
  loading: false,
  operationLoading: false,
  error: null,
  success: null,
};

// Payment Slice
const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data || [];
        state.success = 'Payments fetched successfully';
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Payment
      .addCase(createPayment.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.operationLoading = false;
        if (action.payload.data) {
          state.payments.unshift(action.payload.data);
        }
        state.success = action.payload.message || 'Payment recorded successfully';
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      // Approve Payment
      .addCase(approvePayment.fulfilled, (state, action) => {
        const updatedPayment = action.payload.data;
        if (updatedPayment) {
          const index = state.payments.findIndex(p => p._id === updatedPayment._id);
          if (index !== -1) {
            state.payments[index] = updatedPayment;
          }
          // Remove from pending approvals if it was there
          state.pendingApprovals = state.pendingApprovals.filter(p => p._id !== updatedPayment._id);
        }
        state.success = action.payload.message || 'Payment approved successfully';
      })
      // Reject Payment
      .addCase(rejectPayment.fulfilled, (state, action) => {
        const updatedPayment = action.payload.data;
        if (updatedPayment) {
          const index = state.payments.findIndex(p => p._id === updatedPayment._id);
          if (index !== -1) {
            state.payments[index] = updatedPayment;
          }
          // Remove from pending approvals
          state.pendingApprovals = state.pendingApprovals.filter(p => p._id !== updatedPayment._id);
        }
        state.success = action.payload.message || 'Payment rejected successfully';
      })
      // Fetch Stats
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      });
  },
});

export const { clearError, clearSuccess, clearCurrentPayment } = paymentSlice.actions;
export default paymentSlice.reducer;