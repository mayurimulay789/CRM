// import React, { useMemo, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchAdmissions } from '../../../store/slices/admissionSlice';
// import { getBatches } from '../../../store/slices/batchSlice';
// import { fetchCourses } from '../../../store/slices/courseSlice';
// import { fetchAllDemoReports } from '../../../store/slices/demoReportSlice';
// import { fetchLiveClasses } from '../../../store/slices/liveClassesSlice';
// import {
//   Users,
//   TrendingUp,
//   Award,
//   BookOpen,
//   Play,
//   Clock,
//   Mail,
//   BarChart3,
//   Calendar,
//   Zap,
// } from 'lucide-react';
// import {
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';

// // --- COLOR & STYLE CONSTANTS (Derived from your reports) ---
// const COLORS = {
//   // Admissions (AdmissionReport.jsx)
//   admission_total: '#0d9488', // Teal
//   admission_approved: '#10b981', // Green
//   admission_pending: '#f59e0b', // Amber
//   admission_rejected: '#ef4444', // Red

//   // Batches (BatchReports.jsx)
//   batch_running: '#3b82f6', // Blue
//   batch_upcoming: '#8b5cf6', // Purple
//   batch_closed: '#9ca3af', // Gray

//   // Demos & Courses (DemoReport.jsx & CourseReport.jsx)
//   demo_conversion: '#f59e0b', // Amber
//   demo_students: '#3b82f6', // Blue
//   course_enrollment: '#0d9488', // Teal
//   course_batches: '#f59e0b', // Amber
// };

// // --- HELPER FUNCTIONS FOR DATA CALCULATION (Simplified Logic from source files) ---

// const useCombinedData = (admissions, batches, courses, demos) => {
//   const summary = useMemo(() => {
//     // --- ADMISSIONS SUMMARY (from AdmissionReport.jsx) ---
//     const totalAdmissions = admissions.length;
//     const approved = admissions.filter(a => a.status === 'approved' || a.status === 'Approved').length;
//     const pending = admissions.filter(a => a.status === 'pending' || a.status === 'Pending').length;
//     const rejected = admissions.filter(a => a.status === 'rejected' || a.status === 'Rejected').length;
//     const admissionConversionRate = totalAdmissions > 0 ? (approved / totalAdmissions) * 100 : 0;

//     // --- BATCHES SUMMARY (from BatchReports.jsx) ---
//     const totalBatches = batches.length;
//     const runningBatches = batches.filter(b => b.status === 'Running').length;
//     const upcomingBatches = batches.filter(b => b.status === 'Upcoming').length;
    
//     // --- COURSES SUMMARY (from CourseReport.jsx) ---
//     const totalCourses = courses.length;
//     const totalStudentsEnrolled = courses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
    
//     // --- DEMOS SUMMARY (from DemoReport.jsx) ---
//     const totalDemos = demos.length;
//     const totalDemoConversions = demos.reduce((sum, demo) => {
//       const conversions = Array.isArray(demo.convertedStudents) ? demo.convertedStudents.length : demo.converted ? 1 : 0;
//       return sum + conversions;
//     }, 0);
//     const totalDemoAttendees = demos.reduce((sum, demo) => {
//       const students = Array.isArray(demo.registeredStudents) ? demo.registeredStudents.length : demo.students?.length || demo.attendees?.length || 0;
//       return sum + students;
//     }, 0);
//     const demoConversionRate = totalDemoAttendees > 0 ? (totalDemoConversions / totalDemoAttendees) * 100 : 0;

//     // --- BATCH STATUS PIE DATA (from BatchReports.jsx) ---
//     const batchStatusData = [
//       { name: 'Running', value: runningBatches, color: COLORS.batch_running },
//       { name: 'Upcoming', value: upcomingBatches, color: COLORS.batch_upcoming },
//       { name: 'Closed', value: batches.filter(b => b.status === 'Closed').length, color: COLORS.batch_closed },
//     ].filter(d => d.value > 0);

//     return {
//       totalAdmissions, approved, pending, rejected, admissionConversionRate,
//       totalBatches, runningBatches, upcomingBatches,
//       totalCourses, totalStudentsEnrolled,
//       totalDemos, totalDemoConversions, demoConversionRate, totalDemoAttendees,
//       batchStatusData,
//     };
//   }, [admissions, batches, courses, demos]);

//   // Combined Monthly Trend Data (Simplified to Monthly)
//   const trendData = useMemo(() => {
//     // This is a highly simplified version of the logic from AdmissionReport, BatchReports, and DemoReport
//     const now = new Date();
//     const data = [];

//     for (let i = 11; i >= 0; i--) {
//         const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
//         const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
//         const period = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

