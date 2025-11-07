// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import admissionAPI from '../api/admissionAPI';

// // Async Thunks
// export const createAdmission = createAsyncThunk(
//   'admissions/createAdmission',
//   async (admissionData, { rejectWithValue }) => {
//     try {
//       const response = await admissionAPI.createAdmission(admissionData);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.error || error.response?.data?.message || 'Failed to create admission'
//       );
//     }
//   }
// );

// export const getAdmissions = createAsyncThunk(
//   'admissions/getAdmissions',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await admissionAPI.getAdmissions();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.error || error.response?.data?.message || 'Failed to fetch admissions'
//       );
//     }
//   }
// );

// export const getAdmission = createAsyncThunk(
//   'admissions/getAdmission',
//   async (admissionNo, { rejectWithValue }) => {
//     try {
//       const response = await admissionAPI.getAdmission(admissionNo);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.error || error.response?.data?.message || 'Failed to fetch admission'
//       );
//     }
//   }
// );

// export const updateAdmission = createAsyncThunk(
//   'admissions/updateAdmission',
//   async ({ admissionNo, admissionData }, { rejectWithValue }) => {
//     try {
//       const response = await admissionAPI.updateAdmission(admissionNo, admissionData);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.error || error.response?.data?.message || 'Failed to update admission'
//       );
//     }
//   }
// );

// export const deleteAdmission = createAsyncThunk(
//   'admissions/deleteAdmission',
//   async (admissionNo, { rejectWithValue }) => {
//     try {
//       const response = await admissionAPI.deleteAdmission(admissionNo);
//       return { admissionNo, message: response.data.message };
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.error || error.response?.data?.message || 'Failed to delete admission'
//       );
//     }
//   }
// );

// export const verifyEmail = createAsyncThunk(
//   'admissions/verifyEmail',
//   async (admissionNo, { rejectWithValue }) => {
//     try {
//       const response = await admissionAPI.verifyEmail(admissionNo);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.error || error.response?.data?.message || 'Failed to verify email'
//       );
//     }
//   }
// );

// // NEW: Update admission status
// export const updateAdmissionStatus = createAsyncThunk(
//   'admissions/updateAdmissionStatus',
//   async ({ admissionNo, status }, { rejectWithValue }) => {
//     try {
//       const response = await admissionAPI.updateAdmission(admissionNo, { status });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.error || error.response?.data?.message || 'Failed to update admission status'
//       );
//     }
//   }
// );

// // Initial State
// const initialState = {
//   admissions: [],
//   currentAdmission: null,
//   loading: false,
//   error: null,
//   success: null,
//   operationLoading: false,
//   operationError: null,
//   operationSuccess: null,
// };

// // Admission Slice
// const admissionSlice = createSlice({
//   name: 'admissions',
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//       state.operationError = null;
//     },
//     clearSuccess: (state) => {
//       state.success = null;
//       state.operationSuccess = null;
//     },
//     clearCurrentAdmission: (state) => {
//       state.currentAdmission = null;
//     },
//     setAdmissions: (state, action) => {
//       state.admissions = action.payload;
//     },
//     resetAdmissionState: (state) => {
//       state.admissions = [];
//       state.currentAdmission = null;
//       state.loading = false;
//       state.error = null;
//       state.success = null;
//       state.operationLoading = false;
//       state.operationError = null;
//       state.operationSuccess = null;
//     },
//     // NEW: Add admission manually (useful for real-time updates)
//     addAdmission: (state, action) => {
//       state.admissions.unshift(action.payload);
//     },
//     // NEW: Update admission in list manually
//     updateAdmissionInList: (state, action) => {
//       const index = state.admissions.findIndex(
//         admission => admission.admissionNo === action.payload.admissionNo
//       );
//       if (index !== -1) {
//         state.admissions[index] = action.payload;
//       }
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // Create Admission
//       .addCase(createAdmission.pending, (state) => {
//         state.operationLoading = true;
//         state.operationError = null;
//         state.operationSuccess = null;
//       })
//       .addCase(createAdmission.fulfilled, (state, action) => {
//         state.operationLoading = false;
//         state.operationSuccess = 'Admission created successfully';
//         // Add to beginning of list
//         state.admissions.unshift(action.payload.data);
//       })
//       .addCase(createAdmission.rejected, (state, action) => {
//         state.operationLoading = false;
//         state.operationError = action.payload;
//       })
      
