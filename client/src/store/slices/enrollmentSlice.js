import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import enrollmentAPI from '../api/enrollmentAPI';

// Async Thunks
export const fetchEnrollments = createAsyncThunk(
  'enrollments/fetchEnrollments',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🔄 fetchEnrollments thunk called with params:', params);
      const response = await enrollmentAPI.getAllEnrollments(params);
      console.log('📦 API Response:', response);
      console.log('📦 Response data:', response.data);
      
      // Handle different response structures
      const enrollmentsData = response.data.data || response.data;
      console.log('📦 Extracted enrollments data:', enrollmentsData);
      
      return enrollmentsData;
    } catch (error) {
      console.error('❌ fetchEnrollments error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrollments');
    }
  }
);

export const createEnrollment = createAsyncThunk(
  'enrollments/createEnrollment',
  async (enrollmentData, { rejectWithValue }) => {
    try {
      console.log('🔄 createEnrollment thunk called with data:', enrollmentData);
      const response = await enrollmentAPI.createEnrollment(enrollmentData);
      console.log('📦 Create enrollment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ createEnrollment error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create enrollment');
    }
  }
);

export const updateEnrollment = createAsyncThunk(
  'enrollments/updateEnrollment',
  async ({ enrollmentId, enrollmentData }, { rejectWithValue }) => {
    try {
      console.log('🔄 updateEnrollment thunk called for:', enrollmentId);
      const response = await enrollmentAPI.updateEnrollment(enrollmentId, enrollmentData);
      console.log('📦 Update enrollment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ updateEnrollment error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update enrollment');
    }
  }
);

export const fetchEnrollmentStats = createAsyncThunk(
  'enrollments/fetchEnrollmentStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await enrollmentAPI.getEnrollmentStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrollment statistics');
    }
  }
);

export const deleteEnrollmentByCounsellor = createAsyncThunk(
  'enrollments/deleteEnrollmentByCounsellor',
  async (enrollmentId, { rejectWithValue }) => {
    try {
      console.log('🔄 deleteEnrollmentByCounsellor thunk called for:', enrollmentId);
      const response = await enrollmentAPI.deleteEnrollmentByCounsellor(enrollmentId);
      console.log('📦 Delete enrollment response:', response.data);
      
      // Return both the response data and the enrollmentId for the reducer
      return {
        responseData: response.data,
        enrollmentId: enrollmentId
      };
    } catch (error) {
      console.error('❌ deleteEnrollmentByCounsellor error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete enrollment by counsellor');
    }
  }
);

// NEW THUNKS FOR LATE FEES AND UPFRONT PAYMENTS

/**
 * Fetch enrollments with late fees
 */
export const fetchEnrollmentsWithLateFees = createAsyncThunk(
  'enrollments/fetchEnrollmentsWithLateFees',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 fetchEnrollmentsWithLateFees thunk called');
      const response = await enrollmentAPI.getEnrollmentsWithLateFees();
      console.log('📦 Enrollments with late fees:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ fetchEnrollmentsWithLateFees error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrollments with late fees');
    }
  }
);

/**
 * Fetch enrollments with upfront payments
 */
export const fetchEnrollmentsWithUpfrontPayment = createAsyncThunk(
  'enrollments/fetchEnrollmentsWithUpfrontPayment',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 fetchEnrollmentsWithUpfrontPayment thunk called');
      const response = await enrollmentAPI.getEnrollmentsWithUpfrontPayment();
      console.log('📦 Enrollments with upfront payments:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ fetchEnrollmentsWithUpfrontPayment error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrollments with upfront payments');
    }
  }
);

/**
 * Apply late fees to an enrollment
 */
export const applyLateFees = createAsyncThunk(
  'enrollments/applyLateFees',
  async ({ enrollmentId, amount, reason }, { rejectWithValue, dispatch }) => {
    try {
      console.log('🔄 applyLateFees thunk called for:', enrollmentId, { amount, reason });
      const response = await enrollmentAPI.applyLateFees(enrollmentId, { amount, reason });
      console.log('📦 Apply late fees response:', response.data);
      
      // After applying late fees, refresh the enrollments list
      dispatch(fetchEnrollments());
      
      return {
        responseData: response.data,
        enrollmentId
      };
    } catch (error) {
      console.error('❌ applyLateFees error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to apply late fees');
    }
  }
);

/**
 * Filter enrollments by late fees status
 */
