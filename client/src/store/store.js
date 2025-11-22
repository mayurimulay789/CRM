import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import admissionReducer from './slices/admissionSlice';
import courseReducer from './slices/courseSlice';
import studentReducer from './slices/studentSlice';
import trainerReducer from './slices/trainerSlice';
import batchReducer from './slices/batchSlice';
import enrollmentRducer from './slices/enrollmentSlice';
import paymentReducer from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admissions: admissionReducer, // Added admission reducer
    courses: courseReducer,
    students: studentReducer,
    trainer: trainerReducer,
    batch: batchReducer,
    enrollments: enrollmentRducer,
    payments: paymentReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;