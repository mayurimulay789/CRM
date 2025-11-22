// import React, { useState } from 'react';
// import AdminSidebar from './Admin/AdminSidebar';
// import AdminDashboard from './Admin/AdminDashboard';

// const AdminDashboardPage = () => {
//   const [activeSection, setActiveSection] = useState('dashboard');

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <AdminSidebar 
//         activeSection={activeSection} 
//         setActiveSection={setActiveSection} 
//       />
      
//       {/* Main Content */}
//       <AdminDashboard activeSection={activeSection} />
//     </div>
//   );
// };

// export default AdminDashboardPage;

import React, { useState } from 'react';
import AdminSidebar from './Admin/AdminSidebar';
import AdminDashboard from './Admin/AdminDashboard';

const AdminDashboardPage = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <AdminSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          <AdminDashboard activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;