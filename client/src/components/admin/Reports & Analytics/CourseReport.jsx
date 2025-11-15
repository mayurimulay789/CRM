import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// NOTE: Assuming you have a 'getCourses' action and 'courseSlice' in your Redux setup
import { getCourses } from '../../../store/slices/courseSlice'; 
import { CSVLink } from 'react-csv';
import {
  Download,
  Filter,
  BarChart3,
  BookOpen, // Total Courses
  Users, // Total Students
  Play, // Active Batches
  Clock, // Course Trend
  Activity,
  Award, // Completion Rate
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

// --- Subtle Color Palette for Minimalist Consistency ---
const COURSE_COLORS = {
  Total: '#0d9488',     // Teal-600 (Main highlight color)
  Students: '#3b82f6',  // Blue-500
  Batches: '#f59e0b',   // Amber-500
};

const CourseReports = () => {
  const dispatch = useDispatch();
  // NOTE: You will need to replace 'state.course' with your actual course slice name
  const { courses, loading } = useSelector((state) => state.course); 
  const [filter, setFilter] = useState('month');
  const [chartData, setChartData] = useState([]);

  // --- MOCK DATA STRUCTURE ASSUMPTIONS ---
  // We assume each course object has:
  // - students: Array of student IDs (course.students.length)
  // - batches: Array of batch IDs (course.batches.length)
  // - createdAt: Date string
  // - completionRate: Number (e.g., 0.85 for 85%)

  // 1. Initial Data Fetch (Adjust action name as needed)
  useEffect(() => {
    if (courses.length === 0 && !loading) {
      dispatch(getCourses());
    }
  }, [dispatch, courses.length, loading]);

  // 2. Data Processing Effect
  useEffect(() => {
    if (courses.length > 0) {
      processData();
    }
  }, [courses, filter]);

  // --- Data Processing Logic for Time Trend ---
  const processData = () => {
    const now = new Date();
    let data = [];

    const filterCoursesByDate = (startDate, endDate) => {
      return courses.filter(course => {
        const courseDate = new Date(course.createdAt); 
        return courseDate >= startDate && courseDate <= endDate;
      });
    };

    // Logic similar to BatchReports but targeting course.createdAt
    if (filter === 'day') {
        for (let i = 29; i >= 0; i--) {
            // ... (day range logic)
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(23, 59, 59, 999); 
            const dateStart = new Date(date);
            dateStart.setHours(0, 0, 0, 0);

            const dayCourses = filterCoursesByDate(dateStart, date);

            data.push({
                date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
                total: dayCourses.length,
                students: dayCourses.reduce((sum, c) => sum + (c.students?.length || 0), 0),
                batches: dayCourses.reduce((sum, c) => sum + (c.batches?.length || 0), 0),
            });
        }
    } else if (filter === 'month') {
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            monthEnd.setHours(23, 59, 59, 999);

            const monthCourses = filterCoursesByDate(monthStart, monthEnd);

            data.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                total: monthCourses.length,
                students: monthCourses.reduce((sum, c) => sum + (c.students?.length || 0), 0),
                batches: monthCourses.reduce((sum, c) => sum + (c.batches?.length || 0), 0),
            });
        }
    } 
    // Simplified: only included 'day' and 'month' for brevity. Add 'week' and 'year' logic if needed.

    setChartData(data);
  };

  // --- Memoized Summary Data ---
  const summaryData = useMemo(() => {
    const totalStudents = courses.reduce((sum, c) => sum + (c.students?.length || 0), 0);
    const totalBatches = courses.reduce((sum, c) => sum + (c.batches?.length || 0), 0);
    const avgCompletion = courses.length 
        ? (courses.reduce((sum, c) => sum + (c.completionRate || 0), 0) / courses.length) * 100 
        : 0;

    return {
      totalCourses: courses.length,
      totalStudents: totalStudents,
      totalBatches: totalBatches,
      avgCompletion: avgCompletion.toFixed(1),
    };
  }, [courses]);

  // --- Course Popularity Chart Data ---
  const studentEnrollmentData = useMemo(() => {
    // Sort courses by student count and take the top 10
    return courses
      .map(c => ({
        name: c.name || 'Untitled Course',
        students: c.students?.length || 0,
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 10);
  }, [courses]);

  // --- CSV Data Preparation ---
  const csvData = useMemo(() => courses.map(course => ({
    ID: course._id,
    Name: course.name,
    Students: course.students ? course.students.length : 0,
    Batches: course.batches ? course.batches.length : 0,
    CompletionRate: course.completionRate ? `${(course.completionRate * 100).toFixed(0)}%` : 'N/A',
    CreatedAt: course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'
  })), [courses]);

  const csvHeaders = [
    { label: 'ID', key: 'ID' },
    { label: 'Name', key: 'Name' },
    { label: 'Total Students', key: 'Students' },
    { label: 'Total Batches', key: 'Batches' },
    { label: 'Avg. Completion Rate', key: 'CompletionRate' },
    { label: 'Created At', key: 'CreatedAt' }
  ];

  // --- Loading State ---
  if (loading || courses.length === 0) {
    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="h-80 bg-gray-100 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
  }

  // --- Custom Tooltip (Reused Simple Design) ---
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

  // --- Main Component Render ---
  return (
    <div className="min-h-screen bg-white p-8 text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header and Export */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">
              Course Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <BookOpen className="w-4 h-4 text-teal-600" />
              Detailed metrics on course creation, enrollment, and engagement.
            </p>
          </div>
          <CSVLink
            data={csvData}
            headers={csvHeaders}
            filename={`course-reports-${new Date().toISOString().split('T')[0]}.csv`}
            className="inline-flex items-center gap-2 bg-teal-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition duration-300 shadow-md"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </CSVLink>
        </div>

        {/* Filters Section */}
        <div className="flex justify-start items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
            <Filter className="w-4 h-4 text-teal-600" />
            Course Creation Trend:
          </div>
          <div className="flex flex-wrap gap-2">
            {['day', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setFilter(period)}
                className={`px-4 py-1.5 text-sm rounded-md transition duration-200 ${
                  filter === period
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 12 {period.charAt(0).toUpperCase() + period.slice(1)}s
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards (Flat and Simple) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { title: 'Total Courses', value: summaryData.totalCourses, icon: BookOpen, color: 'text-gray-600', bg: 'bg-gray-100' },
            { title: 'Total Students', value: summaryData.totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
            { title: 'Active Batches', value: summaryData.totalBatches, icon: Play, color: 'text-amber-500', bg: 'bg-amber-50' },
            { title: 'Avg. Completion', value: `${summaryData.avgCompletion}%`, icon: Award, color: 'text-teal-600', bg: 'bg-teal-50' },
          ].map((item, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{item.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{item.value}</p>
                </div>
                <div className={`p-2 rounded-full ${item.bg}`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* 1. Course Creation & Enrollment Trend */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600"/>
              Course & Enrollment Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey={filter === 'day' ? 'date' : 'month'}
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }} 
                  tickLine={false} 
                />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: COURSE_COLORS.Total }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: COURSE_COLORS.Students }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                
                {/* Total Courses (Left Y-Axis) */}
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="total" 
                  name="New Courses"
                  stroke={COURSE_COLORS.Total} 
                  strokeWidth={2}
                  dot={false}
                />
                
                {/* Total Students (Right Y-Axis) */}
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="students" 
                  name="New Students" 
                  stroke={COURSE_COLORS.Students} 
                  strokeWidth={2} 
                  dot={false} 
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 2. Top 10 Course Enrollment */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600"/>
              Top 10 Course Enrollment
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={studentEnrollmentData} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 11, fill: '#6b7280' }} 
                  width={120} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip formatter={(value) => [value, 'Students']} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}/>
                <Bar dataKey="students" name="Students Enrolled" fill={COURSE_COLORS.Students} barSize={15} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default CourseReports;