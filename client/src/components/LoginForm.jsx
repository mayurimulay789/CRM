import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError, clearSuccess } from "../store/slices/authSlice";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, success, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [localMessage, setLocalMessage] = useState("");
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Clear errors on load
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
    setInvalidCredentials(false);
    setIsRegistrationSuccess(false);
  }, [dispatch]);

  // Handle redirect after login
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = (user.role || "").toLowerCase();

      if (role === "admin") {
        navigate("/admin-panel");
      } else if (role === "counsellor" || role === "counselor") {
        navigate("/counsellor-panel");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Detect registration success
  useEffect(() => {
    if (success && !isAuthenticated) {
      const successLower = success.toLowerCase();
      if (
        successLower.includes("register") ||
        successLower.includes("account created") ||
        successLower.includes("registration successful")
      ) {
        setIsRegistrationSuccess(true);
      }
    }
  }, [success, isAuthenticated]);

  // Detect invalid credentials
  useEffect(() => {
    if (error) {
      const err = error.toLowerCase();
      if (
        err.includes("invalid") ||
        err.includes("credentials") ||
        err.includes("unauthorized") ||
        err.includes("incorrect") ||
        err.includes("401")
      ) {
        setInvalidCredentials(true);
      } else {
        setInvalidCredentials(false);
      }
    }
  }, [error]);

  const onSubmit = (e) => {
    e.preventDefault();

    setLocalMessage("");
    dispatch(clearError());
    setInvalidCredentials(false);

    if (!validateEmail(email)) {
      setLocalMessage("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setLocalMessage("Password must be at least 6 characters");
      return;
    }

    dispatch(loginUser(formData));
  };

  const displayMessage = localMessage || error || success;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-800 via-blue-600 to-blue-300 px-4">
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between">

        {/* LEFT SIDE BRAND SECTION */}
        <div className="md:w-1/2 text-white text-center md:text-left mb-10 md:mb-0">
          <div className="flex flex-col items-center md:items-start">
            
            {/* LOGO */}
            <img
              src="../public/logo.png"  // Put your Rankmize logo here
              alt="Rankmize Logo"
              className="w-100 md:w-120 mb-4"
            />

          </div>

          <p className="text-lg italic opacity-90">
            "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"
          </p>
        </div>

        {/* RIGHT SIDE LOGIN CARD */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">

            <h2 className="text-2xl font-bold text-center mb-6">
              Welcome to <span className="text-blue-700">RANKMIZE</span>
            </h2>

            <form onSubmit={onSubmit} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Email address :
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  placeholder="Your@gmail.com"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={loading}
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <label className="block text-gray-700 mb-2 font-medium">
                  Password :
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-500"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* FORGOT PASSWORD */}
              <div className="text-right">
                <a
                  href="/forgot-password"
                  className="text-blue-600 text-sm hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition duration-300 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* ERROR MESSAGES */}
            {invalidCredentials && (
              <p className="mt-4 text-center text-red-500">
                Invalid credentials. Please check your email and password.
              </p>
            )}

            {!invalidCredentials && displayMessage && (
              <p
                className={`mt-4 text-center ${
                  localMessage || error
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {displayMessage}
              </p>
            )}

            {isRegistrationSuccess && !isAuthenticated && (
              <p className="mt-4 text-center text-green-500">
                Registration successful! Auto-logging you in...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;