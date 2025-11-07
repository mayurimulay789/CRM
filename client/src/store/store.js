import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import onlineDemoReducer from './slices/onlineDemoSlice';
import offlineDemoReducer from './slices/offlineDemoSlice';
import oneToOneReducer from './slices/oneToOneSlice';
import liveClassesReducer from './slices/liveClassesSlice';
import batchReducer from './slices/batchSlice';
import trainerReducer from './slices/trainerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onlineDemo: onlineDemoReducer,
    offlineDemo: offlineDemoReducer,
    oneToOne: oneToOneReducer,
    liveClasses: liveClassesReducer,
    batch: batchReducer,
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