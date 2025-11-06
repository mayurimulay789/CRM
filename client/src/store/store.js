

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import batchReducer from './slices/batchSlice';
import trainerReducer from './slices/trainerSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
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