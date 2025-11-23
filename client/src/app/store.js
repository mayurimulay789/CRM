import { configureStore } from "@reduxjs/toolkit";
<<<<<<< HEAD
=======
import authReducer from "../store/slices/authSlice";
>>>>>>> 82dd13c9f3f4cb37530d734df8ba853deeae7f26
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
