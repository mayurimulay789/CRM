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

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
    setInvalidCredentials(false);
    setIsRegistrationSuccess(false);
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = (user.role || '').toString().toLowerCase();

      // Check if this is coming from registration success
      const fromRegistration = isRegistrationSuccess;

      // Clear registration success flag
      if (fromRegistration) {
        setIsRegistrationSuccess(false);
      }

      if (role === "admin") navigate("/admin-panel");
      else if (role === "counsellor" || role === "counselor")
        navigate("/counsellor-panel");
      else navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (success && !isAuthenticated) {
      const successLower = success.toLowerCase();
      if (successLower.includes('register') ||
        successLower.includes('account created') ||
        successLower.includes('successfully registered') ||
        successLower.includes('registration successful')) {
        setIsRegistrationSuccess(true);
      }
    }
  }, [success, isAuthenticated]);

  useEffect(() => {
    if (error) {
      const err = error.toLowerCase();
      if (
        errorLower.includes('invalid') ||
        errorLower.includes('credentials') ||
        errorLower.includes('unauthorized') ||
        errorLower.includes('incorrect') ||
        errorLower.includes('401')
      ) {
        setInvalidCredentials(true);
      } else {
        setInvalidCredentials(false);
      }
    }
  }, [error]);

  const onSubmit = (e) => {
    e.preventDefault();

    setLocalMessage('');
    dispatch(clearError());
    setInvalidCredentials(false);
    setIsRegistrationSuccess(false);

    if (!validateEmail(email)) {
      setLocalMessage("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setLocalMessage("Password must be at least 6 characters");
      return;
    }

    dispatch(loginUser(formData));
    navigate('/'); // Navigate to home immediately after dispatching login action
  };
  const handleforgetPassowrd = () => {
    navigate('/userDetailsforForgetPassword');
  }

  const displayMessage = localMessage || error || success;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">

      {/* Centered Card Container */}
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white p-10 rounded-3xl shadow-2xl transition-all duration-500">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#890c25] tracking-tight">
              RYMA Academy
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#890c25] focus:ring-2 focus:ring-[#890c25]/20 outline-none transition-all duration-200"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="relative space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Enter your password"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#890c25] focus:ring-2 focus:ring-[#890c25]/20 outline-none pr-12 transition-all duration-200"
                required
              />
              <div className='flex w-full justify-right align-right'>
                <button className="text-sm text-amber-500 hover:text-amber-600 mt-2 text-right" onClick={handleforgetPassowrd}>Forgot Password?</button>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2/4 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ?
                  <EyeSlashIcon className="h-5 w-5" /> :
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-sm font-medium text-[#890c25] hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#890c25] text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Messages */}
          {invalidCredentials && (
            <p className="mt-6 text-center text-red-500 text-sm font-medium">
              Invalid credentials. Please check your email and password.
            </p>
          )}

          {!invalidCredentials && displayMessage && (
            <p
              className={`mt-6 text-center text-sm font-medium ${
                localMessage || error ? "text-red-500" : "text-green-500"
              }`}
            >
              {displayMessage}
            </p>
          )}

          {isRegistrationSuccess && !isAuthenticated && (
            <p className="mt-6 text-center text-green-500 text-sm font-medium">
              Registration successful! Auto-logging you in...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;