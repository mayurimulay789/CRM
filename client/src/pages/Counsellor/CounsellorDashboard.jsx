import React, { useState } from 'react';
import CounsellorSidebar from './CounsellorSidebar';

const CounsellorDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <CounsellorSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Counsellor Dashboard</h1>
        <p>Active Section: {activeSection}</p>
        {/* Add dashboard content based on activeSection */}
      </div>
    </div>
  );
};

export default CounsellorDashboard;
