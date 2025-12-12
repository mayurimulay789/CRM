import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// ✅ API calls (adjust API URLs as needed)
export const fetchOnlineDemos = createAsyncThunk(
  "onlineDemo/fetchAll",
  async () => {
    const response = await axiosInstance.get("/onlineDemos");
    return response.data;
  }
);

export const addOnlineDemo = createAsyncThunk(
  "onlineDemo/add",
  async (data) => {
    const response = await axiosInstance.post("/onlineDemos", data);
    return response.data;
  }
);

export const updateOnlineDemo = createAsyncThunk(
  "onlineDemo/update",
  async ({ id, data }) => {
    const response = await axiosInstance.put(`/onlineDemos/${id}`, data);
    return { ...response.data, originalId: id }; // Include original ID for tracking
  }
);

export const deleteOnlineDemo = createAsyncThunk(
  "onlineDemo/delete",
  async (id) => {
    await axiosInstance.delete(`/onlineDemos/${id}`);
    return id;
  }
);

// ✅ The slice
const onlineDemoSlice = createSlice({
  name: "onlineDemo",
  initialState: {
    rows: [],
    searchQuery: "",
    status: "idle",
  },
  reducers: {
    // 👇 this is what your JSX imports
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOnlineDemos.fulfilled, (state, action) => {
        state.rows = action.payload;
      })
      .addCase(addOnlineDemo.fulfilled, (state, action) => {
        state.rows.push(action.payload);
      })
      .addCase(updateOnlineDemo.fulfilled, (state, action) => {
        // Check if demo was moved to another collection (message indicates mode change)
        if (action.payload.message && action.payload.message.includes("moved to offline")) {
          // Remove from online collection since it was moved to offline
          state.rows = state.rows.filter((r) => r._id !== action.payload.originalId);
        } else {
          // Normal update - demo stayed in online collection
          const index = state.rows.findIndex((r) => r._id === action.payload._id || r._id === action.payload.originalId);
          if (index !== -1) state.rows[index] = action.payload.demo || action.payload;
        }
      })
      .addCase(deleteOnlineDemo.fulfilled, (state, action) => {
        state.rows = state.rows.filter((r) => r._id !== action.payload);
      });
  },
});

export const { setSearchQuery } = onlineDemoSlice.actions; // ✅ ensure this exists
export default onlineDemoSlice.reducer;
