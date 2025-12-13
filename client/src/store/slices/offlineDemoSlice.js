import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// ✅ API endpoints
const BASE_URL = "/offlineDemos";

export const fetchOfflineDemos = createAsyncThunk("offlineDemo/fetchAll", async () => {
  const res = await axiosInstance.get(BASE_URL);
  return res.data;
});

export const addOfflineDemo = createAsyncThunk("offlineDemo/add", async (data) => {
  const res = await axiosInstance.post(BASE_URL, data);
  return res.data;
});

export const updateOfflineDemo = createAsyncThunk("offlineDemo/update", async ({ id, data }) => {
  const res = await axiosInstance.put(`${BASE_URL}/${id}`, data);
  return { ...res.data, originalId: id }; // Include original ID for tracking
});

export const deleteOfflineDemo = createAsyncThunk("offlineDemo/delete", async (id) => {
  await axiosInstance.delete(`${BASE_URL}/${id}`);
  return id;
});

const offlineDemoSlice = createSlice({
  name: "offlineDemo",
  initialState: {
    rows: [],
    searchQuery: "",
    status: "idle",
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOfflineDemos.fulfilled, (state, action) => {
        state.rows = action.payload;
      })
      .addCase(addOfflineDemo.fulfilled, (state, action) => {
        state.rows.push(action.payload);
      })
      .addCase(updateOfflineDemo.fulfilled, (state, action) => {
        // Check if demo was moved to another collection (message indicates mode change)
        if (action.payload.message && action.payload.message.includes("moved to online")) {
          // Remove from offline collection since it was moved to online
          state.rows = state.rows.filter((r) => r._id !== action.payload.originalId);
        } else {
          // Normal update - demo stayed in offline collection
          const index = state.rows.findIndex((r) => r._id === action.payload._id || r._id === action.payload.originalId);
          if (index !== -1) state.rows[index] = action.payload.demo || action.payload;
        }
      })
      .addCase(deleteOfflineDemo.fulfilled, (state, action) => {
        state.rows = state.rows.filter((r) => r._id !== action.payload);
      });
  },
});

export const { setSearchQuery } = offlineDemoSlice.actions;
export default offlineDemoSlice.reducer;
