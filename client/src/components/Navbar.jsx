// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { logoutUser } from '../store/slices/authSlice';

// const Navbar = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   // Get auth state from Redux
//   const { isAuthenticated, user } = useSelector(state => state.auth);

//   const handleLogout = () => {
//     dispatch(logoutUser());
//     navigate('/');
//   };

//   const handleDashboardNavigation = () => {
//     console.log('User role:', user?.role);
//     if (user?.role === 'admin') {
//       navigate('/admin-panel');
//     } else if (user?.role === 'Counsellor') {
//       navigate('/counsellor-panel');
//     }
//   };

//   return (
//     <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Left side - Logo/App Name */}
//           <div className="flex-shrink-0">
//             <Link 
//               to="/" 
//               className="text-2xl font-bold text-amber-600 hover:text-amber-700 transition duration-300"
//             >
//               CRM Application
//             </Link>
//           </div>

//           {/* Right side - Navigation Links */}
//           <div className="flex items-center space-x-4">
//             {isAuthenticated ? (
//               // User is logged in - Show Dashboard and Logout
//               <>


//                 <div className="flex items-center space-x-2">
//                   <span className="text-gray-700 text-sm">
//                     Welcome, {user?.FullName}
//                   </span>
//                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 capitalize">
//                     {user?.role}
//                   </span>
//                 </div>


//                 <button
//                   onClick={handleDashboardNavigation}
//                   className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-medium transition duration-300 transform hover:scale-105"
//                 >
//                   Dashboard
//                 </button>

//                 <button
//                   onClick={handleLogout}
//                   className="text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300 border border-gray-300 hover:border-amber-500"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               // User is not logged in - Show Login and Register
//               <>
//                 <Link
//                   to="/login"
//                   className="text-gray-700 hover:text-amber-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300"
//                 >
//                   Login
//                 </Link>
//                 <Link
//                   to="/register"
//                   className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-medium transition duration-300 transform hover:scale-105"
//                 >
//                   Register
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;



import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleDashboardNavigation = () => {
    if (user?.role === 'admin') {
      navigate('/admin-panel');
    } else if (user?.role === 'Counsellor') {
      navigate('/counsellor-panel');
    } else {
      navigate('/dashboard');
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* MAIN NAV BAR */}
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-amber-600 hover:text-amber-700 transition"
          >
            CRM Application
          </Link>

          {/* HAMBURGER (MOBILE ONLY) */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded focus:outline-none focus:ring-2 text-gray-700"
          >
            <div className="w-6 h-6 flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-current transition ${isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
              <span className={`w-full h-0.5 bg-current transition ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`w-full h-0.5 bg-current transition ${isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
            </div>
          </button>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-4">

            {isAuthenticated ? (
              <>
                {/* USER INFO */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 text-sm">
                    Welcome, {user?.FullName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 capitalize">
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={handleDashboardNavigation}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition"
                >
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="border border-gray-300 hover:border-amber-500 text-gray-700 hover:text-amber-600 px-4 py-2 rounded-md transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-amber-600 px-4 py-2 transition"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* MOBILE DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg pb-3">

            {isAuthenticated ? (
              <>
                {/* USER INFO */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-medium">
                      Welcome, {user?.FullName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <button
                  onClick={handleDashboardNavigation}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50"
                >
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-gray-50"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-gray-50"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
