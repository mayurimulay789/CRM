import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAPI from '../api/authAPI';

// ✅ SAFELY Get user from localStorage
const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    console.log("Stored user:", user);
    return user && user !== 'undefined' ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

const getStoredToken = () => {
  const token = localStorage.getItem('token');
  return token && token !== 'undefined' ? token : null;
};

const userFromStorage = getStoredUser();
const tokenFromStorage = getStoredToken();

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Store token and user in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // ✅ ALWAYS clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return null;
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = getStoredToken();
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await authAPI.getMe();
      return response.data;
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user data'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(userData);
      
      // Update localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Profile update failed'
      );
    }
  }
);

// ✅ Get All Counsellors (Admin only)
export const getAllCounsellors = createAsyncThunk(
  'auth/getAllCounsellors',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const response = await authAPI.getAllCounsellors(queryParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch counsellors'
      );
    }
  }
);

// ✅ NEW: Delete Counsellor (Admin only)
export const deleteCounsellor = createAsyncThunk(
  'auth/deleteCounsellor',
  async (counsellorId, { rejectWithValue, dispatch }) => {
    try {
      const response = await authAPI.deleteCounsellor(counsellorId);
      
      // Optional: Show success message
      console.log('Delete response:', response.data);
      
      return { 
        id: counsellorId, 
        message: response.data.message,
        deletedCounsellor: response.data.deletedCounsellor 
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete counsellor'
      );
    }
  }
);

// ✅ OPTIONAL: Bulk Delete Counsellors
export const bulkDeleteCounsellors = createAsyncThunk(
  'auth/bulkDeleteCounsellors',
  async (counsellorIds, { rejectWithValue }) => {
    try {
      const response = await authAPI.bulkDeleteCounsellors(counsellorIds);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete counsellors'
      );
    }
  }
);

// ✅ SAFE Initial State
const initialState = {
  user: userFromStorage,
  token: tokenFromStorage,
  isAuthenticated: !!(tokenFromStorage && userFromStorage),
  loading: false,
  error: null,
  success: null,
  // ✅ Counsellors state
  counsellors: {
    list: [],
    loading: false,
    error: null,
    deleteLoading: false, // For individual delete operations
    deleteError: null,
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalCounsellors: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10
    }
  }
};

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    // Manual logout without API call
    manualLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.success = null;
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    // Clear invalid storage
    clearInvalidStorage: (state) => {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Error clearing storage:', error);
      }
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    // Clear counsellors error
    clearCounsellorsError: (state) => {
      state.counsellors.error = null;
      state.counsellors.deleteError = null;
    },
    // Clear counsellors list
    clearCounsellors: (state) => {
      state.counsellors.list = [];
      state.counsellors.pagination = {
        currentPage: 1,
        totalPages: 0,
        totalCounsellors: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10
      };
    },
    // Remove counsellor from list locally (optimistic update)
    removeCounsellorLocally: (state, action) => {
      const id = action.payload;
      state.counsellors.list = state.counsellors.list.filter(
        counsellor => counsellor._id !== id
      );
      // Update total count
      if (state.counsellors.pagination.totalCounsellors > 0) {
        state.counsellors.pagination.totalCounsellors -= 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.success = action.payload.message || 'Registration successful';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.success = action.payload.message || 'Login successful';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.success = 'Logout successful';
        // Clear counsellors data on logout
        state.counsellors.list = [];
        state.counsellors.pagination = {
          currentPage: 1,
          totalPages: 0,
          totalCounsellors: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 10
        };
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
        // Clear counsellors data on logout error too
        state.counsellors.list = [];
        state.counsellors.pagination = {
          currentPage: 1,
          totalPages: 0,
          totalCounsellors: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 10
        };
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.success = action.payload.message || 'Profile updated successfully';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All Counsellors
      .addCase(getAllCounsellors.pending, (state) => {
        state.counsellors.loading = true;
        state.counsellors.error = null;
      })
      .addCase(getAllCounsellors.fulfilled, (state, action) => {
        state.counsellors.loading = false;
        state.counsellors.list = action.payload.counsellors || [];
        
        // Update pagination if available
        if (action.payload.pagination) {
          state.counsellors.pagination = {
            ...state.counsellors.pagination,
            ...action.payload.pagination
          };
        } else {
          // If no pagination data, set basic info
          state.counsellors.pagination.totalCounsellors = action.payload.totalCount || action.payload.counsellors?.length || 0;
        }
        
        state.success = action.payload.message || 'Counsellors fetched successfully';
      })
      .addCase(getAllCounsellors.rejected, (state, action) => {
        state.counsellors.loading = false;
        state.counsellors.error = action.payload;
        state.counsellors.list = [];
      })
      
      // ✅ NEW: Delete Counsellor cases
      .addCase(deleteCounsellor.pending, (state) => {
        state.counsellors.deleteLoading = true;
        state.counsellors.deleteError = null;
      })
      .addCase(deleteCounsellor.fulfilled, (state, action) => {
        state.counsellors.deleteLoading = false;
        // Remove the deleted counsellor from the list
        state.counsellors.list = state.counsellors.list.filter(
          counsellor => counsellor._id !== action.payload.id
        );
        // Update total count
        if (state.counsellors.pagination.totalCounsellors > 0) {
          state.counsellors.pagination.totalCounsellors -= 1;
        }
      })
      .addCase(deleteCounsellor.rejected, (state, action) => {
        state.counsellors.deleteLoading = false;
        state.counsellors.deleteError = action.payload;
        state.error = action.payload;
      })
      
      // ✅ OPTIONAL: Bulk Delete cases
      .addCase(bulkDeleteCounsellors.pending, (state) => {
        state.counsellors.deleteLoading = true;
        state.counsellors.deleteError = null;
      })
      .addCase(bulkDeleteCounsellors.fulfilled, (state, action) => {
        state.counsellors.deleteLoading = false;
        // Refresh the list or handle bulk delete
        // You might want to refetch the list instead
        state.success = action.payload.message || 'Counsellors deleted successfully';
      })
      .addCase(bulkDeleteCounsellors.rejected, (state, action) => {
        state.counsellors.deleteLoading = false;
        state.counsellors.deleteError = action.payload;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  setCredentials, 
  manualLogout, 
  clearInvalidStorage,
  clearCounsellorsError,
  clearCounsellors,
  removeCounsellorLocally
} = authSlice.actions;

export default authSlice.reducer;