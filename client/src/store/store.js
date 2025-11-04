

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import batchReducer from './slices/batchSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    batch: batchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;