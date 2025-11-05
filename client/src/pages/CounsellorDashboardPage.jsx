import React, { useState } from 'react';
import CounsellorSidebar from './Counsellor/CounsellorSidebar';
import CounsellorDashboard from './Counsellor/CounsellorDashboard';

const CounsellorDashboardPage = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <CounsellorSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      
      {/* Main Content */}
      <CounsellorDashboard activeSection={activeSection} />
    </div>
  );
};

export default CounsellorDashboardPage;