//       // Get All Admissions
//       .addCase(getAdmissions.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getAdmissions.fulfilled, (state, action) => {
//         state.loading = false;
//         state.admissions = action.payload.data;
//         state.success = 'Admissions fetched successfully';
//       })
//       .addCase(getAdmissions.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
      
//       // Get Single Admission
//       .addCase(getAdmission.pending, (state) => {
//         state.operationLoading = true;
//         state.operationError = null;
//       })
//       .addCase(getAdmission.fulfilled, (state, action) => {
//         state.operationLoading = false;
//         state.currentAdmission = action.payload.data;
//         state.operationSuccess = 'Admission fetched successfully';
//       })
//       .addCase(getAdmission.rejected, (state, action) => {
//         state.operationLoading = false;
//         state.operationError = action.payload;
//       })
      
//       // Update Admission
//       .addCase(updateAdmission.pending, (state) => {
//         state.operationLoading = true;
//         state.operationError = null;
//         state.operationSuccess = null;
//       })
//       .addCase(updateAdmission.fulfilled, (state, action) => {
//         state.operationLoading = false;
//         state.operationSuccess = 'Admission updated successfully';
        
//         // Update in admissions list
//         const index = state.admissions.findIndex(
//           admission => admission.admissionNo === action.payload.data.admissionNo
//         );
//         if (index !== -1) {
//           state.admissions[index] = action.payload.data;
//         }
        
//         // Update current admission if it's the one being updated
//         if (state.currentAdmission && state.currentAdmission.admissionNo === action.payload.data.admissionNo) {
//           state.currentAdmission = action.payload.data;
//         }
//       })
//       .addCase(updateAdmission.rejected, (state, action) => {
//         state.operationLoading = false;
//         state.operationError = action.payload;
//       })
      
//       // Update Admission Status
//       .addCase(updateAdmissionStatus.pending, (state) => {
//         state.operationLoading = true;
//         state.operationError = null;
//         state.operationSuccess = null;
//       })
//       .addCase(updateAdmissionStatus.fulfilled, (state, action) => {
//         state.operationLoading = false;
//         state.operationSuccess = `Admission status updated to ${action.payload.data.status}`;
        
//         // Update in admissions list
//         const index = state.admissions.findIndex(
//           admission => admission.admissionNo === action.payload.data.admissionNo
//         );
//         if (index !== -1) {
//           state.admissions[index] = action.payload.data;
//         }
        
//         // Update current admission if it's the one being updated
//         if (state.currentAdmission && state.currentAdmission.admissionNo === action.payload.data.admissionNo) {
//           state.currentAdmission = action.payload.data;
//         }
//       })
//       .addCase(updateAdmissionStatus.rejected, (state, action) => {
//         state.operationLoading = false;
//         state.operationError = action.payload;
//       })
      
//       // Delete Admission
//       .addCase(deleteAdmission.pending, (state) => {
//         state.operationLoading = true;
//         state.operationError = null;
//         state.operationSuccess = null;
//       })
//       .addCase(deleteAdmission.fulfilled, (state, action) => {
//         state.operationLoading = false;
//         state.operationSuccess = action.payload.message;
        
//         // Remove from admissions list
//         state.admissions = state.admissions.filter(
//           admission => admission.admissionNo !== action.payload.admissionNo
//         );
        
//         // Clear current admission if it's the one being deleted
//         if (state.currentAdmission && state.currentAdmission.admissionNo === action.payload.admissionNo) {
//           state.currentAdmission = null;
//         }
//       })
//       .addCase(deleteAdmission.rejected, (state, action) => {
//         state.operationLoading = false;
//         state.operationError = action.payload;
//       })
      
//       // Verify Email
//       .addCase(verifyEmail.pending, (state) => {
//         state.operationLoading = true;
//         state.operationError = null;
//         state.operationSuccess = null;
//       })
//       .addCase(verifyEmail.fulfilled, (state, action) => {
//         state.operationLoading = false;
//         state.operationSuccess = 'Email verified successfully';
        
//         // Update in admissions list
//         const index = state.admissions.findIndex(
//           admission => admission.admissionNo === action.payload.data.admissionNo
//         );
//         if (index !== -1) {
//           state.admissions[index] = action.payload.data;
//         }
        
