

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import studentAPI from '../api/studentAPI';

// Async Thunks
export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getAllStudents(params);
      console.log('Fetched Students *************************************:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch students'
      );
    }
  }
);

export const fetchStudentById = createAsyncThunk(
  'students/fetchStudentById',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getStudentById(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch student'
      );
    }
  }
);

export const fetchStudentByStudentId = createAsyncThunk(
  'students/fetchStudentByStudentId',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getStudentByStudentId(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch student'
      );
    }
  }
);

export const createStudent = createAsyncThunk(
  'students/createStudent',
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await studentAPI.createStudent(studentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create student'
      );
    }
  }
);

export const updateStudent = createAsyncThunk(
  'students/updateStudent',
  async ({ studentId, studentData }, { rejectWithValue }) => {
    try {
      const response = await studentAPI.updateStudent(studentId, studentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update student'
      );
    }
  }
);

export const deleteStudent = createAsyncThunk(
  'students/deleteStudent',
  async (studentId, { rejectWithValue }) => {
    try {
      await studentAPI.deleteStudent(studentId);
      return studentId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete student'
      );
    }
  }
);

export const toggleStudentStatus = createAsyncThunk(
  'students/toggleStudentStatus',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await studentAPI.toggleStudentStatus(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle student status'
      );
    }
  }
);

export const fetchStudentStats = createAsyncThunk(
  'students/fetchStudentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getStudentStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch student statistics'
      );
    }
  }
);

// Initial State
const initialState = {
  students: [],
  currentStudent: null,
  loading: false,
  operationLoading: false,
  error: null,
  success: null,
  operation: null,
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
};

// Student Slice
const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentStudent: (state) => {
      state.currentStudent = null;
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
    },
    clearStats: (state) => {
      state.stats = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Students
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operation = 'fetch';
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          pages: action.payload.pages
        };
        state.operation = null;
        state.success = 'Students fetched successfully';
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.operation = null;
      })
      // Fetch Student By ID
      .addCase(fetchStudentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStudent = action.payload.data;
        state.success = 'Student fetched successfully';
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentStudent = null;
      })
      // Fetch Student By StudentId
      .addCase(fetchStudentByStudentId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentByStudentId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStudent = action.payload.data;
        state.success = 'Student fetched successfully';
      })
      .addCase(fetchStudentByStudentId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentStudent = null;
      })
      // Create Student
      .addCase(createStudent.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = null;
        state.operation = 'create';
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.students.push(action.payload.data);
        state.operation = null;
        state.success = action.payload.message || 'Student created successfully';
        state.error = null;
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.success = null;
        state.operation = null;
      })
      // Update Student
      .addCase(updateStudent.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = null;
        state.operation = 'update';
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedStudent = action.payload.data;
        const index = state.students.findIndex(student => student._id === updatedStudent._id);
        if (index !== -1) {
          state.students[index] = updatedStudent;
        }
        if (state.currentStudent && state.currentStudent._id === updatedStudent._id) {
          state.currentStudent = updatedStudent;
        }
        state.operation = null;
        state.success = action.payload.message || 'Student updated successfully';
        state.error = null;
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.success = null;
        state.operation = null;
      })
      // Delete Student
      .addCase(deleteStudent.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.operation = 'delete';
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.students = state.students.filter(student => student._id !== action.payload);
        state.operation = null;
        state.success = 'Student deleted successfully';
        state.error = null;
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.operation = null;
      })
      // Toggle Student Status
      .addCase(toggleStudentStatus.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(toggleStudentStatus.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedStudent = action.payload.data;
        const index = state.students.findIndex(student => student._id === updatedStudent._id);
        if (index !== -1) {
          state.students[index] = { ...state.students[index], ...updatedStudent };
        }
        if (state.currentStudent && state.currentStudent._id === updatedStudent._id) {
          state.currentStudent = { ...state.currentStudent, ...updatedStudent };
        }
        state.success = action.payload.message || 'Student status updated successfully';
        state.error = null;
      })
      .addCase(toggleStudentStatus.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      // Fetch Student Statistics
      .addCase(fetchStudentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
        state.success = 'Student statistics fetched successfully';
      })
      .addCase(fetchStudentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.stats = null;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentStudent,
  setOperation,
  clearOperation,
  resetFormState,
  clearStats,
} = studentSlice.actions;

export default studentSlice.reducer;