//         // Admission Data (AdmissionReport.jsx)
//         const monthAdmissions = admissions.filter(a => {
//           const date = new Date(a.admissionDate || a.createdAt);
//           return date >= monthStart && date <= monthEnd;
//         });
//         const totalAdmissions = monthAdmissions.length;

//         // Demo Data (DemoReport.jsx)
//         const monthDemos = demos.filter(d => {
//           const date = new Date(d.createdAt || d.scheduledAt);
//           return date >= monthStart && date <= monthEnd;
//         });
//         const totalDemos = monthDemos.length;

//         // Course/Enrollment Data (CourseReport.jsx)
//         const monthCourses = courses.filter(c => {
//             const date = new Date(c.createdAt);
//             return date >= monthStart && date <= monthEnd;
//         });
//         const totalNewCourses = monthCourses.length;
//         const totalNewEnrollments = monthCourses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
        
//         data.push({
//             period,
//             admissions: totalAdmissions,
//             demos: totalDemos,
//             newCourses: totalNewCourses,
//             newEnrollments: totalNewEnrollments,
//         });
//     }
//     return data;
//   }, [admissions, demos, courses]);

//   return { summary, trendData };
// };

// // --- KPI CARD COMPONENT ---
// const KPICard = ({ title, value, icon: Icon, colorClass, bgClass, description }) => (
//   <div className={`p-5 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 transform hover:shadow-xl ${bgClass}`}>
//     <div className="flex justify-between items-start">
//       <div>
//         <p className="text-sm font-medium text-gray-500">{title}</p>
//         <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
//       </div>
//       <div className={`p-3 rounded-full ${bgClass.replace('bg-', 'bg-')}/70`}>
//         <Icon className={`w-6 h-6 ${colorClass}`} />
//       </div>
//     </div>
//     <p className="text-xs text-gray-400 mt-2 truncate">{description}</p>
//   </div>
// );

// // --- MAIN DASHBOARD COMPONENT ---
// const AdminDashboardOverview = () => {
//   const dispatch = useDispatch(); // Needed for initial data fetch (as seen in source files)
//   const admissionState = useSelector((state) => state.admissions || { admissions: [] });
//   const batchState = useSelector((state) => state.batch || { batches: [] });
//   const courseState = useSelector((state) => state.courses || { courses: [] });
//   const demoReportState = useSelector((state) => state.demoReports || { demos: [] });

//   const { admissions } = admissionState;
//   const { batches } = batchState;
//   const { courses } = courseState;
//   const { demos } = demoReportState;

//   useEffect(() => {
//     // Dispatch initial data fetches so dashboard shows up-to-date information
//     dispatch(fetchAdmissions());
//     dispatch(getBatches());
//     dispatch(fetchCourses());
//     dispatch(fetchAllDemoReports());
//     dispatch(fetchLiveClasses());
//   }, [dispatch]);

//   // Derive all data
//   const { summary, trendData } = useCombinedData(admissions, batches, courses, demos);
  
//   // Custom Tooltip for Recharts (as seen in DemoReport.jsx)
//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 text-sm">
//           <p className="font-semibold mb-1 text-gray-700">{label}</p>
//           {payload.map((p, index) => (
//             <p key={index} style={{ color: p.color }}>
//               {p.name}: <span className='font-bold'>{p.value}</span>
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   // The original reports contained dispatch calls to fetch data. 
//   // For the dashboard to work, ensure these are called on mount of the dashboard page.
//   /* useEffect(() => {
//     // Example: dispatch(fetchAdmissions());
//     // This is already handled by the original report components in a full app, 
//     // but include initial fetches here if this is the only entry point.
//   }, [dispatch]);
//   */

//   return (
//     <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
//         <BarChart3 className="w-8 h-8 text-teal-600" />
//         Admin Dashboard Overview
//       </h1>
//       <p className="text-gray-500 mb-8">
//         Consolidated analytical view of Admissions, Batches, Courses, and Demo Reports.
//       </p>

//       {/* --- 1. KPI CARDS SECTION --- */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        
//         {/* Admission Metrics (from AdmissionReport.jsx) */}
//         <KPICard
//           title="Total Admissions"
//           value={summary.totalAdmissions.toLocaleString()}
//           icon={Users}
//           colorClass="text-teal-600"
//           bgClass="bg-white"
//           description={`Approved: ${summary.approved} | Pending: ${summary.pending}`}
//         />
//         <KPICard
//           title="Conversion Rate"
//           value={`${summary.admissionConversionRate.toFixed(1)}%`}
//           icon={TrendingUp}
//           colorClass="text-green-500"
//           bgClass="bg-white"
//           description="Approved / Total Admissions"
//         />

