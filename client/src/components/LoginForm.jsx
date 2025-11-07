import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError, clearSuccess } from '../store/slices/authSlice';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; 

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading, error, success, isAuthenticated } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [localMessage, setLocalMessage] = useState('');

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    setLocalMessage('');
    dispatch(clearError());
    
    if (!validateEmail(email)) {
      setLocalMessage('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setLocalMessage('Password must be at least 6 characters');
      return;
    }

    dispatch(loginUser(formData));
  };

  const displayMessage = localMessage || error || success;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <div className="max-w-4xl w-full min-h-[450px] bg-white shadow-lg rounded-lg overflow-hidden flex">
        {/* Left side image */}
        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/two.jpg')" }}
        >
          <div className="h-full w-full flex flex-col items-center justify-center bg-black bg-opacity-40">
            <h2 className="text-white text-3xl font-bold px-4 text-center">
              Welcome Back
            </h2>
            <p className="text-white text-sm mt-2 px-4 text-center">
              Please log in using your personal information to stay connected with us
            </p>
          </div>
        </div>

        {/* Right side form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
          <p className="text-center text-gray-500 mb-6">
            Please log in using your personal information
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
                disabled={loading}
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-400 pr-10"
                required
                disabled={loading}
              />
              {/* ✅ FIXED BUTTON - JSX attribute removed */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2/3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? 
                  <EyeSlashIcon className="h-5 w-5" /> : 
                  <EyeIcon className="h-5 w-5" />
                }
              </button>
            </div>

            <div className="flex justify-between items-center text-sm">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded font-semibold transition duration-300 disabled:bg-amber-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </form>

          {displayMessage && (
            <p className={`mt-4 text-center ${
              localMessage || error ? 'text-red-500' : 'text-green-500'
            }`}>
              {displayMessage}
            </p>
          )}

          <p className="mt-4 text-center text-gray-600">
            Don't have an account?{' '}
            <span
              onClick={() => !loading && navigate('/register')}
              className={`text-amber-500 font-semibold cursor-pointer hover:underline ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;