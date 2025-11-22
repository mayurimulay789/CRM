import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { registerUser, clearError, clearSuccess } from '../store/slices/authSlice';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // ✅ Get auth state from Redux
  const { loading, error, success, isAuthenticated } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    FullName: '',
    email: '',
    password: '',
    role: 'Counsellor',
  });
  const [localMessage, setLocalMessage] = useState('');

  const { FullName, email, password, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // ✅ Clear messages when component mounts
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  // ✅ Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();

    // ✅ Clear previous messages
    setLocalMessage('');
    dispatch(clearError());

    // Validations
    if (!FullName.trim()) {
      setLocalMessage('FullName is required');
      return;
    }
    if (!validateEmail(email)) {
      setLocalMessage('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setLocalMessage('Password must be at least 6 characters');
      return;
    }

    // ✅ Dispatch register action (Redux handles everything)
    dispatch(registerUser(formData));
    toast.success('Registration successful! Please login.');
  };

  // ✅ Determine which message to display
  const displayMessage = localMessage || error || success;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <div className="max-w-4xl w-full min-h-[500px] bg-white shadow-lg rounded-lg overflow-hidden flex">
        {/* Optional left side image */}
        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/two.jpg')" }}
        >
          <div className="h-full w-full flex flex-col items-center justify-center bg-black bg-opacity-40">
            <h2 className="text-white text-3xl font-bold px-4 text-center">
              Join Us
            </h2>
            <p className="text-white text-sm mt-2 px-4 text-center">
              Register using your information to get started
            </p>
          </div>
        </div>

        {/* Right side form */}
        <div className="w-full md:w-1/2 p-8 -translate-y-4">
          <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
          <p className="text-center text-gray-500 mb-6">
            Fill in your information to create an account
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* FullName */}
            <div>
              <label className="block text-gray-700 mb-1">FullName</label>
              <input
                type="text"
                name="FullName"
                value={FullName}
                onChange={onChange}
                placeholder="Enter your FullName"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
                disabled={loading} // ✅ Disable during loading
              />
            </div>

            {/* Email */}
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
                disabled={loading} // ✅ Disable during loading
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
                disabled={loading} // ✅ Disable during loading
              />
            </div>

            {/* Submit */}
            <div className="flex justify-between items-center text-sm">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded font-semibold transition duration-300 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </div>
          </form>

          {/* ✅ Enhanced Message Display */}
          {displayMessage && (
            <p className={`mt-4 text-center ${
              localMessage || error ? 'text-red-500' : 'text-green-500'
            }`}>
              {displayMessage}
            </p>
          )}

          <p className="mt-4 text-center text-gray-600">
            Already have an account?{' '}
            <span
              onClick={() => !loading && navigate('/login')}
              className={`text-amber-500 font-semibold cursor-pointer hover:underline ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;