//         {/* Batch & Course Metrics (from BatchReports.jsx & CourseReport.jsx) */}
//         <KPICard
//           title="Total Courses"
//           value={summary.totalCourses.toLocaleString()}
//           icon={BookOpen}
//           colorClass="text-blue-500"
//           bgClass="bg-white"
//           description="Unique courses offered"
//         />
//         <KPICard
//           title="Total Batches"
//           value={summary.totalBatches.toLocaleString()}
//           icon={Play}
//           colorClass="text-purple-500"
//           bgClass="bg-white"
//           description={`Running: ${summary.runningBatches} | Upcoming: ${summary.upcomingBatches}`}
//         />

//         {/* Demo Metrics (from DemoReport.jsx) */}
//         <KPICard
//           title="Total Demos"
//           value={summary.totalDemos.toLocaleString()}
//           icon={Calendar}
//           colorClass="text-amber-500"
//           bgClass="bg-white"
//           description="Sessions scheduled"
//         />
//         <KPICard
//           title="Demo Conversions"
//           value={summary.totalDemoConversions.toLocaleString()}
//           icon={Award}
//           colorClass="text-red-500"
//           bgClass="bg-white"
//           description="Leads converted to students"
//         />
//         <KPICard
//           title="Demo Success Rate"
//           value={`${summary.demoConversionRate.toFixed(1)}%`}
//           icon={Zap}
//           colorClass="text-green-500"
//           bgClass="bg-white"
//           description="Conversions / Total Attendees"
//         />

//         {/* Student/Enrollment Metric (from CourseReport.jsx) */}
//         <KPICard
//           title="Total Students"
//           value={summary.totalStudentsEnrolled.toLocaleString()}
//           icon={Users}
//           colorClass="text-teal-600"
//           bgClass="bg-white"
//           description="Total active student enrollments"
//         />

//       </div>

