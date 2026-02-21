import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { registerUser, clearError, clearSuccess } from '../../../store/slices/authSlice';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success, isAuthenticated } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    FullName: '',
    email: '',
    password: '',
    role: 'Counsellor',
    mobileNumber: '',
    education: ''
  });
  const [localMessage, setLocalMessage] = useState('');

  const { FullName, email, password, mobileNumber, education, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalMessage('');
    dispatch(clearError());

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
    dispatch(registerUser(formData));
    // toast will be shown via useEffect based on success/error
  };

  // Handle success/error toasts and navigation
  useEffect(() => {
    if (success) {
      toast.success('Counsellor added successfully!');
      // Optional: navigate to another page
      // navigate('/counsellors');
      dispatch(clearSuccess());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error, dispatch, navigate]);

  const displayMessage = localMessage || error || success;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header with Back button and title */}
        <div className="flex items-center justify-between p-6 border-b">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Add Counsellor</h1>
          <div className="w-16" /> {/* spacer for centering */}
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* FullName (required) */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              FullName <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="FullName"
              value={FullName}
              onChange={onChange}
              placeholder="Enter full name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
              disabled={loading}
            />
          </div>

          {/* Email (required) */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter email address"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
              disabled={loading}
            />
          </div>

          {/* Password (required) */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter password (min. 6 characters)"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
              disabled={loading}
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mobile Number</label>
            <input
              type="tel"
              name="mobileNumber"
              value={mobileNumber}
              onChange={onChange}
              placeholder="Enter mobile number"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
              disabled={loading}
            />
          </div>

          {/* Education */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Education</label>
            <input
              type="text"
              name="education"
              value={education}
              onChange={onChange}
              placeholder="Enter education background"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
              disabled={loading}
            />
          </div>


          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin-panel')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Adding...' : 'Add Counsellor'}
            </button>
          </div>

          {/* Message display */}
          {displayMessage && (
            <p className={`mt-4 text-center ${
              localMessage || error ? 'text-red-500' : 'text-green-500'
            }`}>
              {displayMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;