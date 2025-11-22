import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import trainerAPI from '../api/trainerAPI';

// Async Thunks
export const createTrainer = createAsyncThunk(
  'trainer/createTrainer',
  async (trainerData, { rejectWithValue }) => {
    try {
      const response = await trainerAPI.createTrainer(trainerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create trainer'
      );
    }
  }
);

export const getTrainers = createAsyncThunk(
  'trainer/getTrainers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await trainerAPI.getTrainers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trainers'
      );
    }
  }
);

export const getTrainer = createAsyncThunk(
  'trainer/getTrainer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await trainerAPI.getTrainer(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trainer'
      );
    }
  }
);

export const updateTrainer = createAsyncThunk(
  'trainer/updateTrainer',
  async ({ id, trainerData }, { rejectWithValue }) => {
    try {
      const response = await trainerAPI.updateTrainer(id, trainerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update trainer'
      );
    }
  }
);

export const deleteTrainer = createAsyncThunk(
  'trainer/deleteTrainer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await trainerAPI.deleteTrainer(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete trainer'
      );
    }
  }
);

// Initial State
const initialState = {
  trainers: [],
  currentTrainer: null,
  loading: false,
  error: null,
  success: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalTrainers: 0,
    hasNext: false,
    hasPrev: false,
  },
};

// Trainer Slice
const trainerSlice = createSlice({
  name: 'trainer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    resetCurrentTrainer: (state) => {
      state.currentTrainer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Trainer
      .addCase(createTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrainer.fulfilled, (state, action) => {
        state.loading = false;
        state.trainers.unshift(action.payload.data); // Add to beginning of array
        state.success = action.payload.message || 'Trainer created successfully';
        state.pagination.totalTrainers += 1;
      })
      .addCase(createTrainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Trainers
      .addCase(getTrainers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrainers.fulfilled, (state, action) => {
        state.loading = false;
        state.trainers = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getTrainers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.trainers = [];
      })
      // Get Single Trainer
      .addCase(getTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrainer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTrainer = action.payload.data;
      })
      .addCase(getTrainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentTrainer = null;
      })
      // Update Trainer
      .addCase(updateTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrainer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.trainers.findIndex(
          (trainer) => trainer._id === action.payload.data._id
        );
        if (index !== -1) {
          state.trainers[index] = action.payload.data;
        }
        if (state.currentTrainer && state.currentTrainer._id === action.payload.data._id) {
          state.currentTrainer = action.payload.data;
        }
        state.success = action.payload.message || 'Trainer updated successfully';
      })
      .addCase(updateTrainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Trainer
      .addCase(deleteTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrainer.fulfilled, (state, action) => {
        state.loading = false;
        state.trainers = state.trainers.filter(
          (trainer) => trainer._id !== action.meta.arg
        );
        state.success = action.payload.message || 'Trainer deleted successfully';
        state.pagination.totalTrainers -= 1;
      })
      .addCase(deleteTrainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetCurrentTrainer } = trainerSlice.actions;

export default trainerSlice.reducer;
