import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

const API_URL = "/liveclasses";

// Fetch all
export const fetchLiveClasses = createAsyncThunk("liveClasses/fetchAll", async () => {
  const res = await axiosInstance.get(API_URL);
  return res.data;
});

// Add
export const addLiveClass = createAsyncThunk("liveClasses/add", async (data) => {
  const res = await axiosInstance.post(API_URL, data);
  return res.data;
});

// Update
export const updateLiveClass = createAsyncThunk("liveClasses/update", async ({ id, data }) => {
  const res = await axiosInstance.put(`${API_URL}/${id}`, data);
  return res.data;
});

// Delete
export const deleteLiveClass = createAsyncThunk("liveClasses/delete", async (id) => {
  await axiosInstance.delete(`${API_URL}/${id}`);
  return id;
});

const liveClassesSlice = createSlice({
  name: "liveClasses",
  initialState: {
    rows: [],
    searchQuery: "",
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveClasses.fulfilled, (state, action) => {
        state.rows = action.payload;
      })
      .addCase(addLiveClass.fulfilled, (state, action) => {
        state.rows.push(action.payload);
      })
      .addCase(updateLiveClass.fulfilled, (state, action) => {
        const index = state.rows.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) state.rows[index] = action.payload;
      })
      .addCase(deleteLiveClass.fulfilled, (state, action) => {
        state.rows = state.rows.filter((r) => r._id !== action.payload);
      });
  },
});

export const { setSearchQuery } = liveClassesSlice.actions;
export default liveClassesSlice.reducer;
