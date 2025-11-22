import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ activeSection, setActiveSection, isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [isBatchesOpen, setIsBatchesOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  // Close sidebar when section is selected on mobile
  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen, setIsSidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

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
        { key: 'enrollment-management', label: 'Enrollments', color: 'teal' },
        { key: 'payment-management', label: 'Payments', color: 'amber' },
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

  const sidebarContent = (
    <>
      {/* Premium Admin Header */}
      <div className="p-4 lg:p-8 border-b border-indigo-100 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="flex items-center justify-between lg:block">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="font-bold text-xl lg:text-2xl text-white">
                {user?.FullName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base lg:text-lg">{user?.FullName}</h3>
              <p className="text-indigo-100 text-xs lg:text-sm capitalize">Administrator</p>
              <p className="text-indigo-200 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4 lg:p-6 space-y-3 overflow-y-auto">
        {/* Top Admin Actions - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleSectionChange('dashboard')}
            className="bg-white border border-indigo-200 rounded-xl p-3 text-indigo-600 hover:bg-indigo-50 hover:shadow-md transition-all duration-300 group"
          >
            <div className="text-lg mb-1">📊</div>
            <div className="text-xs font-medium">Analytics</div>
          </button>
          <button
            onClick={() => handleSectionChange('search')}
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
            onClick={() => handleSectionChange('dashboard')}
            className={`w-full text-left px-4 lg:px-5 py-3 lg:py-4 rounded-2xl transition-all duration-300 flex items-center space-x-3 lg:space-x-4 group ${
              activeSection === 'dashboard' 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:shadow-md border border-indigo-100'
            }`}
          >
            <div className={`text-lg lg:text-xl ${activeSection === 'dashboard' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              🏠
            </div>
            <span className="font-semibold text-sm lg:text-base">Admin Dashboard</span>
          </button>

          {/* Course Management */}
          <button
            onClick={() => handleSectionChange('course-management')}
            className={`w-full text-left px-4 lg:px-5 py-3 lg:py-4 rounded-2xl transition-all duration-300 flex items-center space-x-3 lg:space-x-4 group ${
              activeSection === 'course-management' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200' 
                : 'bg-white text-gray-700 hover:shadow-md border border-indigo-100 hover:transform hover:-translate-y-0.5'
            }`}
          >
            <div className={`text-lg lg:text-xl ${activeSection === 'course-management' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              📚
            </div>
            <span className="font-semibold text-sm lg:text-base">Course Management</span>
          </button>

          {/* User Management */}
          <div className="bg-white rounded-2xl border border-indigo-100 overflow-hidden">
            <button
              onClick={() => setIsManagementOpen(!isManagementOpen)}
              className="w-full text-left px-4 lg:px-5 py-3 lg:py-4 transition-all duration-300 flex items-center justify-between group hover:bg-indigo-50"
            >
              <div className="flex items-center space-x-3 lg:space-x-4">
                <span className="text-lg lg:text-xl">👥</span>
                <span className="font-semibold text-gray-700 text-sm lg:text-base">User Management</span>
              </div>
              <div className={`transform transition-transform duration-300 ${isManagementOpen ? 'rotate-180' : ''}`}>
                <span className="text-gray-400 text-sm">▼</span>
              </div>
            </button>
            
            {isManagementOpen && (
              <div className="px-2 lg:px-3 pb-2 lg:pb-3 space-y-1 lg:space-y-2">
                <button
                  onClick={() => handleSectionChange('counsellor-management')}
                  className={`w-full text-left px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 lg:space-x-3 group ${
                    activeSection === 'counsellor-management' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-blue-400"></div>
                  <span className="text-xs lg:text-sm font-medium">Counsellor Management</span>
                </button>
                <button
                  onClick={() => handleSectionChange('student-management')}
                  className={`w-full text-left px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 lg:space-x-3 group ${
                    activeSection === 'student-management' 
                      ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs lg:text-sm font-medium">Student Management</span>
                </button>
              </div>
            )}
          </div>
            
          {/* Batches */}
          <button
            onClick={() => handleSectionChange('batches')}
            className={`w-full text-left px-4 lg:px-5 py-3 lg:py-4 rounded-2xl transition-all duration-300 flex items-center space-x-3 lg:space-x-4 group ${
              activeSection === 'batches'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:shadow-md border border-indigo-100'
            }`}
          >
            <div className={`text-lg lg:text-xl ${activeSection === 'batches' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              📚
            </div>
            <span className="font-semibold text-sm lg:text-base">Batches</span>
          </button>

          {/* Expandable Sections */}
          {expandableSections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-indigo-100 overflow-hidden">
              <button
                onClick={() => section.setIsOpen(!section.isOpen)}
                className="w-full text-left px-4 lg:px-5 py-3 lg:py-4 transition-all duration-300 flex items-center justify-between group hover:bg-indigo-50"
              >
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <span className="text-lg lg:text-xl">{section.title.split(' ')[0]}</span>
                  <span className="font-semibold text-gray-700 text-sm lg:text-base">
                    {section.title.split(' ').slice(1).join(' ')}
                  </span>
                </div>
                <div className={`transform transition-transform duration-300 ${section.isOpen ? 'rotate-180' : ''}`}>
                  <span className="text-gray-400 text-sm">▼</span>
                </div>
              </button>
              
              {section.isOpen && (
                <div className="px-2 lg:px-3 pb-2 lg:pb-3 space-y-1 lg:space-y-2">
                  {section.items.map((item) => {
                    const colorClass = colorClasses[item.color];
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleSectionChange(item.key)}
                        className={`w-full text-left px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 lg:space-x-3 group ${
                          activeSection === item.key 
                            ? `${colorClass.bg} ${colorClass.text} ${colorClass.border} shadow-sm` 
                            : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${colorClass.dot}`}></div>
                        <span className="text-xs lg:text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Trainer */}
          <button
            onClick={() => handleSectionChange('trainer-management')}
            className={`w-full text-left px-4 lg:px-5 py-3 lg:py-4 rounded-2xl transition-all duration-300 flex items-center space-x-3 lg:space-x-4 group ${
              activeSection === 'trainer-management'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200'
                : 'bg-white text-gray-700 hover:bg-green-50 hover:shadow-md border border-indigo-100'
            }`}
          >
            <div className={`text-lg lg:text-xl ${activeSection === 'trainer-management' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              👨‍🏫
            </div>
            <span className="font-semibold text-sm lg:text-base">Trainer</span>
          </button>

          {/* MIS Reports */}
          <button
            onClick={() => handleSectionChange('mis')}
            className={`w-full text-left px-4 lg:px-5 py-3 lg:py-4 rounded-2xl transition-all duration-300 flex items-center space-x-3 lg:space-x-4 group ${
              activeSection === 'mis' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200' 
                : 'bg-white text-gray-700 hover:shadow-md border border-indigo-100 hover:transform hover:-translate-y-0.5'
            }`}
          >
            <div className={`text-lg lg:text-xl ${activeSection === 'mis' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              📈
            </div>
            <span className="font-semibold text-sm lg:text-base">MIS Reports</span>
          </button>

          {/* Reports & Analytics */}
          <div className="bg-white rounded-2xl border border-indigo-100 overflow-hidden">
            <button
              onClick={() => setIsReportsOpen(!isReportsOpen)}
              className="w-full text-left px-4 lg:px-5 py-3 lg:py-4 transition-all duration-300 flex items-center justify-between group hover:bg-indigo-50"
            >
              <div className="flex items-center space-x-3 lg:space-x-4">
                <span className="text-lg lg:text-xl">📊</span>
                <span className="font-semibold text-gray-700 text-sm lg:text-base">Reports & Analytics</span>
              </div>
              <div className={`transform transition-transform duration-300 ${isReportsOpen ? 'rotate-180' : ''}`}>
                <span className="text-gray-400 text-sm">▼</span>
              </div>
            </button>
            
            {isReportsOpen && (
              <div className="px-2 lg:px-3 pb-2 lg:pb-3 space-y-1 lg:space-y-2">
                <button
                  onClick={() => handleSectionChange('performance-reports')}
                  className={`w-full text-left px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 lg:space-x-3 group ${
                    activeSection === 'performance-reports' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-blue-400"></div>
                  <span className="text-xs lg:text-sm font-medium">Performance Reports</span>
                </button>
                <button
                  onClick={() => handleSectionChange('admission-reports')}
                  className={`w-full text-left px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 lg:space-x-3 group ${
                    activeSection === 'admission-reports' 
                      ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs lg:text-sm font-medium">Admission Reports</span>
                </button>
                <button
                  onClick={() => handleSectionChange('financial-reports')}
                  className={`w-full text-left px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 lg:space-x-3 group ${
                    activeSection === 'financial-reports' 
                      ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-amber-400"></div>
                  <span className="text-xs lg:text-sm font-medium">Financial Reports</span>
                </button>
              </div>
            )}
          </div>

          {/* System Settings */}
          <button
            onClick={() => handleSectionChange('system-settings')}
            className={`w-full text-left px-4 lg:px-5 py-3 lg:py-4 rounded-2xl transition-all duration-300 flex items-center space-x-3 lg:space-x-4 group ${
              activeSection === 'system-settings' 
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-200' 
                : 'bg-white text-gray-700 hover:shadow-md border border-indigo-100 hover:transform hover:-translate-y-0.5'
            }`}
          >
            <div className={`text-lg lg:text-xl ${activeSection === 'system-settings' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              ⚙️
            </div>
            <span className="font-semibold text-sm lg:text-base">System Settings</span>
          </button>
        </nav>
      </div>

      {/* Premium Footer */}
      <div className="p-4 lg:p-6 border-t border-indigo-100 bg-white">
        {/* Quick Actions - Mobile Only */}
        <div className="lg:hidden grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => handleSectionChange('dashboard')}
            className="bg-white border border-indigo-200 rounded-xl p-2 text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
          >
            <div className="text-base mb-1">📊</div>
            <div className="text-xs font-medium">Analytics</div>
          </button>
          <button
            onClick={() => handleSectionChange('search')}
            className="bg-white border border-purple-200 rounded-xl p-2 text-purple-600 hover:bg-purple-50 transition-all duration-300"
          >
            <div className="text-base mb-1">🔍</div>
            <div className="text-xs font-medium">Search</div>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white border border-red-200 text-red-600 px-4 py-3 rounded-2xl font-semibold hover:bg-red-50 hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2 group text-sm lg:text-base"
        >
          <span className="group-hover:scale-110 transition-transform">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 bg-gradient-to-b from-white to-indigo-50 shadow-2xl min-h-screen flex-col border-r border-indigo-100">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <div className={`
        lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-white to-indigo-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-r border-indigo-100
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebarContent}
      </div>
    </>
  );
};

export default AdminSidebar;