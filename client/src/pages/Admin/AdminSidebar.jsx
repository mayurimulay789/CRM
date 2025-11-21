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

  // Color mapping for consistent styling
  const colorClasses = {
    gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' },
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-400' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-400' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', dot: 'bg-pink-400' },
    red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-400' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-400' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-400' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-400' }
  };

  const expandableSections = [
    {
      title: "📚 Batches",
      isOpen: isBatchesOpen,
      setIsOpen: setIsBatchesOpen,
      items: [
        { key: 'closed-batch', label: 'Closed Batch', color: 'gray' },
        { key: 'running-batch', label: 'Running Batch', color: 'green' },
        { key: 'upcoming-batch', label: 'Upcoming Batch', color: 'blue' }
      ]
    },
    {
      title: "🎯 Demo",
      isOpen: isDemoOpen,
      setIsOpen: setIsDemoOpen,
      items: [
        { key: 'online-demo', label: 'Online', color: 'purple' },
        { key: 'offline-demo', label: 'Offline', color: 'orange' },
        { key: 'one-to-one-demo', label: '1-2-1', color: 'pink' },
        { key: 'live-class-demo', label: 'Live Class', color: 'red' }
      ]
    },
    {
      title: "🎓 Admission",
      isOpen: isAdmissionOpen,
      setIsOpen: setIsAdmissionOpen,
      items: [
        { key: 'admission-form', label: 'Admission Form', color: 'indigo' },
        { key: 'enrolled-student', label: 'Enrolled Student', color: 'teal' },
        { key: 'payment-invoice-sheet', label: 'Payment Invoice', color: 'amber' }
      ]
    },
    {
      title: "📋 Complaint",
      isOpen: isComplaintOpen,
      setIsOpen: setIsComplaintOpen,
      items: [
        { key: 'student-grievance', label: 'Student Grievance', color: 'rose' },
        { key: 'campus-grievance', label: 'Campus Grievance', color: 'cyan' }
      ]
    }
  ];

  return (
    <div className="w-80 bg-gradient-to-b from-white to-indigo-50 shadow-2xl min-h-screen flex flex-col border-r border-indigo-100">
      {/* Premium Admin Header */}
      <div className="p-8 border-b border-indigo-100 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
            <span className="font-bold text-2xl text-white">
              {user?.FullName?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{user?.FullName}</h3>
            <p className="text-indigo-100 text-sm capitalize">Administrator</p>
            <p className="text-indigo-200 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-6 space-y-3">
        {/* Top Admin Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setActiveSection('dashboard')}
            className="bg-white border border-indigo-200 rounded-xl p-3 text-indigo-600 hover:bg-indigo-50 hover:shadow-md transition-all duration-300 group"
          >
            <div className="text-lg mb-1">📊</div>
            <div className="text-xs font-medium">Analytics</div>
          </button>
          <button
            onClick={() => setActiveSection('search')}
            className="bg-white border border-purple-200 rounded-xl p-3 text-purple-600 hover:bg-purple-50 hover:shadow-md transition-all duration-300 group"
          >
            <div className="text-lg mb-1">🔍</div>
            <div className="text-xs font-medium">Search</div>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-2">
          {/* Admin Dashboard */}
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-4 group ${
              activeSection === 'dashboard' 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:shadow-md border border-indigo-100'
            }`}
          >
            <div className={`text-xl ${activeSection === 'dashboard' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              🏠
            </div>
            <span className="font-semibold">Admin Dashboard</span>
          </button>

          {/* Course Management */}
          <button
            onClick={() => setActiveSection('course-management')}
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-4 group ${
              activeSection === 'course-management' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200' 
                : 'bg-white text-gray-700 hover:shadow-md border border-indigo-100 hover:transform hover:-translate-y-0.5'
            }`}
          >
            <div className={`text-xl ${activeSection === 'course-management' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              📚
            </div>
            <span className="font-semibold">Course Management</span>
          </button>

          {/* User Management */}
          <div className="bg-white rounded-2xl border border-indigo-100 overflow-hidden">
            <button
              onClick={() => setIsManagementOpen(!isManagementOpen)}
              className="w-full text-left px-5 py-4 transition-all duration-300 flex items-center justify-between group hover:bg-indigo-50"
            >
              <div className="flex items-center space-x-4">
                <span className="text-xl">👥</span>
                <span className="font-semibold text-gray-700">User Management</span>
              </div>
              <div className={`transform transition-transform duration-300 ${isManagementOpen ? 'rotate-180' : ''}`}>
                <span className="text-gray-400">▼</span>
              </div>
            </button>
            
            {isManagementOpen && (
              <div className="px-3 pb-3 space-y-2">
                <button
                  onClick={() => setActiveSection('counsellor-management')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 group ${
                    activeSection === 'counsellor-management' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-sm font-medium">Counsellor Management</span>
                </button>
                <button
                  onClick={() => setActiveSection('student-management')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 group ${
                    activeSection === 'student-management' 
                      ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-sm font-medium">Student Management</span>
                </button>
              </div>
            )}
          </div>

          {/* Batches */}
          <button
            onClick={() => setActiveSection('batches')}
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-4 group ${
              activeSection === 'batches'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:shadow-md border border-indigo-100'
            }`}
          >
            <div className={`text-xl ${activeSection === 'batches' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              📚
            </div>
            <span className="font-semibold">Batches</span>
          </button>

          {/* Expandable Sections */}
          {expandableSections.slice(1).map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-indigo-100 overflow-hidden">
              <button
                onClick={() => section.setIsOpen(!section.isOpen)}
                className="w-full text-left px-5 py-4 transition-all duration-300 flex items-center justify-between group hover:bg-indigo-50"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-xl">{section.title.split(' ')[0]}</span>
                  <span className="font-semibold text-gray-700">{section.title.split(' ').slice(1).join(' ')}</span>
                </div>
                <div className={`transform transition-transform duration-300 ${section.isOpen ? 'rotate-180' : ''}`}>
                  <span className="text-gray-400">▼</span>
                </div>
              </button>

              {section.isOpen && (
                <div className="px-3 pb-3 space-y-2">
                  {section.items.map((item) => {
                    const colorClass = colorClasses[item.color];
                    return (
                      <button
                        key={item.key}
                        onClick={() => setActiveSection(item.key)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 group ${
                          activeSection === item.key
                            ? `${colorClass.bg} ${colorClass.text} ${colorClass.border} shadow-sm`
                            : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${colorClass.dot}`}></div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Trainer */}
          <button
            onClick={() => setActiveSection('trainer-management')}
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-4 group ${
              activeSection === 'trainer-management'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200'
                : 'bg-white text-gray-700 hover:bg-green-50 hover:shadow-md border border-indigo-100'
            }`}
          >
            <div className={`text-xl ${activeSection === 'trainer-management' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              👨‍🏫
            </div>
            <span className="font-semibold">Trainer</span>
          </button>

          {/* MIS Reports */}
          <button
            onClick={() => setActiveSection('mis')}
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-4 group ${
              activeSection === 'mis' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200' 
                : 'bg-white text-gray-700 hover:shadow-md border border-indigo-100 hover:transform hover:-translate-y-0.5'
            }`}
          >
            <div className={`text-xl ${activeSection === 'mis' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              📈
            </div>
            <span className="font-semibold">MIS Reports</span>
          </button>

          {/* Reports & Analytics */}
          <div className="bg-white rounded-2xl border border-indigo-100 overflow-hidden">
            <button
              onClick={() => setIsReportsOpen(!isReportsOpen)}
              className="w-full text-left px-5 py-4 transition-all duration-300 flex items-center justify-between group hover:bg-indigo-50"
            >
              <div className="flex items-center space-x-4">
                <span className="text-xl">📊</span>
                <span className="font-semibold text-gray-700">Reports & Analytics</span>
              </div>
              <div className={`transform transition-transform duration-300 ${isReportsOpen ? 'rotate-180' : ''}`}>
                <span className="text-gray-400">▼</span>
              </div>
            </button>
            
            {isReportsOpen && (
              <div className="px-3 pb-3 space-y-2">
                <button
                  onClick={() => setActiveSection('performance-reports')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 group ${
                    activeSection === 'performance-reports' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-sm font-medium">Performance Reports</span>
                </button>
                <button
                  onClick={() => setActiveSection('admission-reports')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 group ${
                    activeSection === 'admission-reports' 
                      ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-sm font-medium">Admission Reports</span>
                </button>
                <button
                  onClick={() => setActiveSection('financial-reports')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 group ${
                    activeSection === 'financial-reports'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-sm font-medium">Financial Reports</span>
                </button>
                <button
                  onClick={() => setActiveSection('batch-reports')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 group ${
                    activeSection === 'batch-reports'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-sm font-medium">Batch Reports</span>
                </button>
              </div>
            )}
          </div>

          {/* System Settings */}
          <button
            onClick={() => setActiveSection('system-settings')}
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-4 group ${
              activeSection === 'system-settings' 
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-200' 
                : 'bg-white text-gray-700 hover:shadow-md border border-indigo-100 hover:transform hover:-translate-y-0.5'
            }`}
          >
            <div className={`text-xl ${activeSection === 'system-settings' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              ⚙️
            </div>
            <span className="font-semibold">System Settings</span>
          </button>
        </nav>
      </div>

      {/* Premium Footer */}
      <div className="p-6 border-t border-indigo-100 bg-white">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 bg-white border border-red-200 text-red-600 px-4 py-3 rounded-2xl font-semibold hover:bg-red-50 hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2 group"
        >
          <span className="group-hover:scale-110 transition-transform">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
