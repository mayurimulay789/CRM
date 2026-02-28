import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/slices/authSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const handleDashboardNavigation = () => {
    if (user?.role === "admin") {
      navigate("/admin-panel");
    } else if (user?.role === "Counsellor") {
      navigate("/counsellor-panel");
    } else {
      navigate("/dashboard");
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#890c25] shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* MAIN NAV */}
        <div className="flex justify-between items-center h-16">

          {/* LOGO - Properly sized */}
          <Link to="/" className="flex items-center py-1">
            <img
              src="/logo1.png"
              alt="RYMA Logo"
              className="h-18 w-auto object-contain"
              // Using h-12 for consistent height, w-auto maintains aspect ratio
            />
          </Link>

          {/* HAMBURGER */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-white focus:outline-none"
          >
            <div className="w-6 h-6 flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-white transition ${isMobileMenuOpen ? "rotate-45 translate-y-2.5" : ""}`} />
              <span className={`w-full h-0.5 bg-white transition ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`w-full h-0.5 bg-white transition ${isMobileMenuOpen ? "-rotate-45 -translate-y-2.5" : ""}`} />
            </div>
          </button>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-4 text-white">

            {isAuthenticated ? (
              <>
                {/* USER INFO */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    Welcome, {user?.FullName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs bg-white text-[#890c25] capitalize font-medium">
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={handleDashboardNavigation}
                  className="bg-white text-[#890c25] px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
                >
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="border border-white px-4 py-2 rounded-md hover:bg-white hover:text-[#890c25] transition"
                >
                  Logout
                </button>
              </>
            ) : null}

          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg pb-3">

            {isAuthenticated ? (
              <>
                <div className="px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">
                      Welcome, {user?.FullName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[#890c25] text-white capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <button
                  onClick={handleDashboardNavigation}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>
            )}

          </div>
        )}

      </div>
    </nav>
  );
};
 
export default Navbar;