import axios from 'axios';
import { ApiResponse } from '../types';

const API_URL = 'http://localhost:8080/api';

export const sendOTP = async (phoneNumber: string): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/send-otp`, { phoneNumber });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse;
    }
    return { error: 'Network error, please try again later.' };
  }
};

export const verifyOTP = async (phoneNumber: string, otp: string): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, { phoneNumber, otp });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse;
    }
    return { error: 'Network error, please try again later.' };
  }
};

export const checkAuth = async (phoneNumber: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/check-auth?phoneNumber=${encodeURIComponent(phoneNumber)}`);
    return response.data.isAuthenticated;
  } catch (error) {
    return false;
  }
};