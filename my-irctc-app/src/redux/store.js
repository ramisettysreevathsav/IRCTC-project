import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.reducer.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});