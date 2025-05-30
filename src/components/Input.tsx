import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    
    return (
      <div className={`mb-4 ${widthClass}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <motion.div 
          initial={{ y: 0 }}
          animate={{ y: error ? [0, -2, 2, -2, 0] : 0 }}
          transition={{ duration: 0.4 }}
        >
          <input
            ref={ref}
            className={`
              px-4 py-3 w-full rounded-lg border 
              ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'} 
              focus:outline-none focus:ring-4 focus:border-blue-500
              transition-all duration-200
              ${className}
            `}
            {...props}
          />
        </motion.div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;