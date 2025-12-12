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

// --- HELPER FUNCTIONS FOR DATA CALCULATION ---

const useCounsellorData = (admissions, batches, courses, demos, counsellorName, isCounsellor) => {
  const summary = useMemo(() => {
    console.log('=== DEBUG useCounsellorData ===');
    console.log('isCounsellor:', isCounsellor);
    console.log('counsellorName:', counsellorName);
    console.log('Total demos received:', demos.length);
    console.log('Total admissions:', admissions.length);
    
    // For non-counsellor (admin), show all data
    if (!isCounsellor) {
      console.log('Admin view - showing all data');
      const totalAdmissions = admissions.length;
      const approved = admissions.filter(a => a.status === 'approved' || a.status === 'Approved').length;
      const pending = admissions.filter(a => a.status === 'pending' || a.status === 'Pending').length;
      const rejected = admissions.filter(a => a.status === 'rejected' || a.status === 'Rejected').length;
      const admissionConversionRate = totalAdmissions > 0 ? (approved / totalAdmissions) * 100 : 0;

      const totalBatches = batches.length;
      const runningBatches = batches.filter(b => b.status === 'Running').length;
      const upcomingBatches = batches.filter(b => b.status === 'Upcoming').length;
      
      const totalCourses = courses.length;
      const totalStudentsEnrolled = courses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
      
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
        batchStatusData,
      };
    }

    // For counsellor, filter data
    console.log('Counsellor view - filtering data');
    
    // Filter admissions created/owned by this counsellor
    const counsellorAdmissions = admissions.filter(a => 
      a.counsellor === counsellorName || 
      a.createdBy === counsellorName ||
      a.assignedCounsellor === counsellorName
    );
    
    console.log('Counsellor admissions found:', counsellorAdmissions.length);
    console.log('Sample admission:', counsellorAdmissions[0]);

    // The demos are already filtered by the demoReportSlice
    // So we use ALL the demos returned by the slice
    const counsellorDemos = demos; // Already filtered by the slice
    
    console.log('Counsellor demos (from slice):', counsellorDemos.length);
    if (counsellorDemos.length > 0) {
      console.log('Sample demo counselor field:', counsellorDemos[0].counselor);
    }

    // --- ADMISSIONS SUMMARY (for this counsellor) ---
    const totalAdmissions = counsellorAdmissions.length;
    const approved = counsellorAdmissions.filter(a => a.status === 'approved' || a.status === 'Approved').length;
    const pending = counsellorAdmissions.filter(a => a.status === 'pending' || a.status === 'Pending').length;
    const rejected = counsellorAdmissions.filter(a => a.status === 'rejected' || a.status === 'Rejected').length;
    const admissionConversionRate = totalAdmissions > 0 ? (approved / totalAdmissions) * 100 : 0;

    // --- BATCHES SUMMARY (show all batches) ---
    const totalBatches = batches.length;
    const runningBatches = batches.filter(b => b.status === 'Running').length;
    const upcomingBatches = batches.filter(b => b.status === 'Upcoming').length;
    
    // --- COURSES SUMMARY (show all courses) ---
    const totalCourses = courses.length;
    
    // Calculate students enrolled in courses where counsellor has admissions
    const counsellorStudentIds = new Set(
      counsellorAdmissions
        .map(a => a.student?._id || a.student)
        .filter(id => id)
    );
    
    // Count students from counsellor's admissions
    const totalStudentsEnrolled = Array.from(counsellorStudentIds).length;
    
    // --- DEMOS SUMMARY (for this counsellor) ---
    const totalDemos = counsellorDemos.length;
    const totalDemoConversions = counsellorDemos.reduce((sum, demo) => {
      const conversions = Array.isArray(demo.convertedStudents) ? demo.convertedStudents.length : demo.converted ? 1 : 0;
      return sum + conversions;
    }, 0);
    const totalDemoAttendees = counsellorDemos.reduce((sum, demo) => {
      const students = Array.isArray(demo.registeredStudents) ? demo.registeredStudents.length : demo.students?.length || demo.attendees?.length || 0;
      return sum + students;
    }, 0);
    const demoConversionRate = totalDemoAttendees > 0 ? (totalDemoConversions / totalDemoAttendees) * 100 : 0;

    // --- BATCH STATUS PIE DATA (all batches) ---
    const batchStatusData = [
      { name: 'Running', value: runningBatches, color: COLORS.batch_running },
      { name: 'Upcoming', value: upcomingBatches, color: COLORS.batch_upcoming },
      { name: 'Closed', value: batches.filter(b => b.status === 'Closed').length, color: COLORS.batch_closed },
    ].filter(d => d.value > 0);

    console.log('=== DEBUG Summary ===');
    console.log('totalDemos:', totalDemos);
    console.log('totalAdmissions:', totalAdmissions);
    console.log('totalStudentsEnrolled:', totalStudentsEnrolled);

    return {
      totalAdmissions, approved, pending, rejected, admissionConversionRate,
      totalBatches, runningBatches, upcomingBatches,
      totalCourses, totalStudentsEnrolled,
      totalDemos, totalDemoConversions, demoConversionRate, totalDemoAttendees,
      batchStatusData,
    };
  }, [admissions, batches, courses, demos, counsellorName, isCounsellor]);

  // Combined Monthly Trend Data
  const trendData = useMemo(() => {
    console.log('=== DEBUG trendData ===');
    console.log('isCounsellor:', isCounsellor);
    console.log('demos count:', demos.length);
    
    const now = new Date();
    const data = [];

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const period = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      // Use the demos as they are (already filtered by slice)
      const monthDemos = demos.filter(d => {
        const date = new Date(d.createdAt || d.scheduledAt || d.date);
        return date >= monthStart && date <= monthEnd;
      });
      const totalDemos = monthDemos.length;

      // Filter admissions
      let monthAdmissions = admissions;
      if (isCounsellor && counsellorName) {
        monthAdmissions = admissions.filter(a => {
          const isCounsellorAdmission = a.counsellor === counsellorName || 
                                        a.createdBy === counsellorName ||
                                        a.assignedCounsellor === counsellorName;
          if (!isCounsellorAdmission) return false;
          
          const date = new Date(a.admissionDate || a.createdAt);
          return date >= monthStart && date <= monthEnd;
        });
      } else {
        monthAdmissions = admissions.filter(a => {
          const date = new Date(a.admissionDate || a.createdAt);
          return date >= monthStart && date <= monthEnd;
        });
      }
      const totalAdmissions = monthAdmissions.length;

      // Course/Enrollment Data (show all courses)
      const monthCourses = courses.filter(c => {
        const date = new Date(c.createdAt);
        return date >= monthStart && date <= monthEnd;
      });
      const totalNewCourses = monthCourses.length;
      
      // Count new enrollments from admissions this month
      const newAdmissionIds = monthAdmissions
        .map(a => a.student?._id || a.student)
        .filter(id => id);
      const uniqueNewStudents = new Set(newAdmissionIds);
      const totalNewEnrollments = uniqueNewStudents.size;
      
      data.push({
        period,
        admissions: totalAdmissions,
        demos: totalDemos,
        newCourses: totalNewCourses,
        newEnrollments: totalNewEnrollments,
      });
    }
    
    console.log('Trend data generated:', data.length, 'months');
    console.log('Sample trend data:', data[0]);
    
    return data;
  }, [admissions, demos, courses, counsellorName, isCounsellor]);

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
const Dashboard = () => {
  const dispatch = useDispatch();
  
  // Get user data from auth state
  const authState = useSelector((state) => state.auth || {});
  const user = authState.user || {};
  const counsellorName = user.FullName || user.fullName || user.name || '';
  const userRole = user.role || '';
  
  // Check if user is a counsellor
  const isCounsellor = userRole.toLowerCase().includes('counsellor') || userRole.toLowerCase().includes('counselor');

  // Get data from slices
  const admissionState = useSelector((state) => state.admissions || { admissions: [] });
  const batchState = useSelector((state) => state.batch || { batches: [] });
  const courseState = useSelector((state) => state.courses || { courses: [] });
  const demoReportState = useSelector((state) => state.demoReports || { demos: [] });

  const { admissions } = admissionState;
  const { batches } = batchState;
  const { courses } = courseState;
  const { demos } = demoReportState;

  // Debug: Log demo data
  useEffect(() => {
    console.log('=== DEBUG Dashboard Component ===');
    console.log('Demo data in Dashboard:', demos);
    console.log('Counsellor name:', counsellorName);
    console.log('Is counsellor:', isCounsellor);
    console.log('User role:', userRole);
    console.log('Total demos fetched:', demos.length);
    
    if (demos.length > 0) {
      console.log('First demo:', {
        id: demos[0]._id,
        type: demos[0].demoType,
        title: demos[0].title,
        counselor: demos[0].counselor,
        date: demos[0].createdAt
      });
    }
  }, [demos, counsellorName, isCounsellor, userRole]);

  useEffect(() => {
    // Dispatch initial data fetches
    console.log('Dispatching data fetches...');
    dispatch(fetchAdmissions());
    dispatch(getBatches());
    dispatch(fetchCourses());
    dispatch(fetchAllDemoReports()); // This should fetch all demos
    dispatch(fetchLiveClasses());
  }, [dispatch]);

  // Derive counsellor-specific data
  const { summary, trendData } = useCounsellorData(admissions, batches, courses, demos, counsellorName, isCounsellor);
  
  // Custom Tooltip for Recharts
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
        {isCounsellor ? "Counsellor Dashboard" : "Admin Dashboard Overview"}
      </h1>
      <p className="text-gray-500 mb-8">
        {isCounsellor 
          ? "View your admissions, demo reports, and performance metrics. Courses and batches show overall institute data."
          : "Consolidated analytical view of Admissions, Batches, Courses, and Demo Reports."}
      </p>

      {/* Display counsellor name if applicable */}
      {/* {isCounsellor && counsellorName && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Logged in as: <span className="font-bold">{counsellorName}</span></p>
              <p className="text-sm text-blue-600">Showing your admissions, demos, and student data</p>
              <p className="text-xs text-gray-500 mt-1">
                Demos found: {summary.totalDemos} | Admissions: {summary.totalAdmissions} | Students: {summary.totalStudentsEnrolled}
              </p>
            </div>
          </div>
        </div>
      )} */}

      {/* --- 1. KPI CARDS SECTION --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        
        {/* Admission Metrics */}
        <KPICard
          title={isCounsellor ? "My Admissions" : "Total Admissions"}
          value={summary.totalAdmissions.toLocaleString()}
          icon={Users}
          colorClass="text-teal-600"
          bgClass="bg-white"
          description={
            isCounsellor 
              ? `Approved: ${summary.approved} | Pending: ${summary.pending}`
              : `All admissions across institute`
          }
        />

        {/* Batch & Course Metrics (show all) */}
        <KPICard
          title="Total Courses"
          value={summary.totalCourses.toLocaleString()}
          icon={BookOpen}
          colorClass="text-blue-500"
          bgClass="bg-white"
          description="All courses offered by institute"
        />
        <KPICard
          title="Total Batches"
          value={summary.totalBatches.toLocaleString()}
          icon={Play}
          colorClass="text-purple-500"
          bgClass="bg-white"
          description={`Running: ${summary.runningBatches} | Upcoming: ${summary.upcomingBatches}`}
        />

        {/* Demo Metrics */}
        <KPICard
          title={isCounsellor ? "My Demos" : "Total Demos"}
          value={summary.totalDemos.toLocaleString()}
          icon={Calendar}
          colorClass="text-amber-500"
          bgClass="bg-white"
          description={isCounsellor ? "Your scheduled sessions" : "All demo sessions"}
        />

        {/* Student/Enrollment Metric */}
        <KPICard
          title={isCounsellor ? "Enrolled students" : "Total Students"}
          value={summary.totalStudentsEnrolled.toLocaleString()}
          icon={Users}
          colorClass="text-teal-600"
          bgClass="bg-white"
          description={
            isCounsellor 
              ? "Students from your admissions"
              : "Total active student enrollments"
          }
        />

      </div>

      {/* --- 2. TREND CHARTS SECTION (2x2 Grid) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Admission Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            {isCounsellor ? "My Monthly Admissions" : "Monthly Admission Trend"}
          </h3>
          {trendData.length > 0 ? (
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
                  name={isCounsellor ? "My Admissions" : "Total Admissions"} 
                  stroke={COLORS.admission_total} 
                  fill={COLORS.admission_total} 
                  fillOpacity={0.6} 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-gray-500">No admission data available.</div>
          )}
        </div>

        {/* Demo Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            {isCounsellor ? "My Monthly Demos" : "Monthly Demo Trend"}
          </h3>
          {trendData.length > 0 ? (
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
                  name={isCounsellor ? "My Demos" : "Total Demos"} 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  fillOpacity={0.6} 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-gray-500">No demo data available.</div>
          )}
        </div>

      </div>
      
      {/* --- 3. DISTRIBUTION CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Batch Status Distribution (show all batches) */}
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

        {/* New Course and Enrollment Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            New Courses & Enrollments
          </h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} yAxisId="enrollment" orientation="left" allowDecimals={false} />
                <YAxis tick={{ fontSize: 10 }} yAxisId="courses" orientation="right" stroke={COLORS.course_batches} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                <Line 
                  type="monotone" 
                  dataKey="newEnrollments" 
                  name={isCounsellor ? "My New Students" : "New Enrollments"} 
                  stroke={COLORS.course_enrollment} 
                  yAxisId="enrollment"
                  dot={false}
                />
                <Bar 
                  dataKey="newCourses" 
                  name="New Courses" 
                  fill={COLORS.course_batches} 
                  yAxisId="courses" 
                  barSize={10}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-gray-500">No course/enrollment data available.</div>
          )}
        </div>
      </div>

      {/* Performance Summary for Counsellors */}
      {isCounsellor && (
        <div className="mt-8 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl shadow-lg p-6 border border-teal-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Your Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Admission Conversion Rate</span>
                <span className="font-bold text-teal-600">
                  {summary.admissionConversionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(summary.admissionConversionRate, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {summary.approved} approved out of {summary.totalAdmissions} admissions
              </p>
            </div>


            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Student Engagement</span>
                <span className="font-bold text-blue-600">
                  {summary.totalStudentsEnrolled}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((summary.totalStudentsEnrolled / 50) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total students from your admissions
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;