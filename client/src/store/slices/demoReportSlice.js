import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// Async thunk to fetch all demo data for reports
export const fetchAllDemoReports = createAsyncThunk(
  'demoReports/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch data from all demo endpoints
      const [onlineDemos, offlineDemos, oneToOneDemos, liveClasses] = await Promise.all([
        axiosInstance.get('/onlineDemos'),
        axiosInstance.get('/offlineDemos'),
        axiosInstance.get('/oneToOneDemos'),
        axiosInstance.get('/liveclasses')
      ]);

      // Combine all demo data into one array
      const allDemos = [
        ...(onlineDemos.data?.data || onlineDemos.data || []),
        ...(offlineDemos.data?.data || offlineDemos.data || []),
        ...(oneToOneDemos.data?.data || oneToOneDemos.data || []),
        ...(liveClasses.data?.data || liveClasses.data || [])
      ];

      return allDemos;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch demo reports'
      );
    }
  }
);

const demoReportSlice = createSlice({
  name: 'demoReports',
  initialState: {
    demos: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearDemoReportError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllDemoReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDemoReports.fulfilled, (state, action) => {
        state.loading = false;
        state.demos = action.payload;
        state.error = null;
      })
      .addCase(fetchAllDemoReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.demos = [];
      });
  },
});

export const { clearDemoReportError } = demoReportSlice.actions;
export default demoReportSlice.reducer;