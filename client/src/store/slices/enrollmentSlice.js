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

// Initial State
const initialState = {
  enrollments: [],
  currentEnrollment: null,
  stats: null,
  loading: false,
  operationLoading: false,
  error: null,
  success: null,
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
    },
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
        state.enrollments = Array.isArray(action.payload) ? action.payload : [];
        state.success = 'Enrollments fetched successfully';
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
      .addCase(fetchEnrollmentStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
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
        }
        
        state.success = action.payload.responseData?.message || 'Enrollment deleted successfully by counsellor';
      })
      .addCase(deleteEnrollmentByCounsellor.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearCurrentEnrollment } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;