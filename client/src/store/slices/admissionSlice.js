import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import admissionAPI from '../api/admissionAPI';

// Async Thunks
export const createAdmission = createAsyncThunk(
  'admissions/createAdmission',
  async (admissionData, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.createAdmission(admissionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to create admission'
      );
    }
  }
);

export const getAdmissions = createAsyncThunk(
  'admissions/getAdmissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.getAdmissions();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to fetch admissions'
      );
    }
  }
);

export const getAdmission = createAsyncThunk(
  'admissions/getAdmission',
  async (admissionNo, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.getAdmission(admissionNo);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to fetch admission'
      );
    }
  }
);

export const updateAdmission = createAsyncThunk(
  'admissions/updateAdmission',
  async ({ admissionNo, admissionData }, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.updateAdmission(admissionNo, admissionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to update admission'
      );
    }
  }
);

export const deleteAdmission = createAsyncThunk(
  'admissions/deleteAdmission',
  async (admissionNo, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.deleteAdmission(admissionNo);
      return { admissionNo, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to delete admission'
      );
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'admissions/verifyEmail',
  async (admissionNo, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.verifyEmail(admissionNo);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to verify email'
      );
    }
  }
);

// NEW: Update admission status
export const updateAdmissionStatus = createAsyncThunk(
  'admissions/updateAdmissionStatus',
  async ({ admissionNo, status }, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.updateAdmission(admissionNo, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to update admission status'
      );
    }
  }
);

// Initial State
const initialState = {
  admissions: [],
  currentAdmission: null,
  loading: false,
  error: null,
  success: null,
  operationLoading: false,
  operationError: null,
  operationSuccess: null,
};

// Admission Slice
const admissionSlice = createSlice({
  name: 'admissions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.operationError = null;
    },
    clearSuccess: (state) => {
      state.success = null;
      state.operationSuccess = null;
    },
    clearCurrentAdmission: (state) => {
      state.currentAdmission = null;
    },
    setAdmissions: (state, action) => {
      state.admissions = action.payload;
    },
    resetAdmissionState: (state) => {
      state.admissions = [];
      state.currentAdmission = null;
      state.loading = false;
      state.error = null;
      state.success = null;
      state.operationLoading = false;
      state.operationError = null;
      state.operationSuccess = null;
    },
    // NEW: Add admission manually (useful for real-time updates)
    addAdmission: (state, action) => {
      state.admissions.unshift(action.payload);
    },
    // NEW: Update admission in list manually
    updateAdmissionInList: (state, action) => {
      const index = state.admissions.findIndex(
        admission => admission.admissionNo === action.payload.admissionNo
      );
      if (index !== -1) {
        state.admissions[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Admission
      .addCase(createAdmission.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.operationSuccess = null;
      })
      .addCase(createAdmission.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.operationSuccess = 'Admission created successfully';
        // Add to beginning of list
        state.admissions.unshift(action.payload.data);
      })
      .addCase(createAdmission.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      })
      
      // Get All Admissions
      .addCase(getAdmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.admissions = action.payload.data;
        state.success = 'Admissions fetched successfully';
      })
      .addCase(getAdmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Single Admission
      .addCase(getAdmission.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
      })
      .addCase(getAdmission.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.currentAdmission = action.payload.data;
        state.operationSuccess = 'Admission fetched successfully';
      })
      .addCase(getAdmission.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      })
      
      // Update Admission
      .addCase(updateAdmission.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.operationSuccess = null;
      })
      .addCase(updateAdmission.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.operationSuccess = 'Admission updated successfully';
        
        // Update in admissions list
        const index = state.admissions.findIndex(
          admission => admission.admissionNo === action.payload.data.admissionNo
        );
        if (index !== -1) {
          state.admissions[index] = action.payload.data;
        }
        
        // Update current admission if it's the one being updated
        if (state.currentAdmission && state.currentAdmission.admissionNo === action.payload.data.admissionNo) {
          state.currentAdmission = action.payload.data;
        }
      })
      .addCase(updateAdmission.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      })
      
      // Update Admission Status
      .addCase(updateAdmissionStatus.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.operationSuccess = null;
      })
      .addCase(updateAdmissionStatus.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.operationSuccess = `Admission status updated to ${action.payload.data.status}`;
        
        // Update in admissions list
        const index = state.admissions.findIndex(
          admission => admission.admissionNo === action.payload.data.admissionNo
        );
        if (index !== -1) {
          state.admissions[index] = action.payload.data;
        }
        
        // Update current admission if it's the one being updated
        if (state.currentAdmission && state.currentAdmission.admissionNo === action.payload.data.admissionNo) {
          state.currentAdmission = action.payload.data;
        }
      })
      .addCase(updateAdmissionStatus.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      })
      
      // Delete Admission
      .addCase(deleteAdmission.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.operationSuccess = null;
      })
      .addCase(deleteAdmission.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.operationSuccess = action.payload.message;
        
        // Remove from admissions list
        state.admissions = state.admissions.filter(
          admission => admission.admissionNo !== action.payload.admissionNo
        );
        
        // Clear current admission if it's the one being deleted
        if (state.currentAdmission && state.currentAdmission.admissionNo === action.payload.admissionNo) {
          state.currentAdmission = null;
        }
      })
      .addCase(deleteAdmission.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      })
      
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.operationLoading = true;
        state.operationError = null;
        state.operationSuccess = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.operationSuccess = 'Email verified successfully';
        
        // Update in admissions list
        const index = state.admissions.findIndex(
          admission => admission.admissionNo === action.payload.data.admissionNo
        );
        if (index !== -1) {
          state.admissions[index] = action.payload.data;
        }
        
        // Update current admission if it's the one being verified
        if (state.currentAdmission && state.currentAdmission.admissionNo === action.payload.data.admissionNo) {
          state.currentAdmission = action.payload.data;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.operationLoading = false;
        state.operationError = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  clearCurrentAdmission, 
  setAdmissions,
  resetAdmissionState,
  addAdmission,
  updateAdmissionInList
} = admissionSlice.actions;

export default admissionSlice.reducer;