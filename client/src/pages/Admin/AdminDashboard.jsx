import React from 'react';

// Import Admin Components
import AdminDashboard from '../../components/admin/Dashboard/AdminDashboard';
import CounsellorManagement from '../../components/admin/UserManagement/CounsellorManagement';
import StudentManagement from '../../components/admin/UserManagement/StudentManagement';
import BatchManagement from '../../components/admin/Batches/BatchManagement';
import DemoManagement from '../../components/admin/Demo/DemoManagement';
import AdmissionManagement from '../../components/admin/Admission/AdmissionManagement';
import MISReports from '../../components/admin/MIS/MISReports';

const AdminDashboardComponent = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      
      // User Management
      case 'counsellor-management':
        return <CounsellorManagement />;
      
      case 'student-management':
        return <StudentManagement />;
      
      // Batches
      case 'closed-batch':
      case 'running-batch':
      case 'upcoming-batch':
        return <BatchManagement activeSection={activeSection} />;
      
      // Demo
      case 'online-demo':
      case 'offline-demo':
      case 'one-to-one-demo':
      case 'live-class-demo':
        return <DemoManagement activeSection={activeSection} />;
      
      // Admission
      case 'admission-form':
      case 'enrolled-student':
      case 'payment-invoice-sheet':
        return <AdmissionManagement activeSection={activeSection} />;
      
      // Complaint
      case 'student-grievance':
      case 'campus-grievance':
        return <ComplaintManagement activeSection={activeSection} />;
      
      // MIS
      case 'mis':
        return <MISReports />;
      
      // Reports
      case 'performance-reports':
        return <PerformanceReports />;
      
      case 'admission-reports':
        return <AdmissionReports />;
      
      case 'financial-reports':
        return <FinancialReports />;
      
      // System Settings
      case 'system-settings':
        return <SystemSettings />;

      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {renderContent()}
    </div>
  );
};

export default AdminDashboardComponent;