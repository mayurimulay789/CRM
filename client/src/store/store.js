import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import onlineDemoReducer from './slices/onlineDemoSlice';
import offlineDemoReducer from './slices/offlineDemoSlice';
import oneToOneReducer from './slices/oneToOneSlice';
import liveClassesReducer from './slices/liveClassesSlice';
import batchReducer from './slices/batchSlice';
import trainerReducer from './slices/trainerSlice';
import admissionReducer from './slices/admissionSlice';
import courseReducer from './slices/courseSlice';
import studentReducer from './slices/studentSlice';
import enrollmentRducer from './slices/enrollmentSlice';
import paymentReducer from './slices/paymentSlice';
import studentGrievanceReducer from "./slices/studentGrievanceSlice";
import demoReportReducer from './slices/demoReportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onlineDemo: onlineDemoReducer,
    offlineDemo: offlineDemoReducer,
    oneToOne: oneToOneReducer,
    liveClasses: liveClassesReducer,
    batch: batchReducer,
    trainer: trainerReducer,
    admissions: admissionReducer,
    courses: courseReducer,
    students: studentReducer,
    enrollments: enrollmentRducer,
    payments: paymentReducer,
    studentGrievance: studentGrievanceReducer, 
    demoReports: demoReportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;