import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const CounsellorSidebar = ({ activeSection, setActiveSection }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [isBatchesOpen, setIsBatchesOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
            <span className="font-bold text-lg">
              {user?.FullName?.charAt(0) || 'C'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{user?.FullName}</h3>
            <p className="text-amber-300 text-sm capitalize">{user?.role}</p>
            <p className="text-gray-400 text-xs">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4 space-y-2">
        {/* Search */}
        <button
          onClick={() => setActiveSection('search')}
          className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
            activeSection === 'search' 
              ? 'bg-amber-500 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          🔍 Search
        </button>

        {/* Overview */}
        <button
          onClick={() => setActiveSection('overview')}
          className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
            activeSection === 'overview' 
              ? 'bg-amber-500 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          📊 Overview
        </button>

        {/* Dashboard */}
        <button
          onClick={() => setActiveSection('dashboard')}
          className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
            activeSection === 'dashboard' 
              ? 'bg-amber-500 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          🏠 Dashboard
        </button>

        {/* My Works */}
        <button
          onClick={() => setActiveSection('my-works')}
          className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
            activeSection === 'my-works' 
              ? 'bg-amber-500 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          💼 My Works
        </button>

        {/* Batches */}
        <div>
          <button
            onClick={() => setIsBatchesOpen(!isBatchesOpen)}
            className="w-full text-left px-4 py-3 rounded-lg transition duration-200 text-gray-300 hover:bg-gray-700 flex justify-between items-center"
          >
            <span>📚 Batches</span>
            <span>{isBatchesOpen ? '▲' : '▼'}</span>
          </button>
          {isBatchesOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button
                onClick={() => setActiveSection('closed-batch')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'closed-batch' 
                    ? 'bg-amber-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Closed Batch
              </button>
              <button
                onClick={() => setActiveSection('running-batch')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'running-batch' 
                    ? 'bg-amber-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Running Batch
              </button>
              <button
                onClick={() => setActiveSection('upcoming-batch')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'upcoming-batch' 
                    ? 'bg-amber-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Upcoming Batch
              </button>
            </div>
          )}
        </div>

        {/* Demo */}
        <div>
          <button
            onClick={() => setIsDemoOpen(!isDemoOpen)}
            className="w-full text-left px-4 py-3 rounded-lg transition duration-200 text-gray-300 hover:bg-gray-700 flex justify-between items-center"
          >
            <span>🎯 Demo</span>
            <span>{isDemoOpen ? '▲' : '▼'}</span>
          </button>
          {isDemoOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button
                onClick={() => setActiveSection('online-demo')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'online-demo' 
                    ? 'bg-amber-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Online
              </button>
              <button
                onClick={() => setActiveSection('offline-demo')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'offline-demo' 
                    ? 'bg-amber-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Offline
              </button>
              <button
                onClick={() => setActiveSection('one-to-one-demo')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'one-to-one-demo' 
                    ? 'bg-amber-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                1-2-1
              </button>
              <button
                onClick={() => setActiveSection('live-class-demo')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'live-class-demo' 
                    ? 'bg-amber-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Live Class
              </button>
            </div>
          )}
        </div>

        {/* Admission */}
        <div>
          <button
            onClick={() => setIsAdmissionOpen(!isAdmissionOpen)}
            className="w-full text-left px-4 py-3 rounded-lg transition duration-200 text-gray-300 hover:bg-gray-700 flex justify-between items-center"
          >
            <span>🎓 Admission</span>
            <span>{isAdmissionOpen ? '▲' : '▼'}</span>
          </button>
          {isAdmissionOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button
                onClick={() => setActiveSection('admission-form')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'admission-form' 
                    ? 'bg-amber-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Admission Form
              </button>
              <button
                onClick={() => setActiveSection('enrolled-student')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'enrolled-student' 
                    ? 'bg-amber-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Enrolled Student
              </button>
              <button
                onClick={() => setActiveSection('payment-invoice-sheet')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'payment-invoice-sheet' 
                    ? 'bg-amber-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Payment Invoice Sheet
              </button>
            </div>
          )}
        </div>

        {/* Complaint */}
        <div>
          <button
            onClick={() => setIsComplaintOpen(!isComplaintOpen)}
            className="w-full text-left px-4 py-3 rounded-lg transition duration-200 text-gray-300 hover:bg-gray-700 flex justify-between items-center"
          >
            <span>📋 Complaint</span>
            <span>{isComplaintOpen ? '▲' : '▼'}</span>
          </button>
          {isComplaintOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button
                onClick={() => setActiveSection('student-grievance')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'student-grievance' 
                    ? 'bg-amber-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Student Grievance
              </button>
              <button
                onClick={() => setActiveSection('campus-grievance')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'campus-grievance' 
                    ? 'bg-amber-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Campus Grievance
              </button>
            </div>
          )}
        </div>

        {/* MIS */}
        <button
          onClick={() => setActiveSection('mis')}
          className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
            activeSection === 'mis' 
              ? 'bg-amber-500 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          📈 MIS
        </button>

        {/* Apply Leave */}
        <button
          onClick={() => setActiveSection('apply-leave')}
          className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
            activeSection === 'apply-leave' 
              ? 'bg-amber-500 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          🏖️ Apply Leave
        </button>

        {/* Leave List */}
        <button
          onClick={() => setActiveSection('leave-list')}
          className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
            activeSection === 'leave-list' 
              ? 'bg-amber-500 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          📋 Leave List
        </button>

        {/* Holiday List */}
        <button
          onClick={() => setActiveSection('holiday-list')}
          className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
            activeSection === 'holiday-list' 
              ? 'bg-amber-500 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          🎉 Holiday List
        </button>

        {/* Attendance */}
        <button
          onClick={() => setActiveSection('attendance')}
          className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
            activeSection === 'attendance' 
              ? 'bg-amber-500 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          ✅ Attendance
        </button>

        {/* My Letter */}
        <button
          onClick={() => setActiveSection('my-letter')}
          className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
            activeSection === 'my-letter' 
              ? 'bg-amber-500 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          ✉️ My Letter
        </button>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default CounsellorSidebar;