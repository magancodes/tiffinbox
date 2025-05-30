import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({ 
  length = 6, 
  onComplete,
  error
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Initialize refs array
    inputRefs.current = inputRefs.current.slice(0, length);
    
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [length]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow one digit
    if (value.length > 1) {
      return;
    }
    
    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input if current input is filled
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Check if OTP is complete
    if (newOtp.every(digit => digit) && newOtp.length === length) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted data is numeric and matches expected length
    if (/^\d+$/.test(pastedData) && pastedData.length <= length) {
      const newOtp = [...otp];
      
      // Fill in the OTP fields with pasted data
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      
      setOtp(newOtp);
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex(digit => !digit);
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
      
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex]?.focus();
      }
      
      // Check if OTP is complete
      if (newOtp.every(digit => digit) && newOtp.length === length) {
        onComplete(newOtp.join(''));
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center gap-2 sm:gap-4">
        {Array.from({ length }, (_, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="w-12 h-14"
          >
            <input
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={otp[index]}
              onChange={e => handleChange(index, e)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`
                w-full h-full text-center text-xl font-bold 
                border-2 rounded-lg outline-none 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                ${error ? 'border-red-500' : 'border-gray-300'}
                transition-all duration-200
              `}
            />
          </motion.div>
        ))}
      </div>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-center text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default OTPInput;