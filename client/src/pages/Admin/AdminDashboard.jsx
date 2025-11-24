import React from 'react';

// Import Admin Components
import AdminDashboard from '../../components/admin/Dashboard/AdminDashboard.jsx';
import CounsellorManagement from '../../components/admin/UserManagement/CounsellorManagement.jsx';
import StudentManagement from '../../components/admin/UserManagement/StudentManagement.jsx';

import BatchManagement from '../../components/admin/Batches/BatchManagement.jsx';
import TrainerManagement from '../../components/admin/Trainers/TrainerManagement.jsx';

import DemoManagement from '../../components/admin/Demo/DemoManagement.jsx';
import AdmissionManagement from '../../components/admin/Admission/AdmissionManagement.jsx';

import ComplaintManagement from '../../components/admin/Complaint/StudentComplaint.jsx';
import CampusGrievanceAdmin from '../../components/admin/Complaint/CampusGrievanceAdmin.jsx';

import CourseManagement from '../../components/admin/Courses/CourseManagement.jsx';

import MISReports from '../../components/admin/MIS/MISReports.jsx';

// NEW: Import Enrollment and Payment Components
import EnrollmentManagement from '../../components/admin/Enrollment/EnrollmentManagement.jsx';
import PaymentManagement from '../../components/admin/Payment/PaymentManagement.jsx';   

// FIXED: Correct import path for AdmissionReports
import PerformanceReports from '../../components/admin/Reports & Analytics/BatchReports.jsx';
import AdmissionReports from '../../components/admin/Reports & Analytics/AdmissionReport.jsx'; // Fixed path
import FinancialReports from '../../components/admin/Reports & Analytics/DemoReport.jsx';
// import SystemSettings from '../../components/admin/SystemSettings/SystemSettings.jsx';

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
      case 'batches':
        return <BatchManagement />;

      // Trainer
      case 'trainer-management':
        return <TrainerManagement />;

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
      
      // NEW: Enrollment Management
      case 'enrollment-management':
        return <EnrollmentManagement />;
      
      // NEW: Payment Management
      case 'payment-management':
        return <PaymentManagement />;
      
      // Complaint
      case 'student-grievance':
        return <ComplaintManagement />;

      case 'campus-grievance':
        return <CampusGrievanceAdmin />;

      // Course Management
      case 'course-management':
        return <CourseManagement />;

      // MIS
      case 'mis':
        return <MISReports />;
      
      // Reports - FIXED: Using correct component names
      case 'performance-reports':
        return <PerformanceReports />;
      
      case 'admission-reports':
        return <AdmissionReports />; // This should now work
      
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
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardComponent;