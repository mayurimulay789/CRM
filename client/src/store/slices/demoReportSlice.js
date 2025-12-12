// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axiosInstance from '../../utils/axios';

// // Async thunk to fetch all demo data for reports
// export const fetchAllDemoReports = createAsyncThunk(
//   'demoReports/fetchAll',
//   async (_, { rejectWithValue, getState }) => {
//     try {
//       const { user } = getState().auth;
      
//       // Fetch data from all demo endpoints
//       const [onlineDemos, offlineDemos, oneToOneDemos, liveClasses] = await Promise.all([
//         axiosInstance.get('/onlineDemos'),
//         axiosInstance.get('/offlineDemos'),
//         axiosInstance.get('/oneToOneDemos'),
//         axiosInstance.get('/liveclasses')
//       ]);

//       // Process and combine all demo data
//       const processDemoData = (demos, type) => {
//         return demos.data?.data || demos.data || [];
//       };

//       const allDemos = [
//         ...processDemoData(onlineDemos, 'online').map(demo => ({
//           ...demo,
//           demoType: 'online',
//           type: 'online',
//           // Map common fields
//           title: demo.title || demo.courseName || 'Online Demo',
//           registeredStudents: demo.students || demo.attendees || [],
//           convertedStudents: demo.conversions || [],
//           createdAt: demo.createdAt || demo.date || demo.scheduledAt,
//           status: demo.status || 'completed'
//         })),
//         ...processDemoData(offlineDemos, 'offline').map(demo => ({
//           ...demo,
//           demoType: 'offline',
//           type: 'offline',
//           title: demo.title || demo.courseName || 'Offline Demo',
//           registeredStudents: demo.students || demo.attendees || [],
//           convertedStudents: demo.conversions || [],
//           createdAt: demo.createdAt || demo.date || demo.scheduledAt,
//           status: demo.status || 'completed'
//         })),
//         ...processDemoData(oneToOneDemos, 'one-to-one').map(demo => ({
//           ...demo,
//           demoType: 'one-to-one',
//           type: 'one-to-one',
//           title: demo.title || `One-on-One with ${demo.studentName}` || 'One-to-One Demo',
//           registeredStudents: demo.student ? [demo.student] : [],
//           convertedStudents: demo.converted ? [demo.student] : [],
//           createdAt: demo.createdAt || demo.date || demo.scheduledAt,
//           status: demo.status || 'completed'
//         })),
//         ...processDemoData(liveClasses, 'live').map(demo => ({
//           ...demo,
//           demoType: 'live',
//           type: 'live',
//           title: demo.title || demo.courseName || 'Live Class Demo',
//           registeredStudents: demo.enrolledStudents || demo.students || [],
//           convertedStudents: demo.conversions || [],
//           createdAt: demo.createdAt || demo.date || demo.startTime,
//           status: demo.status || 'completed'
//         }))
//       ];

//       // Filter data based on user role
//       let filteredDemos = allDemos;
//       if (user?.role === 'counsellor') {
//         filteredDemos = allDemos.filter(demo => 
//           demo.counsellorId === user._id || 
//           demo.assignedCounsellor === user._id ||
//           demo.createdBy === user._id
//         );
//       }

//       return filteredDemos;
//     } catch (error) {
//       console.error('Error fetching demo reports:', error);
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch demo reports'
//       );
//     }
//   }
// );

