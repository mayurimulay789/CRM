import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ API endpoints
const BASE_URL = "http://localhost:5000/api/offlineDemos";

export const fetchOfflineDemos = createAsyncThunk("offlineDemo/fetchAll", async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
});

export const addOfflineDemo = createAsyncThunk("offlineDemo/add", async (data) => {
  const res = await axios.post(BASE_URL, data);
  return res.data;
});

export const updateOfflineDemo = createAsyncThunk("offlineDemo/update", async ({ id, data }) => {
  const res = await axios.put(`${BASE_URL}/${id}`, data);
  return res.data;
});

export const deleteOfflineDemo = createAsyncThunk("offlineDemo/delete", async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
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
        const index = state.rows.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) state.rows[index] = action.payload;
      })
      .addCase(deleteOfflineDemo.fulfilled, (state, action) => {
        state.rows = state.rows.filter((r) => r._id !== action.payload);
      });
  },
});

export const { setSearchQuery } = offlineDemoSlice.actions;
export default offlineDemoSlice.reducer;
