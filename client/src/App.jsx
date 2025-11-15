import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Toaster } from 'react-hot-toast';
import { store } from "./store/store";
import { getCurrentUser } from "./store/slices/authSlice";

// Common Components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

// Public Pages
import Home from "./pages/Home.jsx";
import RegistrationForm from "./components/RegistrationForm.jsx";
import LoginForm from "./components/LoginForm.jsx";

// Protected Pages
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import CounsellorDashboardPage from "./pages/CounsellorDashboardPage.jsx";
import AddBatchForm from "./components/AddBatchForm.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Demo Management Pages
import DemoPage from "./components/Demo/DemoPage";
import OnlineDemo from "./components/counsellor/Demo/OnlineDemo.jsx";
import OfflineDemo from "./components/Demo/OfflineDemo";
import OneToOneDemo from "./components/Demo/OneToOneDemo";
import LiveClasses from "./components/Demo/LiveClasses";

// --------------------
// AppContent Component
// --------------------
function AppContent() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  // ✅ Fetch user on app load
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  // ✅ Loader while verifying authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <div className="App scroll-smooth pt-16">
        <Routes>

          {/* 🌐 Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />

          {/* ✅ Protected Routes (Require Authentication) */}
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/counsellor-panel"
            element={
              <ProtectedRoute>
                <CounsellorDashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {/* <Footer /> */}
    </Router>
  );
}

// --------------------
// Main App Wrapper
// --------------------

// Main App Component with Redux Provider

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
