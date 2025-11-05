import React from 'react';

// Import Counsellor Components
import Search from '../../components/counsellor/Search/Search';
import Overview from '../../components/counsellor/Overview/Overview';
import Dashboard from '../../components/counsellor/Dashboard/Dashboard';
import MyWorks from '../../components/counsellor/MyWorks/MyWorks';
import ClosedBatch from '../../components/counsellor/Batches/ClosedBatch';
import RunningBatch from '../../components/counsellor/Batches/RunningBatch';
import UpcomingBatch from '../../components/counsellor/Batches/UpcomingBatch';
import OnlineDemo from '../../components/counsellor/Demo/OnlineDemo';
import OfflineDemo from '../../components/counsellor/Demo/OfflineDemo';
import OneToOneDemo from '../../components/counsellor/Demo/OneToOneDemo';
import LiveClassDemo from '../../components/counsellor/Demo/LiveClassDemo';
import AdmissionForm from '../../components/counsellor/Admission/AdmissionForm';
import EnrolledStudent from '../../components/counsellor/Admission/EnrolledStudent';
import PaymentInvoiceSheet from '../../components/counsellor/Admission/PaymentInvoiceSheet';
import StudentGrievance from '../../components/counsellor/Complaint/StudentGrievance';
import CampusGrievance from '../../components/counsellor/Complaint/CampusGrievance';
import MISDashboard from '../../components/counsellor/MIS/MISDashboard';
import ApplyLeave from '../../components/counsellor/Leave/ApplyLeave';
import LeaveList from '../../components/counsellor/Leave/LeaveList';
import HolidayList from '../../components/counsellor/Leave/HolidayList';
import Attendance from '../../components/counsellor/Attendance/Attendance';
import MyLetter from '../../components/counsellor/MyLetter/MyLetter';

const CounsellorDashboard = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'search':
        return <Search />;
      
      case 'overview':
        return <Overview />;
      
      case 'dashboard':
        return <Dashboard />;
      
      case 'my-works':
        return <MyWorks />;
      
      // Batches
      case 'closed-batch':
        return <ClosedBatch />;
      
      case 'running-batch':
        return <RunningBatch />;
      
      case 'upcoming-batch':
        return <UpcomingBatch />;
      
      // Demo
      case 'online-demo':
        return <OnlineDemo />;
      
      case 'offline-demo':
        return <OfflineDemo />;
      
      case 'one-to-one-demo':
        return <OneToOneDemo />;
      
      case 'live-class-demo':
        return <LiveClassDemo />;
      
      // Admission
      case 'admission-form':
        return <AdmissionForm />;
      
      case 'enrolled-student':
        return <EnrolledStudent />;
      
      case 'payment-invoice-sheet':
        return <PaymentInvoiceSheet />;
      
      // Complaint
      case 'student-grievance':
        return <StudentGrievance />;
      
      case 'campus-grievance':
        return <CampusGrievance />;
      
      // MIS
      case 'mis':
        return <MISDashboard />;
      
      // Leave Management
      case 'apply-leave':
        return <ApplyLeave />;
      
      case 'leave-list':
        return <LeaveList />;
      
      case 'holiday-list':
        return <HolidayList />;
      
      // Attendance
      case 'attendance':
        return <Attendance />;
      
      // My Letter
      case 'my-letter':
        return <MyLetter />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {renderContent()}
    </div>
  );
};

export default CounsellorDashboard;