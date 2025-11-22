import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import admissionAPI from '../api/admissionAPI';

// Async Thunks
export const fetchAdmissions = createAsyncThunk(
  'admissions/fetchAdmissions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.getAllAdmissions(params);
      console.log("Fetched admissions response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to fetch admissions'
      );
    }
  }
);

export const fetchAdmissionById = createAsyncThunk(
  'admissions/fetchAdmissionById',
  async (admissionId, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.getAdmissionById(admissionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to fetch admission'
      );
    }
  }
);

export const fetchAdmissionByAdmissionNo = createAsyncThunk(
  'admissions/fetchAdmissionByAdmissionNo',
  async (admissionNo, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.getAdmissionByAdmissionNo(admissionNo);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to fetch admission'
      );
    }
  }
);

export const fetchAdmissionsByStudent = createAsyncThunk(
  'admissions/fetchAdmissionsByStudent',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.getAdmissionsByStudent(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to fetch student admissions'
      );
    }
  }
);

export const fetchAdmissionsByCourse = createAsyncThunk(
  'admissions/fetchAdmissionsByCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.getAdmissionsByCourse(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to fetch course admissions'
      );
    }
  }
);

export const createAdmission = createAsyncThunk(
  'admissions/createAdmission',
  async (admissionData, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.createAdmission(admissionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to create admission'
      );
    }
  }
);

export const updateAdmission = createAsyncThunk(
  'admissions/updateAdmission',
  async ({ admissionId, admissionData }, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.updateAdmission(admissionId, admissionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to update admission'
      );
    }
  }
);

export const updateAdmissionStatus = createAsyncThunk(
  'admissions/updateAdmissionStatus',
  async ({ admissionId, statusData }, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.updateAdmissionStatus(admissionId, statusData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to update admission status'
      );
    }
  }
);

export const verifyAdmissionEmail = createAsyncThunk(
  'admissions/verifyAdmissionEmail',
  async (admissionId, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.verifyAdmissionEmail(admissionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to verify email'
      );
    }
  }
);

export const deleteAdmission = createAsyncThunk(
  'admissions/deleteAdmission',
  async (admissionId, { rejectWithValue }) => {
    try {
      await admissionAPI.deleteAdmission(admissionId);
      return admissionId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to delete admission'
      );
    }
  }
);

export const fetchAdmissionStats = createAsyncThunk(
  'admissions/fetchAdmissionStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await admissionAPI.getAdmissionStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to fetch admission statistics'
      );
    }
  }
);

// Initial State
const initialState = {
  admissions: [],
  currentAdmission: null,
  studentAdmissions: [],
  courseAdmissions: [],
  stats: null,
  loading: false,
  operationLoading: false,
  error: null,
  operationSuccess: null, // Changed from success to operationSuccess to match component
  operation: null,
};

