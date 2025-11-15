import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import admissionReducer from './slices/admissionSlice';
import courseReducer from './slices/courseSlice';
import studentReducer from './slices/studentSlice';
import trainerReducer from './slices/trainerSlice';

import batchReducer from './slices/batchSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admissions: admissionReducer, // Added admission reducer
    batch: batchReducer,
    courses: courseReducer,
    students: studentReducer,
    trainer: trainerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
