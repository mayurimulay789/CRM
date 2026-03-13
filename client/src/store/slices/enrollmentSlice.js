import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import enrollmentAPI from '../api/enrollmentAPI';

// Async Thunks
export const fetchEnrollments = createAsyncThunk(
  'enrollments/fetchEnrollments',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🔄 fetchEnrollments thunk called with params:', params);
      const response = await enrollmentAPI.getAllEnrollments(params);
      
      const enrollmentsData = response.data.data || response.data;
      
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
      const response = await enrollmentAPI.createEnrollment(enrollmentData);
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
      const response = await enrollmentAPI.updateEnrollment(enrollmentId, enrollmentData);
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

export const deleteEnrollment = createAsyncThunk(
  'enrollments/deleteEnrollment',
  async (enrollmentId, { rejectWithValue }) => {
    try {
      const response = await enrollmentAPI.deleteEnrollment(enrollmentId);
      return {
        responseData: response.data,
        enrollmentId: enrollmentId
      };
    } catch (error) {
      console.error('❌ deleteEnrollment error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete enrollment');
    }
  }
);

// Approval Thunks
export const approveEnrollment = createAsyncThunk(
  'enrollments/approveEnrollment',
  async (enrollmentId, { rejectWithValue, dispatch }) => {
    try {
      const response = await enrollmentAPI.approveEnrollment(enrollmentId);
      dispatch(fetchEnrollments());
      return {
        responseData: response.data,
        enrollmentId
      };
    } catch (error) {
      console.error('❌ approveEnrollment error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to approve enrollment');
    }
  }
);

export const rejectEnrollment = createAsyncThunk(
  'enrollments/rejectEnrollment',
  async (enrollmentId, { rejectWithValue, dispatch }) => {
    try {
      const response = await enrollmentAPI.rejectEnrollment(enrollmentId);
      dispatch(fetchEnrollments());
      return {
        responseData: response.data,
        enrollmentId
      };
    } catch (error) {
      console.error('❌ rejectEnrollment error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to reject enrollment');
    }
  }
);

export const fetchFeeDelays = createAsyncThunk(
  'enrollments/fetchFeeDelays',
  async (_, { rejectWithValue }) => {
    try {
      const response = await enrollmentAPI.getFeeDelays();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch fee delays');
    }
  }
);

export const addActivity = createAsyncThunk(
  'enrollments/addActivity',
  async ({ enrollmentId, activityData }, { rejectWithValue }) => {
    try {
      const response = await enrollmentAPI.addActivity(enrollmentId, activityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add activity');
    }
  }
);

// Initial State
const initialState = {
  enrollments: [],
  currentEnrollment: null,
  stats: null,
  feeDelays: [],
  loading: false,
  operationLoading: false,
  error: null,
  success: null
};

// Enrollment Slice
const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentEnrollment: (state) => {
      state.currentEnrollment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Enrollments
      .addCase(fetchEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        const enrollmentsData = action.payload.data || action.payload;
        state.enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : [];
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
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
      
      // Fetch Fee Delays
      .addCase(fetchFeeDelays.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeeDelays.fulfilled, (state, action) => {
        state.loading = false;
        state.feeDelays = action.payload.data || [];
      })
      .addCase(fetchFeeDelays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Enrollment
      .addCase(deleteEnrollment.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteEnrollment.fulfilled, (state, action) => {
        state.operationLoading = false;
        
        const enrollmentIdToDelete = action.payload.enrollmentId;
        
        if (enrollmentIdToDelete) {
          state.enrollments = state.enrollments.filter(e => e._id !== enrollmentIdToDelete);
          
          if (state.currentEnrollment && state.currentEnrollment._id === enrollmentIdToDelete) {
            state.currentEnrollment = null;
          }
        }
        
        state.success = action.payload.responseData?.message || 'Enrollment deleted successfully';
      })
      .addCase(deleteEnrollment.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Approve Enrollment
      .addCase(approveEnrollment.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(approveEnrollment.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.success = action.payload.responseData?.message || 'Enrollment approved successfully';
      })
      .addCase(approveEnrollment.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Reject Enrollment
      .addCase(rejectEnrollment.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(rejectEnrollment.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.success = action.payload.responseData?.message || 'Enrollment rejected successfully';
      })
      .addCase(rejectEnrollment.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Add Activity
      .addCase(addActivity.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(addActivity.fulfilled, (state) => {
        state.operationLoading = false;
        state.success = 'Activity added successfully';
      })
      .addCase(addActivity.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  clearCurrentEnrollment
} = enrollmentSlice.actions;

export default enrollmentSlice.reducer;