export const filterByLateFees = createAsyncThunk(
  'enrollments/filterByLateFees',
  async (hasLateFees = true, { rejectWithValue }) => {
    try {
      console.log('🔄 filterByLateFees thunk called:', { hasLateFees });
      const response = await enrollmentAPI.filterEnrollmentsByLateFees(hasLateFees);
      console.log('📦 Filtered enrollments:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ filterByLateFees error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to filter enrollments by late fees');
    }
  }
);

/**
 * Filter enrollments by upfront payment status
 */
export const filterByUpfrontPayment = createAsyncThunk(
  'enrollments/filterByUpfrontPayment',
  async (hasUpfrontPayment = true, { rejectWithValue }) => {
    try {
      console.log('🔄 filterByUpfrontPayment thunk called:', { hasUpfrontPayment });
      const response = await enrollmentAPI.filterEnrollmentsByUpfrontPayment(hasUpfrontPayment);
      console.log('📦 Filtered enrollments:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ filterByUpfrontPayment error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to filter enrollments by upfront payment');
    }
  }
);

// Initial State
const initialState = {
  enrollments: [],
  currentEnrollment: null,
  stats: null,
  loading: false,
  operationLoading: false,
  error: null,
  success: null,
  
  // NEW STATE FOR LATE FEES AND UPFRONT PAYMENTS
  lateFeesEnrollments: [], // Enrollments with pending late fees
  upfrontPaymentEnrollments: [], // Enrollments with upfront payments
  lateFeesLoading: false,
  upfrontPaymentLoading: false,
  lateFeesError: null,
  upfrontPaymentError: null,
  lateFeesSummary: null, // Summary of late fees for a specific enrollment
};

