import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosReq from './axios.js';

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Request failed';

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async ({ email }, { rejectWithValue }) => {
    try {
      return await axiosReq.post('/auth/send-otp', { email });
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ otp }, { rejectWithValue }) => {
    try {
      return await axiosReq.post('/auth/verify-otp', { otp });
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);