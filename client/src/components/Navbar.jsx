import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const handleDashboardNavigation = () => {
    console.log('User role:', user?.role);
    if (user?.role === 'admin') {
      navigate('/admin-panel');
    } else if (user?.role === 'Counsellor') {
      navigate('/counsellor-panel');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/App Name */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="text-2xl font-bold text-amber-600 hover:text-amber-700 transition duration-300"
            >
              CRM Application
            </Link>
          </div>

          {/* Right side - Navigation Links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // User is logged in - Show Dashboard and Logout
              <>
                <button
                  onClick={handleDashboardNavigation}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-medium transition duration-300 transform hover:scale-105"
                >
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300 border border-gray-300 hover:border-amber-500"
                >
                  Logout
                </button>
              </>
            ) : (
              // User is not logged in - Show Login and Register
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-medium transition duration-300 transform hover:scale-105"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;