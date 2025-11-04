import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import courseAPI from '../api/courseAPI';

// Async Thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (active = null, { rejectWithValue }) => {
    try {
      const response = await courseAPI.getAllCourses(active);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch courses'
      );
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await courseAPI.getCourseById(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch course'
      );
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const response = await courseAPI.createCourse(courseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create course'
      );
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ courseId, courseData }, { rejectWithValue }) => {
    try {
      const response = await courseAPI.updateCourse(courseId, courseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update course'
      );
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      await courseAPI.deleteCourse(courseId);
      return courseId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete course'
      );
    }
  }
);

export const toggleCourseStatus = createAsyncThunk(
  'courses/toggleCourseStatus',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await courseAPI.toggleCourseStatus(courseId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle course status'
      );
    }
  }
);

// Initial State
const initialState = {
  courses: [],
  currentCourse: null,
  loading: false,
  operationLoading: false, // Separate loading for form operations
  error: null,
  success: null,
  operation: null,
};

// Course Slice
const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    setOperation: (state, action) => {
      state.operation = action.payload;
    },
    clearOperation: (state) => {
      state.operation = null;
    },
    // Add a specific reset for form operations
    resetFormState: (state) => {
      state.operationLoading = false;
      state.error = null;
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operation = 'fetch';
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.data;
        state.operation = null;
        state.success = 'Courses fetched successfully';
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.operation = null;
      })
      // Fetch Course By ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload.data;
        state.success = 'Course fetched successfully';
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentCourse = null;
      })
      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.operationLoading = true; // Use operationLoading for form operations
        state.error = null;
        state.success = null;
        state.operation = 'create';
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.courses.push(action.payload.data);
        state.operation = null;
        state.success = action.payload.message || 'Course created successfully';
        state.error = null;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.success = null;
        state.operation = null;
      })
      // Update Course
      .addCase(updateCourse.pending, (state) => {
        state.operationLoading = true; // Use operationLoading for form operations
        state.error = null;
        state.success = null;
        state.operation = 'update';
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedCourse = action.payload.data;
        const index = state.courses.findIndex(course => course._id === updatedCourse._id);
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        if (state.currentCourse && state.currentCourse._id === updatedCourse._id) {
          state.currentCourse = updatedCourse;
        }
        state.operation = null;
        state.success = action.payload.message || 'Course updated successfully';
        state.error = null;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.success = null;
        state.operation = null;
      })
      // Delete Course
      .addCase(deleteCourse.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.operation = 'delete';
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.courses = state.courses.filter(course => course._id !== action.payload);
        state.operation = null;
        state.success = 'Course deleted successfully';
        state.error = null;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        state.operation = null;
      })
      // Toggle Course Status
      .addCase(toggleCourseStatus.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(toggleCourseStatus.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedCourse = action.payload.data;
        const index = state.courses.findIndex(course => course._id === updatedCourse._id);
        if (index !== -1) {
          state.courses[index] = updatedCourse;
        }
        if (state.currentCourse && state.currentCourse._id === updatedCourse._id) {
          state.currentCourse = updatedCourse;
        }
        state.success = action.payload.message || 'Course status updated successfully';
        state.error = null;
      })
      .addCase(toggleCourseStatus.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearCurrentCourse,
  setOperation,
  clearOperation,
  resetFormState,
} = courseSlice.actions;

export default courseSlice.reducer;