//         // Update current admission if it's the one being verified
//         if (state.currentAdmission && state.currentAdmission.admissionNo === action.payload.data.admissionNo) {
//           state.currentAdmission = action.payload.data;
//         }
//       })
//       .addCase(verifyEmail.rejected, (state, action) => {
//         state.operationLoading = false;
//         state.operationError = action.payload;
//       });
//   },
// });

// export const { 
//   clearError, 
//   clearSuccess, 
//   clearCurrentAdmission, 
//   setAdmissions,
//   resetAdmissionState,
//   addAdmission,
//   updateAdmissionInList
// } = admissionSlice.actions;

// export default admissionSlice.reducer;



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
        error.response?.data?.message || 'Failed to fetch admissions'
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
        error.response?.data?.message || 'Failed to fetch admission'
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
        error.response?.data?.message || 'Failed to fetch admission'
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
        error.response?.data?.message || 'Failed to fetch student admissions'
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
        error.response?.data?.message || 'Failed to fetch course admissions'
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
        error.response?.data?.message || 'Failed to create admission'
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
        error.response?.data?.message || 'Failed to update admission'
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
        error.response?.data?.message || 'Failed to update admission status'
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
        error.response?.data?.message || 'Failed to verify email'
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
        error.response?.data?.message || 'Failed to delete admission'
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
        error.response?.data?.message || 'Failed to fetch admission statistics'
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
  success: null,
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
      state.success = null;
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
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Admissions - FIXED: Check if data exists
      .addCase(fetchAdmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operation = 'fetch';
      })
      .addCase(fetchAdmissions.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we're properly setting the admissions array
        state.admissions = action.payload.data || [];
        state.operation = null;
        state.success = 'Admissions fetched successfully';
        console.log("Redux state updated with admissions:", state.admissions);
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
        state.currentAdmission = action.payload.data;
        state.success = 'Admission fetched successfully';
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
        state.currentAdmission = action.payload.data;
        state.success = 'Admission fetched successfully';
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
        state.studentAdmissions = action.payload.data || [];
        state.success = 'Student admissions fetched successfully';
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
        state.courseAdmissions = action.payload.data || [];
        state.success = 'Course admissions fetched successfully';
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
        state.success = null;
        state.operation = 'create';
      })
      .addCase(createAdmission.fulfilled, (state, action) => {
        state.operationLoading = false;
        if (action.payload.data) {
          state.admissions.push(action.payload.data);
        }
        state.operation = null;
        state.success = action.payload.message || 'Admission created successfully';
        state.error = null;
      })
      .addCase(createAdmission.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.success = null;
        state.operation = null;
      })
      // Update Admission
      .addCase(updateAdmission.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = null;
        state.operation = 'update';
      })
      .addCase(updateAdmission.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedAdmission = action.payload.data;
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
        state.success = action.payload.message || 'Admission updated successfully';
        state.error = null;
      })
      .addCase(updateAdmission.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.success = null;
        state.operation = null;
      })
      // Update Admission Status
      .addCase(updateAdmissionStatus.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateAdmissionStatus.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedAdmission = action.payload.data;
        if (updatedAdmission) {
          const index = state.admissions.findIndex(admission => admission._id === updatedAdmission._id);
          if (index !== -1) {
            state.admissions[index] = updatedAdmission;
          }
          if (state.currentAdmission && state.currentAdmission._id === updatedAdmission._id) {
            state.currentAdmission = updatedAdmission;
          }
        }
        state.success = action.payload.message || 'Admission status updated successfully';
        state.error = null;
      })
      .addCase(updateAdmissionStatus.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.success = null;
      })
      // Verify Email
      .addCase(verifyAdmissionEmail.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(verifyAdmissionEmail.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedAdmission = action.payload.data;
        if (updatedAdmission) {
          const index = state.admissions.findIndex(admission => admission._id === updatedAdmission._id);
          if (index !== -1) {
            state.admissions[index] = updatedAdmission;
          }
          if (state.currentAdmission && state.currentAdmission._id === updatedAdmission._id) {
            state.currentAdmission = updatedAdmission;
          }
        }
        state.success = action.payload.message || 'Email verified successfully';
        state.error = null;
      })
      .addCase(verifyAdmissionEmail.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.success = null;
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
        state.success = 'Admission deleted successfully';
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
        state.stats = action.payload.data;
        state.success = 'Statistics fetched successfully';
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
} = admissionSlice.actions;

export default admissionSlice.reducer;