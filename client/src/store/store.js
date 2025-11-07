<<<<<<< HEAD


import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import batchReducer from './slices/batchSlice';
import trainerReducer from './slices/trainerSlice';

=======
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import admissionReducer from './slices/admissionSlice';
import courseReducer from './slices/courseSlice';
import studentReducer from './slices/studentSlice';
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef

export const store = configureStore({
  reducer: {
    auth: authReducer,
<<<<<<< HEAD
    batch: batchReducer,
    trainer: trainerReducer,
=======
    admissions: admissionReducer, // Added admission reducer
    courses: courseReducer,
    students: studentReducer,
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;