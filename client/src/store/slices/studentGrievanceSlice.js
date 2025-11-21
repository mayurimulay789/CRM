import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/student-grievances";

// ==================== ASYNC THUNKS ==================== //

// Fetch grievances based on user role
export const fetchGrievancesByRole = createAsyncThunk(
  "studentGrievance/fetchByRole",
  async (role, { rejectWithValue }) => {
    try {
      let url = API_URL;
      if (role === "counsellor") {
        url += "/counsellor";
      }
      const token = localStorage.getItem('token');
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create grievance
export const createGrievance = createAsyncThunk(
  "studentGrievance/create",
  async (grievanceData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/submit`, grievanceData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.grievance;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update grievance
export const updateGrievance = createAsyncThunk(
  "studentGrievance/update",
  async ({ id, grievanceData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/${id}`, grievanceData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.grievance;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete grievance
export const deleteGrievance = createAsyncThunk(
  "studentGrievance/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch all grievances (for admin)
export const fetchAllGrievances = createAsyncThunk(
  "studentGrievance/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update grievance status (for admin)
export const updateGrievanceStatus = createAsyncThunk(
  "studentGrievance/updateStatus",
  async ({ id, status, adminResponse }, { rejectWithValue }) => {
    try {
      const endpoint = status === 'approved' ? 'approve' : 'reject';
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/${id}/${endpoint}`, { adminResponse }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.grievance;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ==================== SLICE ==================== //

const studentGrievanceSlice = createSlice({
  name: "studentGrievance",
  initialState: {
    grievances: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch grievances
    builder
      .addCase(fetchGrievancesByRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGrievancesByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.grievances = action.payload;
      })
      .addCase(fetchGrievancesByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create grievance
    builder
      .addCase(createGrievance.pending, (state) => {
        state.loading = true;
      })
      .addCase(createGrievance.fulfilled, (state, action) => {
        state.loading = false;
        state.grievances.push(action.payload);
        state.success = true;
      })
      .addCase(createGrievance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update grievance
    builder
      .addCase(updateGrievance.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateGrievance.fulfilled, (state, action) => {
        state.loading = false;
        state.grievances = state.grievances.map((g) =>
          g._id === action.payload._id ? action.payload : g
        );
        state.success = true;
      })
      .addCase(updateGrievance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete grievance
    builder
      .addCase(deleteGrievance.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteGrievance.fulfilled, (state, action) => {
        state.loading = false;
        state.grievances = state.grievances.filter((g) => g._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteGrievance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch all grievances
    builder
      .addCase(fetchAllGrievances.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllGrievances.fulfilled, (state, action) => {
        state.loading = false;
        state.grievances = action.payload;
      })
      .addCase(fetchAllGrievances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update grievance status
    builder
      .addCase(updateGrievanceStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateGrievanceStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.grievances = state.grievances.map((g) =>
          g._id === action.payload._id ? action.payload : g
        );
        state.success = true;
      })
      .addCase(updateGrievanceStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = studentGrievanceSlice.actions;
export default studentGrievanceSlice.reducer;
