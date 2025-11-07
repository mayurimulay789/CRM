import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/slices/authSlice";
import onlineDemoReducer from "../store/slices/onlineDemoSlice";
import offlineDemoReducer from "../features/offlineDemo/offlineDemoSlice";
import oneToOneReducer from "../features/oneToOne/oneToOneSlice";
import liveClassesReducer from "../features/liveClasses/liveClassesSlice";
import studentGrievanceReducer from "../store/slices/studentGrievanceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onlineDemo: onlineDemoReducer,
    offlineDemo: offlineDemoReducer,
    oneToOne: oneToOneReducer,
    liveClasses: liveClassesReducer,
    studentGrievance: studentGrievanceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
