import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import OTPInput from '../components/OTPInput';
import { KeyRound } from 'lucide-react';

const VerifyOTP: React.FC = () => {
  const { authState, verifyCode } = useAuth();
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();
  
  // Redirect if no phone number in state
  useEffect(() => {
    if (!authState.phoneNumber) {
      navigate('/');
    }
  }, [authState.phoneNumber, navigate]);
  
  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);
  
  const handleVerify = async (otp: string) => {
    setOtpError('');
    
    if (otp.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }
    
    const success = await verifyCode(otp);
    if (success) {
      navigate('/home');
    }
  };
  
  const handleResendOTP = () => {
    // Reset countdown
    setCountdown(30);
    // Navigate back to phone input
    navigate('/');
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    // This is a simple format, you might want to use a library for proper formatting
    return phone.length > 4 
      ? `${phone.slice(0, phone.length - 4)}****` 
      : phone;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Verify Your Phone</h1>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code sent to {formatPhoneNumber(authState.phoneNumber)}
          </p>
        </div>

        <div className="space-y-6">
          <OTPInput 
            length={6} 
            onComplete={handleVerify} 
            error={otpError || (authState.error as string)}
          />
          
          <div className="flex justify-center mt-4">
            <Button 
              type="button"
              variant="outline"
              disabled={countdown > 0}
              onClick={handleResendOTP}
            >
              {countdown > 0 
                ? `Resend code in ${countdown}s` 
                : 'Resend code'}
            </Button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Didn't receive the code? Check your phone number and try again.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VerifyOTP;