// Admission Slice
const admissionSlice = createSlice({
  name: 'admissions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.operationSuccess = null; // Updated to match component
    },
    clearCurrentAdmission: (state) => {
      state.currentAdmission = null;
    },
    clearStudentAdmissions: (state) => {
      state.studentAdmissions = [];
    },
    clearCourseAdmissions: (state) => {
      state.courseAdmissions = [];
    },
    setOperation: (state, action) => {
      state.operation = action.payload;
    },
    clearOperation: (state) => {
      state.operation = null;
    },
    resetFormState: (state) => {
      state.operationLoading = false;
      state.error = null;
      state.operationSuccess = null; // Updated to match component
    },
    // Manual updates for real-time sync
    updateAdmissionInList: (state, action) => {
      const index = state.admissions.findIndex(admission => admission._id === action.payload._id);
      if (index !== -1) {
        state.admissions[index] = { ...state.admissions[index], ...action.payload };
      }
    },
    addAdmissionToList: (state, action) => {
      state.admissions.unshift(action.payload);
    },
    removeAdmissionFromList: (state, action) => {
      state.admissions = state.admissions.filter(admission => admission._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Admissions - FIXED: Handle different response formats
      .addCase(fetchAdmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operation = 'fetch';
      })
      .addCase(fetchAdmissions.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different response formats
        if (Array.isArray(action.payload)) {
          state.admissions = action.payload;
        } else if (action.payload.data && Array.isArray(action.payload.data)) {
          state.admissions = action.payload.data;
        } else if (action.payload.admissions && Array.isArray(action.payload.admissions)) {
          state.admissions = action.payload.admissions;
        } else {
          state.admissions = [];
        }
        state.operation = null;
        state.operationSuccess = 'Admissions fetched successfully';
        console.log("Redux state updated with admissions:", state.admissions.length, "admissions");
      })
      .addCase(fetchAdmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.operation = null;
        state.admissions = [];
      })
      
      // Fetch Admission By ID
      .addCase(fetchAdmissionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmissionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAdmission = action.payload.data || action.payload;
        state.operationSuccess = 'Admission fetched successfully';
      })
      .addCase(fetchAdmissionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentAdmission = null;
      })
      
      // Fetch Admission By Admission No
      .addCase(fetchAdmissionByAdmissionNo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmissionByAdmissionNo.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAdmission = action.payload.data || action.payload;
        state.operationSuccess = 'Admission fetched successfully';
      })
      .addCase(fetchAdmissionByAdmissionNo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentAdmission = null;
      })
      
      // Fetch Admissions By Student
      .addCase(fetchAdmissionsByStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmissionsByStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.studentAdmissions = action.payload.data || action.payload || [];
        state.operationSuccess = 'Student admissions fetched successfully';
      })
      .addCase(fetchAdmissionsByStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.studentAdmissions = [];
      })
      
      // Fetch Admissions By Course
      .addCase(fetchAdmissionsByCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmissionsByCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courseAdmissions = action.payload.data || action.payload || [];
        state.operationSuccess = 'Course admissions fetched successfully';
      })
      .addCase(fetchAdmissionsByCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.courseAdmissions = [];
      })
      
      // Create Admission
      .addCase(createAdmission.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.operationSuccess = null;
        state.operation = 'create';
      })
      .addCase(createAdmission.fulfilled, (state, action) => {
        state.operationLoading = false;
        const newAdmission = action.payload.data || action.payload;
        if (newAdmission) {
          state.admissions.unshift(newAdmission);
        }
        state.operation = null;
        state.operationSuccess = action.payload.message || 'Admission created successfully';
        state.error = null;
      })
      .addCase(createAdmission.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.operationSuccess = null;
        state.operation = null;
      })
      
      // Update Admission
      .addCase(updateAdmission.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.operationSuccess = null;
        state.operation = 'update';
      })
      .addCase(updateAdmission.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedAdmission = action.payload.data || action.payload;
        if (updatedAdmission) {
          const index = state.admissions.findIndex(admission => admission._id === updatedAdmission._id);
          if (index !== -1) {
            state.admissions[index] = updatedAdmission;
          }
          if (state.currentAdmission && state.currentAdmission._id === updatedAdmission._id) {
            state.currentAdmission = updatedAdmission;
          }
        }
        state.operation = null;
        state.operationSuccess = action.payload.message || 'Admission updated successfully';
        state.error = null;
      })
      .addCase(updateAdmission.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.operationSuccess = null;
        state.operation = null;
      })
      
      // Update Admission Status
      .addCase(updateAdmissionStatus.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.operationSuccess = null;
      })
      .addCase(updateAdmissionStatus.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedAdmission = action.payload.data || action.payload;
        if (updatedAdmission) {
          const index = state.admissions.findIndex(admission => admission._id === updatedAdmission._id);
          if (index !== -1) {
            state.admissions[index] = updatedAdmission;
          }
          if (state.currentAdmission && state.currentAdmission._id === updatedAdmission._id) {
            state.currentAdmission = updatedAdmission;
          }
        }
        state.operationSuccess = action.payload.message || 'Admission status updated successfully';
        state.error = null;
      })
      .addCase(updateAdmissionStatus.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.operationSuccess = null;
      })
      
      // Verify Email
      .addCase(verifyAdmissionEmail.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.operationSuccess = null;
      })
      .addCase(verifyAdmissionEmail.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedAdmission = action.payload.data || action.payload;
        if (updatedAdmission) {
          const index = state.admissions.findIndex(admission => admission._id === updatedAdmission._id);
          if (index !== -1) {
            state.admissions[index] = updatedAdmission;
          }
          if (state.currentAdmission && state.currentAdmission._id === updatedAdmission._id) {
            state.currentAdmission = updatedAdmission;
          }
        }
        state.operationSuccess = action.payload.message || 'Email verified successfully';
        state.error = null;
      })
      .addCase(verifyAdmissionEmail.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.operationSuccess = null;
      })
      
      // Delete Admission
      .addCase(deleteAdmission.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.operation = 'delete';
      })
      .addCase(deleteAdmission.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.admissions = state.admissions.filter(admission => admission._id !== action.payload);
        state.operation = null;
        state.operationSuccess = 'Admission deleted successfully';
        state.error = null;
      })
      .addCase(deleteAdmission.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.operation = null;
      })
      
      // Fetch Admission Stats
      .addCase(fetchAdmissionStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmissionStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data || action.payload;
        state.operationSuccess = 'Statistics fetched successfully';
      })
      .addCase(fetchAdmissionStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.stats = null;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentAdmission,
  clearStudentAdmissions,
  clearCourseAdmissions,
  setOperation,
  clearOperation,
  resetFormState,
  updateAdmissionInList,
  addAdmissionToList,
  removeAdmissionFromList
} = admissionSlice.actions;

export default admissionSlice.reducer;