//       {/* --- 2. TREND CHARTS SECTION (2x2 Grid) --- */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
//         {/* Admission Trend Chart (from AdmissionReport.jsx) */}
//         <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//           <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
//             <TrendingUp className="w-5 h-5 text-teal-600" />
//             Monthly Admission Trend
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <AreaChart data={trendData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="period" tick={{ fontSize: 10 }} />
//               <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend />
//               <Area 
//                 type="monotone" 
//                 dataKey="admissions" 
//                 name="Total Admissions" 
//                 stroke={COLORS.admission_total} 
//                 fill={COLORS.admission_total} 
//                 fillOpacity={0.6} 
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Demo & Conversion Trend Chart (from DemoReport.jsx) */}
//         <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//           <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
//             <Clock className="w-5 h-5 text-amber-500" />
//             Demo & Conversion Trend
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={trendData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
//               <XAxis dataKey="period" tick={{ fontSize: 10 }} />
//               <YAxis tick={{ fontSize: 10 }} yAxisId="left" allowDecimals={false} />
//               <YAxis tick={{ fontSize: 10 }} yAxisId="right" orientation="right" allowDecimals={false} />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend />
//               <Bar 
//                 dataKey="demos" 
//                 name="Total Demos" 
//                 fill={COLORS.demo_students} 
//                 yAxisId="left"
//               />
//               <Bar 
//                 dataKey="conversions" 
//                 name="Conversions" 
//                 fill={COLORS.demo_conversion} 
//                 yAxisId="left"
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
      
//       {/* --- 3. DISTRIBUTION CHARTS SECTION --- */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

//         {/* Batch Status Distribution (from BatchReports.jsx) */}
//         <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//           <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
//             <BarChart3 className="w-5 h-5 text-blue-500" />
//             Batch Status Distribution
//           </h3>
//           {summary.batchStatusData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={summary.batchStatusData}
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={100}
//                   fill="#8884d8"
//                   dataKey="value"
//                   nameKey="name"
//                   labelLine={false}
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
//                 >
//                   {summary.batchStatusData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : (
//             <div className="text-center py-10 text-gray-500">No batch data available.</div>
//           )}
//         </div>

//         {/* New Course and Enrollment Trend (from CourseReport.jsx) */}
//         <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//           <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
//             <BookOpen className="w-5 h-5 text-purple-500" />
//             New Courses & Enrollments
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={trendData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="period" tick={{ fontSize: 10 }} />
//               <YAxis tick={{ fontSize: 10 }} yAxisId="enrollment" orientation="left" allowDecimals={false} />
//               <YAxis tick={{ fontSize: 10 }} yAxisId="courses" orientation="right" stroke={COLORS.course_batches} allowDecimals={false} />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend />
              
//               <Line 
//                 type="monotone" 
//                 dataKey="newEnrollments" 
//                 name="New Enrollments" 
//                 stroke={COLORS.course_enrollment} 
//                 yAxisId="enrollment"
//                 dot={false}
//               />
//               <Bar 
//                 dataKey="newCourses" 
//                 name="New Courses" 
//                 fill={COLORS.course_batches} 
//                 yAxisId="courses" 
//                 barSize={10}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default AdminDashboardOverview;



// import React, { useMemo, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchAdmissions } from '../../../store/slices/admissionSlice';
// import { getBatches } from '../../../store/slices/batchSlice';
// import { fetchCourses } from '../../../store/slices/courseSlice';
// import { fetchAllDemoReports } from '../../../store/slices/demoReportSlice';
// import { fetchLiveClasses } from '../../../store/slices/liveClassesSlice';
// import {fetchStudents} from '../../../store/slices/studentSlice';
// import {
//   Users,
//   TrendingUp,
//   Award,
//   BookOpen,
//   Play,
//   Clock,
//   Mail,
//   BarChart3,
//   Calendar,
//   Zap,
// } from 'lucide-react';
// import {
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';

// // --- COLOR & STYLE CONSTANTS (Derived from your reports) ---
// const COLORS = {
//   // Admissions (AdmissionReport.jsx)
//   admission_total: '#0d9488', // Teal
//   admission_approved: '#10b981', // Green
//   admission_pending: '#f59e0b', // Amber
//   admission_rejected: '#ef4444', // Red

//   // Batches (BatchReports.jsx)
//   batch_running: '#3b82f6', // Blue
//   batch_upcoming: '#8b5cf6', // Purple
//   batch_closed: '#9ca3af', // Gray

//   // Demos & Courses (DemoReport.jsx & CourseReport.jsx)
//   demo_conversion: '#f59e0b', // Amber
//   demo_students: '#3b82f6', // Blue
//   course_enrollment: '#0d9488', // Teal
//   course_batches: '#f59e0b', // Amber
// };

// // --- HELPER FUNCTIONS FOR DATA CALCULATION (Simplified Logic from source files) ---

// const useCombinedData = (admissions, batches, courses, demos) => {
//   const summary = useMemo(() => {
//     // --- ADMISSIONS SUMMARY (from AdmissionReport.jsx) ---
//     const totalAdmissions = admissions.length;
//     const approved = admissions.filter(a => a.status === 'approved' || a.status === 'Approved').length;
//     const pending = admissions.filter(a => a.status === 'pending' || a.status === 'Pending').length;
//     const rejected = admissions.filter(a => a.status === 'rejected' || a.status === 'Rejected').length;
//     const admissionConversionRate = totalAdmissions > 0 ? (approved / totalAdmissions) * 100 : 0;

//     // --- BATCHES SUMMARY (from BatchReports.jsx) ---
//     const totalBatches = batches.length;
//     const runningBatches = batches.filter(b => b.status === 'Running').length;
//     const upcomingBatches = batches.filter(b => b.status === 'Upcoming').length;
    
//     // --- COURSES SUMMARY (from CourseReport.jsx) ---
//     const totalCourses = courses.length;
//     const totalStudentsEnrolled = courses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
    
//     // --- DEMOS SUMMARY (from DemoReport.jsx) ---
//     const totalDemos = demos.length;
//     const totalDemoConversions = demos.reduce((sum, demo) => {
//       const conversions = Array.isArray(demo.convertedStudents) ? demo.convertedStudents.length : demo.converted ? 1 : 0;
//       return sum + conversions;
//     }, 0);
//     const totalDemoAttendees = demos.reduce((sum, demo) => {
//       const students = Array.isArray(demo.registeredStudents) ? demo.registeredStudents.length : demo.students?.length || demo.attendees?.length || 0;
//       return sum + students;
//     }, 0);
//     const demoConversionRate = totalDemoAttendees > 0 ? (totalDemoConversions / totalDemoAttendees) * 100 : 0;

//     // --- BATCH STATUS PIE DATA (from BatchReports.jsx) ---
//     const batchStatusData = [
//       { name: 'Running', value: runningBatches, color: COLORS.batch_running },
//       { name: 'Upcoming', value: upcomingBatches, color: COLORS.batch_upcoming },
//       { name: 'Closed', value: batches.filter(b => b.status === 'Closed').length, color: COLORS.batch_closed },
//     ].filter(d => d.value > 0);

//     return {
//       totalAdmissions, approved, pending, rejected, admissionConversionRate,
//       totalBatches, runningBatches, upcomingBatches,
//       totalCourses, totalStudentsEnrolled,
//       totalDemos, totalDemoConversions, demoConversionRate, totalDemoAttendees,
//       batchStatusData,
//     };
//   }, [admissions, batches, courses, demos]);

//   // Combined Monthly Trend Data (Simplified to Monthly)
//   const trendData = useMemo(() => {
//     // This is a highly simplified version of the logic from AdmissionReport, BatchReports, and DemoReport
//     const now = new Date();
//     const data = [];

//     for (let i = 11; i >= 0; i--) {
//         const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
//         const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
//         const period = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

//         // Admission Data (AdmissionReport.jsx)
//         const monthAdmissions = admissions.filter(a => {
//           const date = new Date(a.admissionDate || a.createdAt);
//           return date >= monthStart && date <= monthEnd;
//         });
//         const totalAdmissions = monthAdmissions.length;

//         // Demo Data (DemoReport.jsx)
//         const monthDemos = demos.filter(d => {
//           const date = new Date(d.createdAt || d.scheduledAt);
//           return date >= monthStart && date <= monthEnd;
//         });
//         const totalDemos = monthDemos.length;

//         // Course/Enrollment Data (CourseReport.jsx)
//         const monthCourses = courses.filter(c => {
//             const date = new Date(c.createdAt);
//             return date >= monthStart && date <= monthEnd;
//         });
//         const totalNewCourses = monthCourses.length;
//         const totalNewEnrollments = monthCourses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
        
//         data.push({
//             period,
//             admissions: totalAdmissions,
//             demos: totalDemos,
//             newCourses: totalNewCourses,
//             newEnrollments: totalNewEnrollments,
//         });
//     }
//     return data;
//   }, [admissions, demos, courses]);

//   return { summary, trendData };
// };

// // --- KPI CARD COMPONENT ---
// const KPICard = ({ title, value, icon: Icon, colorClass, bgClass, description }) => (
//   <div className={`p-5 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 transform hover:shadow-xl ${bgClass}`}>
//     <div className="flex justify-between items-start">
//       <div>
//         <p className="text-sm font-medium text-gray-500">{title}</p>
//         <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
//       </div>
//       <div className={`p-3 rounded-full ${bgClass.replace('bg-', 'bg-')}/70`}>
//         <Icon className={`w-6 h-6 ${colorClass}`} />
//       </div>
//     </div>
//     <p className="text-xs text-gray-400 mt-2 truncate">{description}</p>
//   </div>
// );

// // --- MAIN DASHBOARD COMPONENT ---
// const AdminDashboardOverview = () => {
//   const dispatch = useDispatch(); // Needed for initial data fetch (as seen in source files)
//   const admissionState = useSelector((state) => state.admissions || { admissions: [] });
//   const batchState = useSelector((state) => state.batch || { batches: [] });
//   const courseState = useSelector((state) => state.courses || { courses: [] });
//   const demoReportState = useSelector((state) => state.demoReports || { demos: [] });

//   const { admissions } = admissionState;
//   const { batches } = batchState;
//   const { courses } = courseState;
//   const { demos } = demoReportState;

//   useEffect(() => {
//     // Dispatch initial data fetches so dashboard shows up-to-date information
//     dispatch(fetchAdmissions());
//     dispatch(getBatches());
//     dispatch(fetchCourses());
//     dispatch(fetchAllDemoReports());
//     dispatch(fetchLiveClasses());
//   }, [dispatch]);

//   // Derive all data
//   const { summary, trendData } = useCombinedData(admissions, batches, courses, demos);
  
//   // Custom Tooltip for Recharts (as seen in DemoReport.jsx)
//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 text-sm">
//           <p className="font-semibold mb-1 text-gray-700">{label}</p>
//           {payload.map((p, index) => (
//             <p key={index} style={{ color: p.color }}>
//               {p.name}: <span className='font-bold'>{p.value}</span>
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

 

//   return (
//     <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
//         <BarChart3 className="w-8 h-8 text-teal-600" />
//         Admin Dashboard Overview
//       </h1>
//       <p className="text-gray-500 mb-8">
//         Consolidated analytical view of Admissions, Batches, Courses, and Demo Reports.
//       </p>

//       {/* --- 1. KPI CARDS SECTION --- */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        
//         {/* Admission Metrics (from AdmissionReport.jsx) */}
//         <KPICard
//           title="Total Admissions"
//           value={summary.totalAdmissions.toLocaleString()}
//           icon={Users}
//           colorClass="text-teal-600"
//           bgClass="bg-white"
//           description={`Approved: ${summary.approved} | Pending: ${summary.pending}`}
//         />


//         {/* Batch & Course Metrics (from BatchReports.jsx & CourseReport.jsx) */}
//         <KPICard
//           title="Total Courses"
//           value={summary.totalCourses.toLocaleString()}
//           icon={BookOpen}
//           colorClass="text-blue-500"
//           bgClass="bg-white"
//           description="Unique courses offered"
//         />
//         <KPICard
//           title="Total Batches"
//           value={summary.totalBatches.toLocaleString()}
//           icon={Play}
//           colorClass="text-purple-500"
//           bgClass="bg-white"
//           description={`Running: ${summary.runningBatches} | Upcoming: ${summary.upcomingBatches}`}
//         />

//         {/* Demo Metrics (from DemoReport.jsx) */}
//         <KPICard
//           title="Total Demos"
//           value={summary.totalDemos.toLocaleString()}
//           icon={Calendar}
//           colorClass="text-amber-500"
//           bgClass="bg-white"
//           description="Sessions scheduled"
//         />

//         {/* Student/Enrollment Metric (from CourseReport.jsx) */}
//         <KPICard
//           title="Total Students"
//           value={summary.totalStudentsEnrolled.toLocaleString()}
//           icon={Users}
//           colorClass="text-teal-600"
//           bgClass="bg-white"
//           description="Total active student enrollments"
//         />

//       </div>

//       {/* --- 2. TREND CHARTS SECTION (2x2 Grid) --- */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
//         {/* Admission Trend Chart (from AdmissionReport.jsx) */}
//         <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//           <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
//             <TrendingUp className="w-5 h-5 text-teal-600" />
//             Monthly Admission Trend
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <AreaChart data={trendData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="period" tick={{ fontSize: 10 }} />
//               <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend />
//               <Area 
//                 type="monotone" 
//                 dataKey="admissions" 
//                 name="Total Admissions" 
//                 stroke={COLORS.admission_total} 
//                 fill={COLORS.admission_total} 
//                 fillOpacity={0.6} 
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Demo Trend Chart (from DemoReport.jsx) - FIXED */}
//         <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//           <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
//             <TrendingUp className="w-5 h-5 text-amber-500" />
//             Monthly Demo Trend
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <AreaChart data={trendData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="period" tick={{ fontSize: 10 }} />
//               <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend />
//               <Area 
//                 type="monotone" 
//                 dataKey="demos" 
//                 name="Total Demos" 
//                 stroke="#f59e0b" 
//                 fill="#f59e0b" 
//                 fillOpacity={0.6} 
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>

//       </div>
      
//       {/* --- 3. DISTRIBUTION CHARTS SECTION --- */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

//         {/* Batch Status Distribution (from BatchReports.jsx) */}
//         <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//           <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
//             <BarChart3 className="w-5 h-5 text-blue-500" />
//             Batch Status Distribution
//           </h3>
//           {summary.batchStatusData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={summary.batchStatusData}
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={100}
//                   fill="#8884d8"
//                   dataKey="value"
//                   nameKey="name"
//                   labelLine={false}
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
//                 >
//                   {summary.batchStatusData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : (
//             <div className="text-center py-10 text-gray-500">No batch data available.</div>
//           )}
//         </div>

//         {/* New Course and Enrollment Trend (from CourseReport.jsx) */}
//         <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//           <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
//             <BookOpen className="w-5 h-5 text-purple-500" />
//             New Courses & Enrollments
//           </h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={trendData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="period" tick={{ fontSize: 10 }} />
//               <YAxis tick={{ fontSize: 10 }} yAxisId="enrollment" orientation="left" allowDecimals={false} />
//               <YAxis tick={{ fontSize: 10 }} yAxisId="courses" orientation="right" stroke={COLORS.course_batches} allowDecimals={false} />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend />
              
//               <Line 
//                 type="monotone" 
//                 dataKey="newEnrollments" 
//                 name="New Enrollments" 
//                 stroke={COLORS.course_enrollment} 
//                 yAxisId="enrollment"
//                 dot={false}
//               />
//               <Bar 
//                 dataKey="newCourses" 
//                 name="New Courses" 
//                 fill={COLORS.course_batches} 
//                 yAxisId="courses" 
//                 barSize={10}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default AdminDashboardOverview;

import React, { useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdmissions } from '../../../store/slices/admissionSlice';
import { getBatches } from '../../../store/slices/batchSlice';
import { fetchCourses } from '../../../store/slices/courseSlice';
import { fetchAllDemoReports } from '../../../store/slices/demoReportSlice';
import { fetchLiveClasses } from '../../../store/slices/liveClassesSlice';
import { fetchStudents } from '../../../store/slices/studentSlice';
import {
  Users,
  TrendingUp,
  Award,
  BookOpen,
  Play,
  Clock,
  Mail,
  BarChart3,
  Calendar,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// --- COLOR & STYLE CONSTANTS (Derived from your reports) ---
const COLORS = {
  // Admissions (AdmissionReport.jsx)
  admission_total: '#0d9488', // Teal
  admission_approved: '#10b981', // Green
  admission_pending: '#f59e0b', // Amber
  admission_rejected: '#ef4444', // Red

  // Batches (BatchReports.jsx)
  batch_running: '#3b82f6', // Blue
  batch_upcoming: '#8b5cf6', // Purple
  batch_closed: '#9ca3af', // Gray

  // Demos & Courses (DemoReport.jsx & CourseReport.jsx)
  demo_conversion: '#f59e0b', // Amber
  demo_students: '#3b82f6', // Blue
  course_enrollment: '#0d9488', // Teal
  course_batches: '#f59e0b', // Amber
};

// --- HELPER FUNCTIONS FOR DATA CALCULATION (Simplified Logic from source files) ---

const useCombinedData = (admissions, batches, courses, demos, students) => {
  const summary = useMemo(() => {
    // --- ADMISSIONS SUMMARY (from AdmissionReport.jsx) ---
    const totalAdmissions = admissions.length;
    const approved = admissions.filter(a => a.status === 'approved' || a.status === 'Approved').length;
    const pending = admissions.filter(a => a.status === 'pending' || a.status === 'Pending').length;
    const rejected = admissions.filter(a => a.status === 'rejected' || a.status === 'Rejected').length;
    const admissionConversionRate = totalAdmissions > 0 ? (approved / totalAdmissions) * 100 : 0;

    // --- BATCHES SUMMARY (from BatchReports.jsx) ---
    const totalBatches = batches.length;
    const runningBatches = batches.filter(b => b.status === 'Running').length;
    const upcomingBatches = batches.filter(b => b.status === 'Upcoming').length;
    
    // --- COURSES SUMMARY (from CourseReport.jsx) ---
    const totalCourses = courses.length;
    const totalStudentsEnrolled = courses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
    
    // --- DEMOS SUMMARY (from DemoReport.jsx) ---
    const totalDemos = demos.length;
    const totalDemoConversions = demos.reduce((sum, demo) => {
      const conversions = Array.isArray(demo.convertedStudents) ? demo.convertedStudents.length : demo.converted ? 1 : 0;
      return sum + conversions;
    }, 0);
    const totalDemoAttendees = demos.reduce((sum, demo) => {
      const students = Array.isArray(demo.registeredStudents) ? demo.registeredStudents.length : demo.students?.length || demo.attendees?.length || 0;
      return sum + students;
    }, 0);
    const demoConversionRate = totalDemoAttendees > 0 ? (totalDemoConversions / totalDemoAttendees) * 100 : 0;

    // --- STUDENTS SUMMARY (from studentSlice) ---
    const totalStudents = students.length;
    
    // --- BATCH STATUS PIE DATA (from BatchReports.jsx) ---
    const batchStatusData = [
      { name: 'Running', value: runningBatches, color: COLORS.batch_running },
      { name: 'Upcoming', value: upcomingBatches, color: COLORS.batch_upcoming },
      { name: 'Closed', value: batches.filter(b => b.status === 'Closed').length, color: COLORS.batch_closed },
    ].filter(d => d.value > 0);

    return {
      totalAdmissions, approved, pending, rejected, admissionConversionRate,
      totalBatches, runningBatches, upcomingBatches,
      totalCourses, totalStudentsEnrolled,
      totalDemos, totalDemoConversions, demoConversionRate, totalDemoAttendees,
      totalStudents,
      batchStatusData,
    };
  }, [admissions, batches, courses, demos, students]);

  // Combined Monthly Trend Data (Simplified to Monthly)
  const trendData = useMemo(() => {
    // This is a highly simplified version of the logic from AdmissionReport, BatchReports, and DemoReport
    const now = new Date();
    const data = [];

    for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const period = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        // Admission Data (AdmissionReport.jsx)
        const monthAdmissions = admissions.filter(a => {
          const date = new Date(a.admissionDate || a.createdAt);
          return date >= monthStart && date <= monthEnd;
        });
        const totalAdmissions = monthAdmissions.length;

        // Demo Data (DemoReport.jsx)
        const monthDemos = demos.filter(d => {
          const date = new Date(d.createdAt || d.scheduledAt);
          return date >= monthStart && date <= monthEnd;
        });
        const totalDemos = monthDemos.length;

        // Course/Enrollment Data (CourseReport.jsx)
        const monthCourses = courses.filter(c => {
            const date = new Date(c.createdAt);
            return date >= monthStart && date <= monthEnd;
        });
        const totalNewCourses = monthCourses.length;
        const totalNewEnrollments = monthCourses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
        
        // Student Data (from studentSlice)
        const monthStudents = students.filter(s => {
          const date = new Date(s.createdAt || s.admissionDate);
          return date >= monthStart && date <= monthEnd;
        });
        const totalNewStudents = monthStudents.length;
        
        data.push({
            period,
            admissions: totalAdmissions,
            demos: totalDemos,
            newCourses: totalNewCourses,
            newEnrollments: totalNewEnrollments,
            newStudents: totalNewStudents,
        });
    }
    return data;
  }, [admissions, demos, courses, students]);

  return { summary, trendData };
};

// --- KPI CARD COMPONENT ---
const KPICard = ({ title, value, icon: Icon, colorClass, bgClass, description }) => (
  <div className={`p-5 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 transform hover:shadow-xl ${bgClass}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${bgClass.replace('bg-', 'bg-')}/70`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
    <p className="text-xs text-gray-400 mt-2 truncate">{description}</p>
  </div>
);

// --- MAIN DASHBOARD COMPONENT ---
const AdminDashboardOverview = () => {
  const dispatch = useDispatch(); // Needed for initial data fetch (as seen in source files)
  const admissionState = useSelector((state) => state.admissions || { admissions: [] });
  const batchState = useSelector((state) => state.batch || { batches: [] });
  const courseState = useSelector((state) => state.courses || { courses: [] });
  const demoReportState = useSelector((state) => state.demoReports || { demos: [] });
  const studentState = useSelector((state) => state.students || { students: [] });

  const { admissions } = admissionState;
  const { batches } = batchState;
  const { courses } = courseState;
  const { demos } = demoReportState;
  const { students } = studentState;

  useEffect(() => {
    // Dispatch initial data fetches so dashboard shows up-to-date information
    dispatch(fetchAdmissions());
    dispatch(getBatches());
    dispatch(fetchCourses());
    dispatch(fetchAllDemoReports());
    dispatch(fetchLiveClasses());
    dispatch(fetchStudents()); // Fetch students data
  }, [dispatch]);

  // Derive all data
  const { summary, trendData } = useCombinedData(admissions, batches, courses, demos, students);
  
  // Custom Tooltip for Recharts (as seen in DemoReport.jsx)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 text-sm">
          <p className="font-semibold mb-1 text-gray-700">{label}</p>
          {payload.map((p, index) => (
            <p key={index} style={{ color: p.color }}>
              {p.name}: <span className='font-bold'>{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-teal-600" />
        Admin Dashboard Overview
      </h1>
      <p className="text-gray-500 mb-8">
        Consolidated analytical view of Admissions, Batches, Courses, and Demo Reports.
      </p>

      {/* --- 1. KPI CARDS SECTION --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        
        {/* Admission Metrics (from AdmissionReport.jsx) */}
        <KPICard
          title="Total Admissions"
          value={summary.totalAdmissions.toLocaleString()}
          icon={Users}
          colorClass="text-teal-600"
          bgClass="bg-white"
          description={`Approved: ${summary.approved} | Pending: ${summary.pending}`}
        />

        {/* Student Metrics (from studentSlice) */}
        <KPICard
          title="Total Students"
          value={summary.totalStudents.toLocaleString()}
          icon={Users}
          colorClass="text-blue-600"
          bgClass="bg-white"
          description="All registered students in system"
        />

        {/* Batch & Course Metrics (from BatchReports.jsx & CourseReport.jsx) */}
        <KPICard
          title="Total Courses"
          value={summary.totalCourses.toLocaleString()}
          icon={BookOpen}
          colorClass="text-blue-500"
          bgClass="bg-white"
          description="Unique courses offered"
        />
        <KPICard
          title="Total Batches"
          value={summary.totalBatches.toLocaleString()}
          icon={Play}
          colorClass="text-purple-500"
          bgClass="bg-white"
          description={`Running: ${summary.runningBatches} | Upcoming: ${summary.upcomingBatches}`}
        />

        {/* Demo Metrics (from DemoReport.jsx) */}
        <KPICard
          title="Total Demos"
          value={summary.totalDemos.toLocaleString()}
          icon={Calendar}
          colorClass="text-amber-500"
          bgClass="bg-white"
          description="Sessions scheduled"
        />
      </div>

      {/* --- 2. TREND CHARTS SECTION (2x2 Grid) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Admission Trend Chart (from AdmissionReport.jsx) */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Monthly Admission Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="admissions" 
                name="Total Admissions" 
                stroke={COLORS.admission_total} 
                fill={COLORS.admission_total} 
                fillOpacity={0.6} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Demo Trend Chart (from DemoReport.jsx) */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Monthly Demo Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="demos" 
                name="Total Demos" 
                stroke="#f59e0b" 
                fill="#f59e0b" 
                fillOpacity={0.6} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>
      
      {/* --- 3. DISTRIBUTION CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Batch Status Distribution (from BatchReports.jsx) */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Batch Status Distribution
          </h3>
          {summary.batchStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summary.batchStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {summary.batchStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-gray-500">No batch data available.</div>
          )}
        </div>

        {/* New Course and Enrollment Trend (from CourseReport.jsx) - Updated with Student Data */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            Monthly Students & Enrollments
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} yAxisId="left" orientation="left" allowDecimals={false} />
              <YAxis tick={{ fontSize: 10 }} yAxisId="right" orientation="right" stroke={COLORS.course_batches} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line 
                type="monotone" 
                dataKey="newStudents" 
                name="New Students" 
                stroke="#3b82f6" 
                yAxisId="left"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Bar 
                dataKey="newEnrollments" 
                name="New Enrollments" 
                fill={COLORS.course_enrollment} 
                yAxisId="right" 
                barSize={10}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardOverview;