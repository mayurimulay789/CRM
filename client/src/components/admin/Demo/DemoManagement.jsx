import React from 'react';
import OnlineDemo from '../../counsellor/Demo/OnlineDemo';
import OfflineDemo from '../../counsellor/Demo/OfflineDemo';
import OneToOneDemo from '../../counsellor/Demo/OneToOneDemo';
import LiveClassDemo from '../../counsellor/Demo/LiveClassDemo';

const DemoManagement = ({ activeSection }) => {
  const renderDemoContent = () => {
    switch (activeSection) {
      case 'online-demo':
        return <OnlineDemo />;
      case 'offline-demo':
        return <OfflineDemo />;
      case 'one-to-one-demo':
        return <OneToOneDemo />;
      case 'live-class-demo':
        return <LiveClassDemo />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Demo Management</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p>Select a demo type from the sidebar.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {renderDemoContent()}
    </div>
  );
};

export default DemoManagement;
