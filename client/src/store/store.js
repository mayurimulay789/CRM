




import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import admissionReducer from './slices/admissionSlice';
import courseReducer from './slices/courseSlice';
import studentReducer from './slices/studentSlice';
import studentGrievanceReducer from "./slices/studentGrievanceSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,

    admissions: admissionReducer, // Added admission reducer
    courses: courseReducer,
    students: studentReducer,
    studentGrievance: studentGrievanceReducer, 

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;