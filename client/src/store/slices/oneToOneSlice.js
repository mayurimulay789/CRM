// src/features/oneToOne/oneToOneSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchOneToOneDemos = createAsyncThunk(
  "oneToOne/fetchAll",
  async () => {
    const res = await axios.get("http://localhost:5000/api/oneToOneDemos");
    return res.data;
  }
);

export const addOneToOneDemo = createAsyncThunk(
  "oneToOne/add",
  async (data) => {
    const res = await axios.post("http://localhost:5000/api/oneToOneDemos", data);
    return res.data;
  }
);

export const updateOneToOneDemo = createAsyncThunk(
  "oneToOne/update",
  async ({ id, data }) => {
    const res = await axios.put(`http://localhost:5000/api/oneToOneDemos/${id}`, data);
    return res.data;
  }
);

export const deleteOneToOneDemo = createAsyncThunk(
  "oneToOne/delete",
  async (id) => {
    await axios.delete(`http://localhost:5000/api/oneToOneDemos/${id}`);
    return id;
  }
);

const oneToOneSlice = createSlice({
  name: "oneToOne",
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
      .addCase(fetchOneToOneDemos.fulfilled, (state, action) => {
        state.rows = action.payload;
      })
      .addCase(addOneToOneDemo.fulfilled, (state, action) => {
        state.rows.push(action.payload);
      })
      .addCase(updateOneToOneDemo.fulfilled, (state, action) => {
        const idx = state.rows.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) state.rows[idx] = action.payload;
      })
      .addCase(deleteOneToOneDemo.fulfilled, (state, action) => {
        state.rows = state.rows.filter((r) => r._id !== action.payload);
      });
  },
});

export const { setSearchQuery } = oneToOneSlice.actions;
export default oneToOneSlice.reducer;
