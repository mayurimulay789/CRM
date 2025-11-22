// import React from 'react';

// // Import Counsellor Components
// import Search from '../../components/counsellor/Search/Search';
// import Dashboard from '../../components/counsellor/Dashboard/Dashboard';
// import StudentManagement from '../../components/counsellor/Student/StudentManagement';
// import ClosedBatch from '../../components/counsellor/Batches/ClosedBatch';
// import RunningBatch from '../../components/counsellor/Batches/RunningBatch';
// import UpcomingBatch from '../../components/counsellor/Batches/UpcomingBatch';
// import OnlineDemo from '../../components/counsellor/Demo/OnlineDemo';
// import OfflineDemo from '../../components/counsellor/Demo/OfflineDemo';
// import OneToOneDemo from '../../components/counsellor/Demo/OneToOneDemo';
// import LiveClassDemo from '../../components/counsellor/Demo/LiveClassDemo';
// import AdmissionForm from '../../components/counsellor/Admission/AdmissionForm';
// import AdmissionsManagement from '../../components/counsellor/Admission/AdmissionsManagement';
// import EnrolledStudent from '../../components/counsellor/Admission/EnrolledStudent';
// import PaymentInvoiceSheet from '../../components/counsellor/Admission/PaymentInvoiceSheet';
// import StudentGrievance from '../../components/counsellor/Complaint/StudentGrievance';
// import CampusGrievance from '../../components/counsellor/Complaint/CampusGrievance';
// import MISDashboard from '../../components/counsellor/MIS/MISDashboard';

// const CounsellorDashboard = ({ activeSection }) => {
//   const renderContent = () => {
//     switch (activeSection) {
//       case 'search':
//         return <Search />;

      
//       case 'dashboard':
//         return <Dashboard />;

//       case 'student-management':
//         return <StudentManagement />;
      
//       case 'my-works':
//         return <MyWorks />;
      
//       // Batches
//       case 'closed-batch':
//         return <ClosedBatch />;
      
//       case 'running-batch':
//         return <RunningBatch />;
      
//       case 'upcoming-batch':
//         return <UpcomingBatch />;
      
//       // Demo
//       case 'online-demo':
//         return <OnlineDemo />;
      
//       case 'offline-demo':
//         return <OfflineDemo />;
      
//       case 'one-to-one-demo':
//         return <OneToOneDemo />;
      
//       case 'live-class-demo':
//         return <LiveClassDemo />;
      
//       // Admission
//       case 'admission-management':
//         return <AdmissionsManagement />;
      
//       case 'enrolled-student':
//         return <EnrolledStudent />;
      
//       case 'payment-invoice-sheet':
//         return <PaymentInvoiceSheet />;
      
//       // Complaint
//       case 'student-grievance':
//         return <StudentGrievance />;
      
//       case 'campus-grievance':
//         return <CampusGrievance />;
      
//       // MIS
//       case 'mis':
//         return <MISDashboard />;

//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
//       {renderContent()}
//     </div>
//   );
// };

// export default CounsellorDashboard;

import React from 'react';

// Import Counsellor Components
import Search from '../../components/counsellor/Search/Search';
import Dashboard from '../../components/counsellor/Dashboard/Dashboard';
import StudentManagement from '../../components/counsellor/Student/StudentManagement';
import ClosedBatch from '../../components/counsellor/Batches/ClosedBatch';
import RunningBatch from '../../components/counsellor/Batches/RunningBatch';
import UpcomingBatch from '../../components/counsellor/Batches/UpcomingBatch';
import OnlineDemo from '../../components/counsellor/Demo/OnlineDemo';
import OfflineDemo from '../../components/counsellor/Demo/OfflineDemo';
import OneToOneDemo from '../../components/counsellor/Demo/OneToOneDemo';
import LiveClassDemo from '../../components/counsellor/Demo/LiveClassDemo';
import AdmissionForm from '../../components/counsellor/Admission/AdmissionForm';
import AdmissionsManagement from '../../components/counsellor/Admission/AdmissionsManagement';
import EnrolledStudent from '../../components/counsellor/Admission/EnrolledStudent';
import PaymentInvoiceSheet from '../../components/counsellor/Admission/PaymentInvoiceSheet';
import StudentGrievance from '../../components/counsellor/Complaint/StudentGrievance';
import CampusGrievance from '../../components/counsellor/Complaint/CampusGrievance';
import MISDashboard from '../../components/counsellor/MIS/MISDashboard';

// NEW: Import Enrollment and Payment Components
import EnrollmentManagement from '../../components/counsellor/Enrollment/EnrollmentManagement';
import PaymentManagement from '../../components/counsellor/Payment/PaymentManagement';

const CounsellorDashboard = ({ activeSection }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'search':
        return <Search />;
      

      
      case 'dashboard':
        return <Dashboard />;

      case 'student-management':
        return <StudentManagement />;
      
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
      case 'admission-management':
        return <AdmissionsManagement />;
      
      // NEW: Enrollment Management
      case 'enrollment-management':
        return <EnrollmentManagement />;
      
      // NEW: Payment Management
      case 'payment-management':
        return <PaymentManagement />;
      
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

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default CounsellorDashboard;