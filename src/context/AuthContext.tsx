import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { checkAuth, sendOTP, verifyOTP } from '../services/api';

interface AuthContextType {
  authState: AuthState;
  login: (phoneNumber: string) => Promise<boolean>;
  verifyCode: (otp: string) => Promise<boolean>;
  logout: () => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  phoneNumber: '',
  isLoading: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Check if user is already authenticated
  useEffect(() => {
    const savedPhone = localStorage.getItem('phoneNumber');
    if (savedPhone) {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      checkAuth(savedPhone)
        .then(isAuthenticated => {
          if (isAuthenticated) {
            setAuthState({
              isAuthenticated: true,
              phoneNumber: savedPhone,
              isLoading: false,
              error: null,
            });
          } else {
            // Clear local storage if authentication check fails
            localStorage.removeItem('phoneNumber');
            setAuthState(initialState);
          }
        })
        .catch(() => {
          localStorage.removeItem('phoneNumber');
          setAuthState(initialState);
        });
    }
  }, []);

  const login = async (phoneNumber: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await sendOTP(phoneNumber);
      
      if (result.success) {
        setAuthState({
          ...authState,
          phoneNumber,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        setAuthState({
          ...authState,
          isLoading: false,
          error: result.error || 'Failed to send verification code',
        });
        return false;
      }
    } catch (error) {
      setAuthState({
        ...authState,
        isLoading: false,
        error: 'Network error. Please try again.',
      });
      return false;
    }
  };

  const verifyCode = async (otp: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await verifyOTP(authState.phoneNumber, otp);
      
      if (result.success) {
        localStorage.setItem('phoneNumber', authState.phoneNumber);
        setAuthState({
          ...authState,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        setAuthState({
          ...authState,
          isLoading: false,
          error: result.error || 'Invalid verification code',
        });
        return false;
      }
    } catch (error) {
      setAuthState({
        ...authState,
        isLoading: false,
        error: 'Network error. Please try again.',
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('phoneNumber');
    setAuthState(initialState);
  };

  return (
    <AuthContext.Provider value={{ authState, login, verifyCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};