// const demoReportSlice = createSlice({
//   name: 'demoReports',
//   initialState: {
//     demos: [],
//     loading: false,
//     error: null,
//     lastFetch: null,
//   },
//   reducers: {
//     clearDemoReportError: (state) => {
//       state.error = null;
//     },
//     updateDemoStatus: (state, action) => {
//       const { demoId, status } = action.payload;
//       const demo = state.demos.find(d => d._id === demoId || d.id === demoId);
//       if (demo) {
//         demo.status = status;
//       }
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchAllDemoReports.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllDemoReports.fulfilled, (state, action) => {
//         state.loading = false;
//         state.demos = action.payload;
//         state.error = null;
//         state.lastFetch = new Date().toISOString();
//       })
//       .addCase(fetchAllDemoReports.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.demos = [];
//       });
//   },
// });

// export const { clearDemoReportError, updateDemoStatus } = demoReportSlice.actions;
// export default demoReportSlice.reducer;

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axiosInstance from '../../utils/axios';

// // Async thunk to fetch all demo data for reports
// export const fetchAllDemoReports = createAsyncThunk(
//   'demoReports/fetchAll',
//   async (_, { rejectWithValue, getState }) => {
//     try {
//       const { user } = getState().auth;
      
//       // Fetch data from all demo endpoints
//       const [onlineDemos, offlineDemos, oneToOneDemos, liveClasses] = await Promise.all([
//         axiosInstance.get('/onlineDemos'),
//         axiosInstance.get('/offlineDemos'),
//         axiosInstance.get('/oneToOneDemos'),
//         axiosInstance.get('/liveclasses')
//       ]);

//       // Process and combine all demo data
//       const processDemoData = (demos, type) => {
//         return demos.data?.data || demos.data || [];
//       };

//       const allDemos = [
//         ...processDemoData(onlineDemos, 'online').map(demo => ({
//           ...demo,
//           demoType: 'online',
//           type: 'online',
//           // Map common fields
//           title: demo.title || demo.courseName || 'Online Demo',
//           registeredStudents: demo.students || demo.attendees || [],
//           convertedStudents: demo.conversions || [],
//           createdAt: demo.createdAt || demo.date || demo.scheduledAt,
//           status: demo.status || 'completed'
//         })),
//         ...processDemoData(offlineDemos, 'offline').map(demo => ({
//           ...demo,
//           demoType: 'offline',
//           type: 'offline',
//           title: demo.title || demo.courseName || 'Offline Demo',
//           registeredStudents: demo.students || demo.attendees || [],
//           convertedStudents: demo.conversions || [],
//           createdAt: demo.createdAt || demo.date || demo.scheduledAt,
//           status: demo.status || 'completed'
//         })),
//         ...processDemoData(oneToOneDemos, 'one-to-one').map(demo => ({
//           ...demo,
//           demoType: 'one-to-one',
//           type: 'one-to-one',
//           title: demo.title || `One-on-One with ${demo.studentName}` || 'One-to-One Demo',
//           registeredStudents: demo.student ? [demo.student] : [],
//           convertedStudents: demo.converted ? [demo.student] : [],
//           createdAt: demo.createdAt || demo.date || demo.scheduledAt,
//           status: demo.status || 'completed'
//         })),
//         ...processDemoData(liveClasses, 'live').map(demo => ({
//           ...demo,
//           demoType: 'live',
//           type: 'live',
//           title: demo.title || demo.courseName || 'Live Class Demo',
//           registeredStudents: demo.enrolledStudents || demo.students || [],
//           convertedStudents: demo.conversions || [],
//           createdAt: demo.createdAt || demo.date || demo.startTime,
//           status: demo.status || 'completed'
//         }))
//       ];

//       // Filter data based on user role
//       let filteredDemos = allDemos;
//       if (user?.role === 'counsellor') {
//         filteredDemos = allDemos.filter(demo => 
//           demo.counsellorId === user._id || 
//           demo.assignedCounsellor === user._id ||
//           demo.createdBy === user._id
//         );
//       }

//       return filteredDemos;
//     } catch (error) {
//       console.error('Error fetching demo reports:', error);
//       return rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch demo reports'
//       );
//     }
//   }
// );

// const demoReportSlice = createSlice({
//   name: 'demoReports',
//   initialState: {
//     demos: [],
//     loading: false,
//     error: null,
//     lastFetch: null,
//   },
//   reducers: {
//     clearDemoReportError: (state) => {
//       state.error = null;
//     },
//     updateDemoStatus: (state, action) => {
//       const { demoId, status } = action.payload;
//       const demo = state.demos.find(d => d._id === demoId || d.id === demoId);
//       if (demo) {
//         demo.status = status;
//       }
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchAllDemoReports.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllDemoReports.fulfilled, (state, action) => {
//         state.loading = false;
//         state.demos = action.payload;
//         state.error = null;
//         state.lastFetch = new Date().toISOString();
//       })
//       .addCase(fetchAllDemoReports.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.demos = [];
//       });
//   },
// });

// export const { clearDemoReportError, updateDemoStatus } = demoReportSlice.actions;
// export default demoReportSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// Async thunk to fetch all demo data for reports
export const fetchAllDemoReports = createAsyncThunk(
  'demoReports/fetchAll',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { user } = getState().auth;
      
      console.log('=== DEBUG: Starting fetchAllDemoReports ===');
      console.log('User role:', user?.role);
      console.log('User FullName:', user?.FullName);
      console.log('User name:', user?.name);
      console.log('User _id:', user?._id);
      
      // Fetch data from all demo endpoints
      const [onlineDemos, offlineDemos, oneToOneDemos, liveClasses] = await Promise.all([
        axiosInstance.get('/onlineDemos'),
        axiosInstance.get('/offlineDemos'),
        axiosInstance.get('/oneToOneDemos'),
        axiosInstance.get('/liveclasses')
      ]);

      // Process and combine all demo data
      const processDemoData = (demos, type) => {
        return demos.data?.data || demos.data || [];
      };

      const allDemos = [
        ...processDemoData(onlineDemos, 'online').map(demo => ({
          ...demo,
          demoType: 'online',
          type: 'online',
          // Map common fields
          title: demo.title || demo.courseName || 'Online Demo',
          registeredStudents: demo.students || demo.attendees || [],
          convertedStudents: demo.conversions || [],
          createdAt: demo.createdAt || demo.date || demo.scheduledAt,
          status: demo.status || 'completed',
          counselor: demo.counselor || '' // Added counselor field mapping
        })),
        ...processDemoData(offlineDemos, 'offline').map(demo => ({
          ...demo,
          demoType: 'offline',
          type: 'offline',
          title: demo.title || demo.courseName || 'Offline Demo',
          registeredStudents: demo.students || demo.attendees || [],
          convertedStudents: demo.conversions || [],
          createdAt: demo.createdAt || demo.date || demo.scheduledAt,
          status: demo.status || 'completed',
          counselor: demo.counselor || '' // Added counselor field mapping
        })),
        ...processDemoData(oneToOneDemos, 'one-to-one').map(demo => ({
          ...demo,
          demoType: 'one-to-one',
          type: 'one-to-one',
          title: demo.title || `One-on-One with ${demo.studentName}` || 'One-to-One Demo',
          registeredStudents: demo.student ? [demo.student] : [],
          convertedStudents: demo.converted ? [demo.student] : [],
          createdAt: demo.createdAt || demo.date || demo.scheduledAt,
          status: demo.status || 'completed',
          counselor: demo.counselor || '' // Already has counselor
        })),
        ...processDemoData(liveClasses, 'live').map(demo => ({
          ...demo,
          demoType: 'live',
          type: 'live',
          title: demo.title || demo.courseName || 'Live Class Demo',
          registeredStudents: demo.enrolledStudents || demo.students || [],
          convertedStudents: demo.conversions || [],
          createdAt: demo.createdAt || demo.date || demo.startTime,
          status: demo.status || 'completed',
          counselor: demo.counselor || '' // Already has counselor
        }))
      ];

      // Filter data based on user role
      let filteredDemos = allDemos;
      
      // Check if user is a counsellor (case insensitive)
      const isCounsellor = user?.role?.toLowerCase().includes('counsellor') || 
                          user?.role?.toLowerCase().includes('counselor');
      
      if (isCounsellor) {
        console.log('=== DEBUG: Filtering for Counsellor ===');
        const counsellorName = user.FullName || user.name || '';
        console.log('Counsellor name to match:', counsellorName);
        console.log('All counselor names in data:', [...new Set(allDemos.map(d => d.counselor).filter(Boolean))]);
        
        const beforeFilter = allDemos.length;
        
        // Try different matching strategies
        filteredDemos = allDemos.filter(demo => {
          // Check for exact match on counselor field
          if (demo.counselor && counsellorName && 
              demo.counselor.toLowerCase() === counsellorName.toLowerCase()) {
            return true;
          }
          
          // Check for partial match (in case names are stored differently)
          if (demo.counselor && counsellorName && 
              demo.counselor.toLowerCase().includes(counsellorName.toLowerCase())) {
            return true;
          }
          
          // Check other potential fields
          if (demo.counsellor && counsellorName && 
              demo.counsellor.toLowerCase() === counsellorName.toLowerCase()) {
            return true;
          }
          
          // Check createdBy field if it exists
          if (demo.createdBy === user._id) {
            return true;
          }
          
          return false;
        });
        
        console.log(`Filtered from ${beforeFilter} to ${filteredDemos.length} demos`);
        
        if (filteredDemos.length === 0) {
          console.log('WARNING: No demos found for counsellor. Showing all demos for debugging.');
          // For now, show all demos so the counsellor can see something
          filteredDemos = allDemos;
        }
      } else {
        console.log('=== DEBUG: Admin View - Showing All Demos ===');
        console.log(`Showing all ${allDemos.length} demos`);
      }

      return filteredDemos;
    } catch (error) {
      console.error('Error fetching demo reports:', error);
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
    lastFetch: null,
  },
  reducers: {
    clearDemoReportError: (state) => {
      state.error = null;
    },
    updateDemoStatus: (state, action) => {
      const { demoId, status } = action.payload;
      const demo = state.demos.find(d => d._id === demoId || d.id === demoId);
      if (demo) {
        demo.status = status;
      }
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
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchAllDemoReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.demos = [];
      });
  },
});

export const { clearDemoReportError, updateDemoStatus } = demoReportSlice.actions;
export default demoReportSlice.reducer;