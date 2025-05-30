export interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string;
  isLoading: boolean;
  error: string | null;
}

export interface User {
  phoneNumber: string;
}