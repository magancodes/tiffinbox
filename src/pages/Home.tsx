import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { CheckCircle, User, LogOut } from 'lucide-react';

const Home: React.FC = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate('/');
    }
  }, [authState.isAuthenticated, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!authState.isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50"
    >
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-gray-800">Verified App</h1>
          </div>
          
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Welcome!</h2>
              <p className="text-gray-600">Your phone is verified</p>
            </div>
          </div>
          
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center mb-6">
            <CheckCircle className="h-5 w-5 text-emerald-600 mr-3 flex-shrink-0" />
            <p className="text-emerald-800">
              You have successfully verified your phone number: <span className="font-medium">{authState.phoneNumber}</span>
            </p>
          </div>
          
          <p className="text-gray-600 mb-6">
            This is your secure dashboard. Your phone number has been verified and you are now authenticated.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Account Settings', 'Security', 'Notifications'].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (index * 0.1) }}
                className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200 p-4 rounded-lg border border-gray-200 cursor-pointer"
              >
                <h3 className="font-medium text-gray-800">{item}</h3>
                <p className="text-sm text-gray-600 mt-1">Manage your {item.toLowerCase()}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <div className="text-center text-gray-600 text-sm">
          <p>© 2025 Phone Verification App. All rights reserved.</p>
        </div>
      </main>
    </motion.div>
  );
};

export default Home;