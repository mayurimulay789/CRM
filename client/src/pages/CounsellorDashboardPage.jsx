// import React, { useState } from 'react';
// import CounsellorSidebar from './Counsellor/CounsellorSidebar';
// import CounsellorDashboard from './Counsellor/CounsellorDashboard';

// const CounsellorDashboardPage = () => {
//   const [activeSection, setActiveSection] = useState('dashboard');

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <CounsellorSidebar 
//         activeSection={activeSection} 
//         setActiveSection={setActiveSection} 
//       />
      
//       {/* Main Content */}
//       <CounsellorDashboard activeSection={activeSection} />
//     </div>
//   );
// };

// export default CounsellorDashboardPage;

import React, { useState } from 'react';
import CounsellorSidebar from './Counsellor/CounsellorSidebar';
import CounsellorDashboard from './Counsellor/CounsellorDashboard';

const CounsellorDashboardPage = () => {
  const [activeSection, setActiveSection] = useState('student-management');
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
      <CounsellorSidebar 
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
              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          <CounsellorDashboard activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
};

export default CounsellorDashboardPage;