<<<<<<< HEAD
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
=======

import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./store/store";
import { getCurrentUser } from "./store/slices/authSlice";

import Home from "./pages/Home.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import RegistrationForm from "./components/RegistrationForm.jsx";
import LoginForm from "./components/LoginForm.jsx";

import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import CounsellorDashboardPage from "./pages/CounsellorDashboardPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";


// App Content (Redux connected component)
function AppContent() {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);

  // ✅ Check if user is logged in on app start
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

<<<<<<< HEAD
  // ✅ Loader while verifying authentication
=======
  // Show loading while checking authentication
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef
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
<<<<<<< HEAD
          {/* 🌐 Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />

          {/* 🧑‍💼 Protected Routes */}
          <Route
            path="/admin-panel"
=======
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
          
          {/* ✅ Protected Routes (Require Authentication) */}
          <Route 
            path="/admin-panel" 
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
<<<<<<< HEAD
            }
          />
          <Route
            path="/counsellor-panel"
=======
            } 
          />
          {/* ✅ Protected Routes (Require Authentication) */}
          <Route 
            path="/counsellor-panel" 
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef
            element={
              <ProtectedRoute>
                <CounsellorDashboardPage />
              </ProtectedRoute>
<<<<<<< HEAD
            }
          />
          <Route
            path="/admin/add-batch"
            element={
              <ProtectedRoute>
                <AddBatchForm />
              </ProtectedRoute>
            }
          />

          {/* 🎓 Demo Management Routes */}
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/demo/online" element={<OnlineDemo />} />
          <Route path="/demo/offline" element={<OfflineDemo />} />
          <Route path="/demo/one-to-one" element={<OneToOneDemo />} />
          <Route path="/demo/live-classes" element={<LiveClasses />} />
        </Routes>
      </div>
      {/* <Footer /> */}
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: 'green',
              color: 'white',
            },
          },
          error: {
            style: {
              background: 'red',
              color: 'white',
            },
          },
          warning: {
            style: {
              background: 'orange',
              color: 'white',
            },
          },
        }}
      />
=======
            } 
          />
        </Routes>
      </div>
      {/* <Footer /> */}
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef
    </Router>
  );
}

<<<<<<< HEAD
// --------------------
// Main App Wrapper
// --------------------
=======
// Main App Component with Redux Provider
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef
