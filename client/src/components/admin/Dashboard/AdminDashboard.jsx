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
  Menu,
  X,
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

// --- COLOR & STYLE CONSTANTS (Updated with #890c25) ---
const COLORS = {
  primary: '#890c25',
  primaryDark: '#6e091d',
  primaryLight: '#890c25/10',
  
  // Admissions
  admission_total: '#890c25', // Changed to primary color
  admission_approved: '#10b981', // Green (kept for contrast)
  admission_pending: '#f59e0b', // Amber
  admission_rejected: '#ef4444', // Red

  // Batches
  batch_running: '#890c25', // Changed to primary color
  batch_upcoming: '#8b5cf6', // Purple
  batch_closed: '#9ca3af', // Gray

  // Demos & Courses
  demo_conversion: '#f59e0b', // Amber
  demo_students: '#890c25', // Changed to primary color
  course_enrollment: '#890c25', // Changed to primary color
  course_batches: '#f59e0b', // Amber
};

// --- HELPER FUNCTIONS FOR DATA CALCULATION (Simplified Logic from source files) ---

const useCombinedData = (admissions, batches, courses, demos, students) => {
  const summary = useMemo(() => {
    // --- ADMISSIONS SUMMARY ---
    const totalAdmissions = admissions.length;
    const approved = admissions.filter(a => a.status === 'approved' || a.status === 'Approved').length;
    const pending = admissions.filter(a => a.status === 'pending' || a.status === 'Pending').length;
    const rejected = admissions.filter(a => a.status === 'rejected' || a.status === 'Rejected').length;
    const admissionConversionRate = totalAdmissions > 0 ? (approved / totalAdmissions) * 100 : 0;

    // --- BATCHES SUMMARY ---
    const totalBatches = batches.length;
    const runningBatches = batches.filter(b => b.status === 'Running').length;
    const upcomingBatches = batches.filter(b => b.status === 'Upcoming').length;
    
    // --- COURSES SUMMARY ---
    const totalCourses = courses.length;
    const totalStudentsEnrolled = courses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
    
    // --- DEMOS SUMMARY ---
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

    // --- STUDENTS SUMMARY ---
    const totalStudents = students.length;
    
    // --- BATCH STATUS PIE DATA ---
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
    const now = new Date();
    const data = [];

    for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const period = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        // Admission Data
        const monthAdmissions = admissions.filter(a => {
          const date = new Date(a.admissionDate || a.createdAt);
          return date >= monthStart && date <= monthEnd;
        });
        const totalAdmissions = monthAdmissions.length;

        // Demo Data
        const monthDemos = demos.filter(d => {
          const date = new Date(d.createdAt || d.scheduledAt);
          return date >= monthStart && date <= monthEnd;
        });
        const totalDemos = monthDemos.length;

        // Course/Enrollment Data
        const monthCourses = courses.filter(c => {
            const date = new Date(c.createdAt);
            return date >= monthStart && date <= monthEnd;
        });
        const totalNewCourses = monthCourses.length;
        const totalNewEnrollments = monthCourses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
        
        // Student Data
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

// --- KPI CARD COMPONENT (Mobile Responsive) ---
const KPICard = ({ title, value, icon: Icon, colorClass = "text-[#890c25]", bgClass = "bg-white", description }) => (
  <div className={`p-3 sm:p-4 md:p-5 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 transform hover:shadow-xl ${bgClass} hover:border-[#890c25]/20`}>
    <div className="flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1 truncate">{value}</p>
      </div>
      <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ml-2`} style={{ backgroundColor: `${COLORS.primary}10` }}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${colorClass}`} />
      </div>
    </div>
    {description && (
      <p className="text-xs text-gray-400 mt-2 truncate hidden sm:block">{description}</p>
    )}
  </div>
);

// --- MOBILE FILTER BUTTON (Optional - for future use) ---
const MobileFilterButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="lg:hidden fixed bottom-4 right-4 z-50 bg-[#890c25] text-white p-3 rounded-full shadow-lg hover:bg-[#6e091d] transition-colors"
  >
    <Menu className="w-6 h-6" />
  </button>
);

// --- CUSTOM TOOLTIP (Mobile Responsive) ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md border border-gray-200 text-xs sm:text-sm max-w-[200px] sm:max-w-none">
        <p className="font-semibold mb-1 text-gray-700">{label}</p>
        {payload.map((p, index) => (
          <p key={index} style={{ color: p.color }} className="whitespace-nowrap">
            {p.name}: <span className='font-bold'>{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- MAIN DASHBOARD COMPONENT (Fully Responsive) ---
const AdminDashboardOverview = () => {
  const dispatch = useDispatch();
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
    // Dispatch initial data fetches
    dispatch(fetchAdmissions());
    dispatch(getBatches());
    dispatch(fetchCourses());
    dispatch(fetchAllDemoReports());
    dispatch(fetchLiveClasses());
    dispatch(fetchStudents());
  }, [dispatch]);

  // Derive all data
  const { summary, trendData } = useCombinedData(admissions, batches, courses, demos, students);

  // Responsive chart settings
  const chartMargin = { top: 10, right: 10, left: 0, bottom: 5 };
  const mobileChartHeight = 250;
  const desktopChartHeight = 300;

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50 pb-20 lg:pb-8">
      {/* Header Section - Mobile Optimized */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
          <div className="p-2 rounded-lg bg-[#890c25]/10">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#890c25]" />
          </div>
          <span className="truncate">Dashboard Overview</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
          Consolidated view of Admissions, Batches, Courses & Reports
        </p>
      </div>

      {/* --- 1. KPI CARDS SECTION (Fully Responsive Grid) --- */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
        
        {/* Admission Metrics */}
        <KPICard
          title="Admissions"
          value={summary.totalAdmissions.toLocaleString()}
          icon={Users}
          colorClass="text-[#890c25]"
          bgClass="bg-white"
          description={`Approved: ${summary.approved} | Pending: ${summary.pending}`}
        />

        {/* Student Metrics */}
        <KPICard
          title="Students"
          value={summary.totalStudents.toLocaleString()}
          icon={Users}
          colorClass="text-[#890c25]"
          bgClass="bg-white"
          description="All registered students"
        />

        {/* Courses Metrics */}
        <KPICard
          title="Courses"
          value={summary.totalCourses.toLocaleString()}
          icon={BookOpen}
          colorClass="text-[#890c25]"
          bgClass="bg-white"
          description="Unique courses offered"
        />
        
        {/* Batches Metrics */}
        <KPICard
          title="Batches"
          value={summary.totalBatches.toLocaleString()}
          icon={Play}
          colorClass="text-[#890c25]"
          bgClass="bg-white"
          description={`Running: ${summary.runningBatches}`}
        />

        {/* Demos Metrics */}
        <KPICard
          title="Demos"
          value={summary.totalDemos.toLocaleString()}
          icon={Calendar}
          colorClass="text-[#890c25]"
          bgClass="bg-white"
          description="Sessions scheduled"
        />
      </div>

      {/* --- 2. TREND CHARTS SECTION (Stack on Mobile) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        
        {/* Admission Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#890c25]" />
            <span className="truncate">Monthly Admissions</span>
          </h3>
          <div className="w-full h-[250px] sm:h-[280px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
                  allowDecimals={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="admissions" 
                  name="Admissions" 
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demo Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#890c25]" />
            <span className="truncate">Monthly Demos</span>
          </h3>
          <div className="w-full h-[250px] sm:h-[280px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
                  allowDecimals={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="demos" 
                  name="Demos" 
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* --- 3. DISTRIBUTION CHARTS SECTION (Stack on Mobile) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">

        {/* Batch Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#890c25]" />
            <span className="truncate">Batch Status</span>
          </h3>
          <div className="w-full h-[250px] sm:h-[280px] md:h-[300px]">
            {summary.batchStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.batchStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={window.innerWidth < 640 ? 70 : 100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={window.innerWidth >= 640 ? ({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%` : false
                    }
                  >
                    {summary.batchStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    layout={window.innerWidth < 640 ? "horizontal" : "horizontal"}
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                No batch data available
              </div>
            )}
          </div>
        </div>

        {/* Students & Enrollments Trend */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#890c25]" />
            <span className="truncate">Students & Enrollments</span>
          </h3>
          <div className="w-full h-[250px] sm:h-[280px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
                  yAxisId="left"
                  orientation="left"
                  allowDecimals={false}
                  width={30}
                />
                <YAxis 
                  tick={{ fontSize: window.innerWidth < 640 ? 8 : 10 }}
                  yAxisId="right"
                  orientation="right"
                  stroke={COLORS.course_batches}
                  allowDecimals={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }}
                />
                <Bar 
                  dataKey="newStudents" 
                  name="New Students" 
                  fill={COLORS.primary}
                  yAxisId="left"
                  barSize={window.innerWidth < 640 ? 6 : 10}
                />
                <Bar 
                  dataKey="newEnrollments" 
                  name="Enrollments" 
                  fill={COLORS.course_batches}
                  yAxisId="right"
                  barSize={window.innerWidth < 640 ? 6 : 10}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mobile Quick Stats Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center shadow-lg">
        <div className="text-center">
          <p className="text-xs text-gray-500">Admissions</p>
          <p className="text-sm font-bold text-[#890c25]">{summary.totalAdmissions}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Students</p>
          <p className="text-sm font-bold text-[#890c25]">{summary.totalStudents}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Batches</p>
          <p className="text-sm font-bold text-[#890c25]">{summary.totalBatches}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Demos</p>
          <p className="text-sm font-bold text-[#890c25]">{summary.totalDemos}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;