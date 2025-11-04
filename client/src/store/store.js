import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import admissionReducer from './slices/admissionSlice';
import courseReducer from './slices/courseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admissions: admissionReducer,
    courses: courseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;