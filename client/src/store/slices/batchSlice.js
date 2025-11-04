import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import batchAPI from '../api/batchAPI';

// Async Thunks
export const createBatch = createAsyncThunk(
  'batch/createBatch',
  async (batchData, { rejectWithValue }) => {
    try {
      const response = await batchAPI.createBatch(batchData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create batch'
      );
    }
  }
);

export const getBatches = createAsyncThunk(
  'batch/getBatches',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await batchAPI.getBatches(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch batches'
      );
    }
  }
);

export const getBatch = createAsyncThunk(
  'batch/getBatch',
  async (id, { rejectWithValue }) => {
    try {
      const response = await batchAPI.getBatch(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch batch'
      );
    }
  }
);

export const updateBatch = createAsyncThunk(
  'batch/updateBatch',
  async ({ id, batchData }, { rejectWithValue }) => {
    try {
      const response = await batchAPI.updateBatch(id, batchData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update batch'
      );
    }
  }
);

export const deleteBatch = createAsyncThunk(
  'batch/deleteBatch',
  async (id, { rejectWithValue }) => {
    try {
      const response = await batchAPI.deleteBatch(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete batch'
      );
    }
  }
);

export const getBatchStats = createAsyncThunk(
  'batch/getBatchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await batchAPI.getBatchStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch batch statistics'
      );
    }
  }
);

// Initial State
const initialState = {
  batches: [],
  currentBatch: null,
  stats: null,
  loading: false,
  error: null,
  success: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBatches: 0,
    hasNext: false,
    hasPrev: false,
  },
};

// Batch Slice
const batchSlice = createSlice({
  name: 'batch',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    resetCurrentBatch: (state) => {
      state.currentBatch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Batch
      .addCase(createBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches.unshift(action.payload.data); // Add to beginning of array
        state.success = action.payload.message || 'Batch created successfully';
        state.totalBatches += 1;
      })
      .addCase(createBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Batches
      .addCase(getBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.batches = [];
      })
      // Get Single Batch
      .addCase(getBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBatch = action.payload.data;
      })
      .addCase(getBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentBatch = null;
      })
      // Update Batch
      .addCase(updateBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBatch.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.batches.findIndex(
          (batch) => batch._id === action.payload.data._id
        );
        if (index !== -1) {
          state.batches[index] = action.payload.data;
        }
        if (state.currentBatch && state.currentBatch._id === action.payload.data._id) {
          state.currentBatch = action.payload.data;
        }
        state.success = action.payload.message || 'Batch updated successfully';
      })
      .addCase(updateBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Batch
      .addCase(deleteBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = state.batches.filter(
          (batch) => batch._id !== action.meta.arg
        );
        state.success = action.payload.message || 'Batch deleted successfully';
        state.totalBatches -= 1;
      })
      .addCase(deleteBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Batch Stats
      .addCase(getBatchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBatchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(getBatchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.stats = null;
      });
  },
});

export const { clearError, clearSuccess, resetCurrentBatch } = batchSlice.actions;

export default batchSlice.reducer;
