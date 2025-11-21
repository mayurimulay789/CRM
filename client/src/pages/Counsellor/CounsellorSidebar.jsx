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
    <div className="w-80 bg-gradient-to-b from-white to-blue-50 shadow-2xl min-h-screen flex flex-col border-r border-blue-100">
      {/* Premium Header */}
      <div className="p-8 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
            <span className="font-bold text-2xl text-white">
              {user?.FullName?.charAt(0) || 'C'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{user?.FullName}</h3>
            <p className="text-blue-100 text-sm capitalize">{user?.role}</p>
            <p className="text-blue-200 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        
       
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-6 space-y-3">
        {/* Top Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setActiveSection('search')}
            className="bg-white border border-blue-200 rounded-xl p-3 text-blue-600 hover:bg-blue-50 hover:shadow-md transition-all duration-300 group"
          >
            <div className="text-lg mb-1">🔍</div>
            <div className="text-xs font-medium">Search</div>
          </button>
          <button
            onClick={() => setActiveSection('overview')}
            className="bg-white border border-blue-200 rounded-xl p-3 text-purple-600 hover:bg-purple-50 hover:shadow-md transition-all duration-300 group"
          >
            <div className="text-lg mb-1">📊</div>
            <div className="text-xs font-medium">Overview</div>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-2">
          {/* Dashboard */}
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-4 group ${
              activeSection === 'dashboard' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:shadow-md border border-blue-100'
            }`}
          >
            <div className={`text-xl ${activeSection === 'dashboard' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              🏠
            </div>
            <span className="font-semibold">Dashboard</span>
          </button>


          {/* Student Management */}
          <button
            onClick={() => setActiveSection('student-management')}
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-4 group ${
              activeSection === 'student-management' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200' 
                : 'bg-white text-gray-700 hover:bg-green-50 hover:shadow-md border border-green-100'
            }`}
          >
            <div className={`text-xl ${activeSection === 'student-management' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              
            </div>
            <span className="font-semibold">Student Management</span>
          </button>


          {/* My Works */}
          <button
            onClick={() => setActiveSection('my-works')}
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-4 group ${
              activeSection === 'my-works' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200' 
                : 'bg-white text-gray-700 hover:bg-green-50 hover:shadow-md border border-green-100'
            }`}
          >
            <div className={`text-xl ${activeSection === 'my-works' ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
              💼
            </div>
            <span className="font-semibold">My Works</span>
          </button>

          {/* Expandable Sections */}
          {[
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
                { key: 'admission-management', label: 'Admission Status', color: 'indigo' },

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
          ].map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-blue-100 overflow-hidden">
              <button
                onClick={() => section.setIsOpen(!section.isOpen)}
                className="w-full text-left px-5 py-4 transition-all duration-300 flex items-center justify-between group hover:bg-blue-50"
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
                  {section.items.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveSection(item.key)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 group ${
                        activeSection === item.key 
                          ? `bg-${item.color}-100 text-${item.color}-700 border border-${item.color}-200 shadow-sm` 
                          : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full bg-${item.color}-400`}></div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Single Action Items */}
          {[
            { key: 'mis', label: '📈 MIS', color: 'purple' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-4 group ${
                activeSection === item.key 
                  ? `bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-white shadow-lg shadow-${item.color}-200` 
                  : 'bg-white text-gray-700 hover:shadow-md border border-blue-100 hover:transform hover:-translate-y-0.5'
              }`}
            >
              <div className={`text-xl ${activeSection === item.key ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                {item.label.split(' ')[0]}
              </div>
              <span className="font-semibold">{item.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Premium Footer */}
      <div className="p-6 border-t border-blue-100 bg-white">
        
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

export default CounsellorSidebar;