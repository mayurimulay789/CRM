import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [isBatchesOpen, setIsBatchesOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="font-bold text-lg">
              {user?.FullName?.charAt(0) || 'A'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{user?.FullName}</h3>
            <p className="text-blue-300 text-sm capitalize">{user?.role}</p>
            <p className="text-gray-400 text-xs">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4 space-y-2">
        {/* Dashboard */}
        <button
          onClick={() => setActiveSection('dashboard')}
          className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
            activeSection === 'dashboard' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          🏠 Admin Dashboard
        </button>

        {/* User Management */}
        <div>
          <button
            onClick={() => setIsManagementOpen(!isManagementOpen)}
            className="w-full text-left px-4 py-3 rounded-lg transition duration-200 text-gray-300 hover:bg-gray-700 flex justify-between items-center"
          >
            <span>👥 User Management</span>
            <span>{isManagementOpen ? '▲' : '▼'}</span>
          </button>
          {isManagementOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button
                onClick={() => setActiveSection('counsellor-management')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'counsellor-management' 
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Counsellor Management
              </button>
              <button
                onClick={() => setActiveSection('student-management')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'student-management' 
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Student Management
              </button>
            </div>
          )}
        </div>

        {/* Batches Management */}
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
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Closed Batch
              </button>
              <button
                onClick={() => setActiveSection('running-batch')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'running-batch' 
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Running Batch
              </button>
              <button
                onClick={() => setActiveSection('upcoming-batch')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'upcoming-batch' 
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Upcoming Batch
              </button>
            </div>
          )}
        </div>

        {/* Demo Management */}
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
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Online
              </button>
              <button
                onClick={() => setActiveSection('offline-demo')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'offline-demo' 
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Offline
              </button>
              <button
                onClick={() => setActiveSection('one-to-one-demo')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'one-to-one-demo' 
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                1-2-1
              </button>
              <button
                onClick={() => setActiveSection('live-class-demo')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'live-class-demo' 
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Live Class
              </button>
            </div>
          )}
        </div>

        {/* Admission Management */}
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
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Admission Form
              </button>
              <button
                onClick={() => setActiveSection('enrolled-student')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'enrolled-student' 
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Enrolled Student
              </button>
              <button
                onClick={() => setActiveSection('payment-invoice-sheet')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'payment-invoice-sheet' 
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Payment Invoice Sheet
              </button>
            </div>
          )}
        </div>

        {/* Complaint Management */}
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
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Student Grievance
              </button>
              <button
                onClick={() => setActiveSection('campus-grievance')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'campus-grievance' 
                    ? 'bg-blue-400 text-gray-800' 
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
              ? 'bg-blue-500 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          📈 MIS
        </button>

        {/* Reports & Analytics */}
        <div>
          <button
            onClick={() => setIsReportsOpen(!isReportsOpen)}
            className="w-full text-left px-4 py-3 rounded-lg transition duration-200 text-gray-300 hover:bg-gray-700 flex justify-between items-center"
          >
            <span>📊 Reports & Analytics</span>
            <span>{isReportsOpen ? '▲' : '▼'}</span>
          </button>
          {isReportsOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button
                onClick={() => setActiveSection('performance-reports')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'performance-reports' 
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Performance Reports
              </button>
              <button
                onClick={() => setActiveSection('admission-reports')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'admission-reports' 
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Admission Reports
              </button>
              <button
                onClick={() => setActiveSection('financial-reports')}
                className={`w-full text-left px-4 py-2 rounded-lg transition duration-200 ${
                  activeSection === 'financial-reports' 
                    ? 'bg-blue-400 text-gray-800' 
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Financial Reports
              </button>
            </div>
          )}
        </div>

        {/* System Settings */}
        <button
          onClick={() => setActiveSection('system-settings')}
          className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 ${
            activeSection === 'system-settings' 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          ⚙️ System Settings
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

export default AdminSidebar;