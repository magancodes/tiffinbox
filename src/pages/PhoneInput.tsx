import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { Phone } from 'lucide-react';

const PhoneInput: React.FC = () => {
  const { login, authState } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const navigate = useNavigate();

  const validatePhone = (phone: string): boolean => {
    // Basic validation - can be improved for international formats
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setPhoneError('');
    
    // Validate phone number
    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      return;
    }
    
    if (!validatePhone(phoneNumber)) {
      setPhoneError('Please enter a valid phone number (e.g., +1234567890)');
      return;
    }
    
    // Send OTP
    const success = await login(phoneNumber);
    if (success) {
      navigate('/verify');
    }
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
            <Phone className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Phone Verification</h1>
          <p className="text-gray-600 mt-2">
            Enter your phone number to receive a verification code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            error={phoneError || (authState.error as string)}
            fullWidth
            required
          />
          
          <Button 
            type="submit"
            isLoading={authState.isLoading}
            fullWidth
          >
            Send Verification Code
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>We'll send a one-time verification code to this number</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PhoneInput;