// Enrollment Slice
const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.lateFeesError = null;
      state.upfrontPaymentError = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentEnrollment: (state) => {
      state.currentEnrollment = null;
    },
    // NEW REDUCER to clear late fees summary
    clearLateFeesSummary: (state) => {
      state.lateFeesSummary = null;
    },
    // NEW REDUCER to update local state after late fee application
    updateEnrollmentLateFees: (state, action) => {
      const { enrollmentId, lateFees, totalLateFeesPaid, totalLateFeesPending } = action.payload;
      
      // Update in main enrollments list
      const enrollmentIndex = state.enrollments.findIndex(e => e._id === enrollmentId);
      if (enrollmentIndex !== -1) {
        state.enrollments[enrollmentIndex].lateFees = lateFees;
        state.enrollments[enrollmentIndex].totalLateFeesPaid = totalLateFeesPaid;
        state.enrollments[enrollmentIndex].totalLateFeesPending = totalLateFeesPending;
      }
      
      // Update in late fees enrollments list if present
      const lateFeesIndex = state.lateFeesEnrollments?.findIndex(e => e._id === enrollmentId);
      if (lateFeesIndex !== -1) {
        state.lateFeesEnrollments[lateFeesIndex].lateFees = lateFees;
        state.lateFeesEnrollments[lateFeesIndex].totalLateFeesPaid = totalLateFeesPaid;
        state.lateFeesEnrollments[lateFeesIndex].totalLateFeesPending = totalLateFeesPending;
      }
      
      // Update current enrollment if it's the one being modified
      if (state.currentEnrollment && state.currentEnrollment._id === enrollmentId) {
        state.currentEnrollment.lateFees = lateFees;
        state.currentEnrollment.totalLateFeesPaid = totalLateFeesPaid;
        state.currentEnrollment.totalLateFeesPending = totalLateFeesPending;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Enrollments
      .addCase(fetchEnrollments.pending, (state) => {
        console.log('⏳ fetchEnrollments pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        console.log('✅ fetchEnrollments fulfilled with payload:', action.payload);
        state.loading = false;
        
        // Handle different response structures
        const enrollmentsData = action.payload.data || action.payload;
        state.enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : [];
        
        console.log('💾 Updated enrollments in state:', state.enrollments.length);
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        console.log('❌ fetchEnrollments rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Enrollment
      .addCase(createEnrollment.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createEnrollment.fulfilled, (state, action) => {
        state.operationLoading = false;
        if (action.payload.data) {
          state.enrollments.unshift(action.payload.data);
        }
        state.success = action.payload.message || 'Enrollment created successfully';
      })
      .addCase(createEnrollment.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Update Enrollment
      .addCase(updateEnrollment.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateEnrollment.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedEnrollment = action.payload.data;
        if (updatedEnrollment) {
          const index = state.enrollments.findIndex(e => e._id === updatedEnrollment._id);
          if (index !== -1) {
            state.enrollments[index] = updatedEnrollment;
          }
          if (state.currentEnrollment && state.currentEnrollment._id === updatedEnrollment._id) {
            state.currentEnrollment = updatedEnrollment;
          }
        }
        state.success = action.payload.message || 'Enrollment updated successfully';
      })
      .addCase(updateEnrollment.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Stats
      .addCase(fetchEnrollmentStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEnrollmentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchEnrollmentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Enrollment by Counsellor
      .addCase(deleteEnrollmentByCounsellor.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteEnrollmentByCounsellor.fulfilled, (state, action) => {
        state.operationLoading = false;
        
        // Safely extract the enrollment ID to delete
        const enrollmentIdToDelete = action.payload.enrollmentId || 
                                   action.payload.responseData?.data?._id;
        
        console.log('🗑️ Deleting enrollment with ID:', enrollmentIdToDelete);
        
        // Remove the enrollment from the state
        if (enrollmentIdToDelete) {
          state.enrollments = state.enrollments.filter(e => e._id !== enrollmentIdToDelete);
          
          // Also clear current enrollment if it's the one being deleted
          if (state.currentEnrollment && state.currentEnrollment._id === enrollmentIdToDelete) {
            state.currentEnrollment = null;
          }
          
          // Remove from late fees enrollments if present
          if (state.lateFeesEnrollments) {
            state.lateFeesEnrollments = state.lateFeesEnrollments.filter(
              e => e._id !== enrollmentIdToDelete
            );
          }
          
          // Remove from upfront payment enrollments if present
          if (state.upfrontPaymentEnrollments) {
            state.upfrontPaymentEnrollments = state.upfrontPaymentEnrollments.filter(
              e => e._id !== enrollmentIdToDelete
            );
          }
        }
        
        state.success = action.payload.responseData?.message || 'Enrollment deleted successfully by counsellor';
      })
      .addCase(deleteEnrollmentByCounsellor.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // NEW REDUCERS FOR LATE FEES AND UPFRONT PAYMENTS
      
      // Fetch Enrollments with Late Fees
      .addCase(fetchEnrollmentsWithLateFees.pending, (state) => {
        state.lateFeesLoading = true;
        state.lateFeesError = null;
      })
      .addCase(fetchEnrollmentsWithLateFees.fulfilled, (state, action) => {
        state.lateFeesLoading = false;
        state.lateFeesEnrollments = action.payload.data || [];
      })
      .addCase(fetchEnrollmentsWithLateFees.rejected, (state, action) => {
        state.lateFeesLoading = false;
        state.lateFeesError = action.payload;
      })
      
      // Fetch Enrollments with Upfront Payment
      .addCase(fetchEnrollmentsWithUpfrontPayment.pending, (state) => {
        state.upfrontPaymentLoading = true;
        state.upfrontPaymentError = null;
      })
      .addCase(fetchEnrollmentsWithUpfrontPayment.fulfilled, (state, action) => {
        state.upfrontPaymentLoading = false;
        state.upfrontPaymentEnrollments = action.payload.data || [];
      })
      .addCase(fetchEnrollmentsWithUpfrontPayment.rejected, (state, action) => {
        state.upfrontPaymentLoading = false;
        state.upfrontPaymentError = action.payload;
      })
      
      // Apply Late Fees
      .addCase(applyLateFees.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(applyLateFees.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedEnrollment = action.payload.responseData?.data;
        
        if (updatedEnrollment) {
          // Update in main enrollments list
          const index = state.enrollments.findIndex(e => e._id === updatedEnrollment._id);
          if (index !== -1) {
            state.enrollments[index] = updatedEnrollment;
          }
          
          // Update in late fees enrollments list
          const lateFeesIndex = state.lateFeesEnrollments?.findIndex(
            e => e._id === updatedEnrollment._id
          );
          if (lateFeesIndex !== -1) {
            state.lateFeesEnrollments[lateFeesIndex] = updatedEnrollment;
          }
          
          // Update current enrollment
          if (state.currentEnrollment && state.currentEnrollment._id === updatedEnrollment._id) {
            state.currentEnrollment = updatedEnrollment;
          }
        }
        
        state.success = action.payload.responseData?.message || 'Late fees applied successfully';
      })
      .addCase(applyLateFees.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Filter by Late Fees
      .addCase(filterByLateFees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterByLateFees.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload.data || [];
      })
      .addCase(filterByLateFees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Filter by Upfront Payment
      .addCase(filterByUpfrontPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterByUpfrontPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload.data || [];
      })
      .addCase(filterByUpfrontPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  clearCurrentEnrollment,
  clearLateFeesSummary,
  updateEnrollmentLateFees
} = enrollmentSlice.actions;

export default enrollmentSlice.reducer;