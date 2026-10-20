import { createSlice } from '@reduxjs/toolkit';
import { sendOtp, verifyOtp } from './auth.action.js';

import  explicitlySet  from './utils.js';

const initialState = {
  sendOtpStatus: 'idle',
  verifyOtpStatus: 'idle',
  error: null,
  message: null,
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // we can make this more generic by using a helper function to handle the pending, fulfilled, and rejected cases for each async thunk
    explicitlySet(builder, sendOtp, 'sendOtpStatus');
    explicitlySet(builder, verifyOtp, 'verifyOtpStatus');
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;