import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSVLink } from 'react-csv';
import {
  Download,
  Filter,
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  Activity,
  Mail,
  UserCheck,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import { fetchAdmissions } from '../../../store/slices/admissionSlice';

// Color scheme for charts
const ADMISSION_COLORS = {
  total: '#0d9488',      // Teal
  approved: '#10b981',   // Green
  pending: '#f59e0b',    // Amber
  rejected: '#ef4444',   // Red
  waiting_list: '#8b5cf6', // Purple
  students: '#3b82f6',   // Blue
  courses: '#f97316'     // Orange
};

const AdmissionReport = () => {
  const dispatch = useDispatch();
  
  // FIXED: Correct Redux selector that matches your slice structure
  const admissionState = useSelector((state) => state.admissions);
  const { admissions, loading, error } = admissionState || { 
    admissions: [], 
    loading: false, 
    error: null 
  };
  
  const [filter, setFilter] = useState('month');
  const [chartData, setChartData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  // FIXED: Conditionally fetch admissions data with better error handling
  useEffect(() => {
    const loadAdmissions = async () => {
      // Only fetch if we don't have data and aren't already loading
      if (!dataLoaded && (!admissions || admissions.length === 0) && !loading && !localLoading) {
        setLocalLoading(true);
        try {
          console.log('Fetching admissions data...');
          await dispatch(fetchAdmissions()).unwrap();
          setDataLoaded(true);
        } catch (err) {
          console.error('Failed to fetch admissions:', err);
        } finally {
          setLocalLoading(false);
        }
      }
    };

    loadAdmissions();
  }, [dispatch, dataLoaded, admissions, loading, localLoading]);

  // Process data when admissions or filter changes
  useEffect(() => {
    if (admissions && admissions.length > 0) {
      console.log('Processing data for', admissions.length, 'admissions');
      processData();
    } else {
      setChartData([]);
    }
  }, [admissions, filter]);

  const processData = () => {
    const now = new Date();
    const data = [];

    const filterAdmissionsByDate = (startDate, endDate) => {
      return admissions.filter(admission => {
        // FIXED: Handle different date field names
        const admissionDate = new Date(admission.admissionDate || admission.createdAt || admission.date);
        return admissionDate >= startDate && admissionDate <= endDate;
      });
    };

    if (filter === 'day') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(23, 59, 59, 999);
        const dateStart = new Date(date);
        dateStart.setHours(0, 0, 0, 0);

        const dayAdmissions = filterAdmissionsByDate(dateStart, date);

        data.push({
          date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
          total: dayAdmissions.length,
          approved: dayAdmissions.filter(a => a.status === 'approved' || a.status === 'Approved').length,
          pending: dayAdmissions.filter(a => a.status === 'pending' || a.status === 'Pending').length,
          rejected: dayAdmissions.filter(a => a.status === 'rejected' || a.status === 'Rejected').length,
          waiting_list: dayAdmissions.filter(a => a.status === 'waiting_list' || a.status === 'waiting' || a.status === 'Waiting List').length,
        });
      }
    } else if (filter === 'month') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        const monthAdmissions = filterAdmissionsByDate(monthStart, monthEnd);

        data.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          total: monthAdmissions.length,
          approved: monthAdmissions.filter(a => a.status === 'approved' || a.status === 'Approved').length,
          pending: monthAdmissions.filter(a => a.status === 'pending' || a.status === 'Pending').length,
          rejected: monthAdmissions.filter(a => a.status === 'rejected' || a.status === 'Rejected').length,
          waiting_list: monthAdmissions.filter(a => a.status === 'waiting_list' || a.status === 'waiting' || a.status === 'Waiting List').length,
        });
      }
    }

    setChartData(data);
  };

  // Retry fetching data
  const handleRetry = () => {
    setDataLoaded(false);
    setLocalLoading(false);
    dispatch(fetchAdmissions());
  };

  // Calculate summary statistics - IMPROVED with better field mapping
  const summaryData = useMemo(() => {
    if (!admissions || admissions.length === 0) {
      return {
        totalAdmissions: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        waitingList: 0,
        emailVerified: 0,
        conversionRate: 0,
        totalCourses: 0,
        topCounsellor: 'N/A',
        topBranch: 'N/A'
      };
    }

    console.log('Calculating summary for', admissions.length, 'admissions');
    
    const totalAdmissions = admissions.length;
    const approved = admissions.filter(a => a.status === 'approved' || a.status === 'Approved').length;
    const pending = admissions.filter(a => a.status === 'pending' || a.status === 'Pending').length;
    const rejected = admissions.filter(a => a.status === 'rejected' || a.status === 'Rejected').length;
    const waitingList = admissions.filter(a => a.status === 'waiting_list' || a.status === 'waiting' || a.status === 'Waiting List').length;
    
    // FIXED: Handle different email verification field names
    const emailVerified = admissions.filter(a => 
      a.emailVerified || a.isEmailVerified || a.email_verified
    ).length;
    
    // Calculate conversion rate (approved / total)
    const conversionRate = totalAdmissions > 0 ? (approved / totalAdmissions) * 100 : 0;

    // Get unique courses count - handle different course field structures
    const uniqueCourses = new Set();
    admissions.forEach(admission => {
      if (admission.course) {
        if (typeof admission.course === 'object') {
          uniqueCourses.add(admission.course._id || admission.course.id || admission.course.name);
        } else {
          uniqueCourses.add(admission.course);
        }
      }
    });
    
    // Find top counsellor - handle different counsellor field names
    const counsellorCount = admissions.reduce((acc, admission) => {
      const counsellor = admission.counsellor || admission.counselor || admission.assignedCounsellor || 'Unknown';
      acc[counsellor] = (acc[counsellor] || 0) + 1;
      return acc;
    }, {});
    
    const topCounsellor = Object.entries(counsellorCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Find top training branch - handle different branch field names
    const branchCount = admissions.reduce((acc, admission) => {
      const branch = admission.trainingBranch || admission.branch || admission.training_branch || 'Unknown';
      acc[branch] = (acc[branch] || 0) + 1;
      return acc;
    }, {});
    
    const topBranch = Object.entries(branchCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalAdmissions,
      approved,
      pending,
      rejected,
      waitingList,
      emailVerified,
      conversionRate: conversionRate.toFixed(1),
      totalCourses: uniqueCourses.size,
      topCounsellor,
      topBranch
    };
  }, [admissions]);

  // Prepare status distribution data for pie chart
  const statusData = useMemo(() => [
    { name: 'Approved', value: summaryData.approved, color: ADMISSION_COLORS.approved },
    { name: 'Pending', value: summaryData.pending, color: ADMISSION_COLORS.pending },
    { name: 'Rejected', value: summaryData.rejected, color: ADMISSION_COLORS.rejected },
    { name: 'Waiting List', value: summaryData.waitingList, color: ADMISSION_COLORS.waiting_list },
  ].filter(item => item.value > 0), [summaryData]);

  // Prepare counsellor performance data
  const counsellorData = useMemo(() => {
    if (!admissions || admissions.length === 0) return [];
    
    const counsellorStats = admissions.reduce((acc, admission) => {
      const counsellor = admission.counsellor || admission.counselor || admission.assignedCounsellor || 'Unknown';
      if (!acc[counsellor]) {
        acc[counsellor] = { total: 0, approved: 0 };
      }
      acc[counsellor].total++;
      if (admission.status === 'approved' || admission.status === 'Approved') {
        acc[counsellor].approved++;
      }
      return acc;
    }, {});

    return Object.entries(counsellorStats)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        approved: stats.approved,
        conversionRate: stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [admissions]);

  // Prepare branch distribution data
  const branchData = useMemo(() => {
    if (!admissions || admissions.length === 0) return [];
    
    const branchStats = admissions.reduce((acc, admission) => {
      const branch = admission.trainingBranch || admission.branch || admission.training_branch || 'Unknown';
      acc[branch] = (acc[branch] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(branchStats)
      .map(([branch, count]) => ({ branch, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [admissions]);

  // Prepare CSV data for export - IMPROVED with better field mapping
  const csvData = useMemo(() => {
    if (!admissions || admissions.length === 0) return [];
    
    return admissions.map(admission => ({
      'Admission No': admission.admissionNo || admission.admissionNumber || admission.id || 'N/A',
      'Student Name': admission.student?.name || admission.studentName || admission.name || 'N/A',
      'Student ID': admission.student?.studentId || admission.studentId || admission.studentID || 'N/A',
      'Course': admission.course?.name || admission.courseName || admission.course || 'N/A',
      'Course Code': admission.course?.code || admission.courseCode || 'N/A',
      'Training Branch': admission.trainingBranch || admission.branch || admission.training_branch || 'N/A',
      'Counsellor': admission.counsellor || admission.counselor || admission.assignedCounsellor || 'N/A',
      'Status': admission.status || 'N/A',
      'Priority': admission.priority || 'N/A',
      'Email Verified': (admission.emailVerified || admission.isEmailVerified || admission.email_verified) ? 'Yes' : 'No',
      'Admission Date': admission.admissionDate ? new Date(admission.admissionDate).toLocaleDateString() : 'N/A',
      'Applied Batch': admission.appliedBatch || admission.batch || 'N/A',
      'Source': admission.source || 'N/A',
      'Notes': admission.notes || 'N/A'
    }));
  }, [admissions]);

  const csvHeaders = [
    { label: 'Admission No', key: 'Admission No' },
    { label: 'Student Name', key: 'Student Name' },
    { label: 'Student ID', key: 'Student ID' },
    { label: 'Course', key: 'Course' },
    { label: 'Course Code', key: 'Course Code' },
    { label: 'Training Branch', key: 'Training Branch' },
    { label: 'Counsellor', key: 'Counsellor' },
    { label: 'Status', key: 'Status' },
    { label: 'Priority', key: 'Priority' },
    { label: 'Email Verified', key: 'Email Verified' },
    { label: 'Admission Date', key: 'Admission Date' },
    { label: 'Applied Batch', key: 'Applied Batch' },
    { label: 'Source', key: 'Source' },
    { label: 'Notes', key: 'Notes' }
  ];

  // Custom Tooltip Component
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

  // Combined loading state
  const isLoading = loading || localLoading;

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">Failed to Load Data</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {error || 'An error occurred while fetching admission data. Please try again.'}
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading && (!admissions || admissions.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="animate-pulse">
                <div className="h-10 bg-gray-300 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-80"></div>
              </div>
              <div className="h-12 bg-gray-300 rounded w-40 animate-pulse"></div>
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/20 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="flex gap-3">
              <div className="h-10 bg-gray-300 rounded w-32"></div>
              <div className="h-10 bg-gray-300 rounded w-32"></div>
            </div>
          </div>

          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (!admissions || admissions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">No Admission Data Available</h2>
            <p className="text-gray-500 mb-4">There are no admissions in the system yet.</p>
            <p className="text-gray-400 text-sm mb-6">Create some admissions to see analytics and reports here.</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              Check for New Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Admission Report
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                {admissions.length} admissions found • Comprehensive tracking and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating...
                </div>
              )}
              <CSVLink
                data={csvData}
                headers={csvHeaders}
                filename={`admission-reports-${new Date().toISOString().split('T')[0]}.csv`}
                className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-all duration-200 shadow hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </CSVLink>
            </div>
          </div>
        </div>

        {/* Rest of your component remains the same */}
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Filter className="w-4 h-4" />
              Filter by:
            </div>
            <div className="flex flex-wrap gap-2">
              {['day', 'month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setFilter(period)}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm ${
                    filter === period
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  Last 12 {period === 'day' ? 'Days' : 'Months'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { 
              title: 'Total Admissions', 
              value: summaryData.totalAdmissions, 
              icon: BookOpen, 
              color: 'text-blue-600', 
              bg: 'bg-blue-50',
              description: 'All time admissions'
            },
            { 
              title: 'Approved', 
              value: summaryData.approved, 
              icon: CheckCircle, 
              color: 'text-green-600', 
              bg: 'bg-green-50',
              description: 'Successful admissions'
            },
            { 
              title: 'Conversion Rate', 
              value: `${summaryData.conversionRate}%`, 
              icon: TrendingUp, 
              color: 'text-purple-600', 
              bg: 'bg-purple-50',
              description: 'Approval success rate'
            },
            { 
              title: 'Email Verified', 
              value: summaryData.emailVerified, 
              icon: Mail, 
              color: 'text-orange-600', 
              bg: 'bg-orange-50',
              description: 'Verified students'
            },
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{item.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                </div>
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Distribution Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { status: 'Pending', count: summaryData.pending, color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
            { status: 'Waiting List', count: summaryData.waitingList, color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Users },
            { status: 'Rejected', count: summaryData.rejected, color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
            { status: 'Total Courses', count: summaryData.totalCourses, color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Award },
          ].map((item, index) => (
            <div key={index} className={`p-3 rounded-lg border text-center ${item.color}`}>
              <item.icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-lg font-bold">{item.count}</div>
              <div className="text-xs font-medium">{item.status}</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          
          {/* Admission Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Admission Trend ({filter.charAt(0).toUpperCase() + filter.slice(1)})
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={filter === 'month' ? 'month' : 'date'}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  name="Total Admissions" 
                  stroke={ADMISSION_COLORS.total} 
                  fill={ADMISSION_COLORS.total}
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="approved" 
                  name="Approved" 
                  stroke={ADMISSION_COLORS.approved} 
                  fill={ADMISSION_COLORS.approved}
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="pending" 
                  name="Pending" 
                  stroke={ADMISSION_COLORS.pending} 
                  fill={ADMISSION_COLORS.pending}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              Admission Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Admissions']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          
          {/* Counsellor Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-500" />
              Top Counsellors Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={counsellorData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'conversionRate') return [`${value}%`, 'Conversion Rate'];
                    return [value, name === 'approved' ? 'Approved' : 'Total'];
                  }}
                />
                <Bar dataKey="total" name="Total" fill={ADMISSION_COLORS.total} barSize={20} />
                <Bar dataKey="approved" name="Approved" fill={ADMISSION_COLORS.approved} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Branch Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              Admissions by Training Branch
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="branch" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Admissions" fill={ADMISSION_COLORS.courses} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Counsellor</h3>
            <div className="text-center py-6">
              <UserCheck className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <div className="text-xl font-bold text-gray-900">{summaryData.topCounsellor}</div>
              <div className="text-sm text-gray-500 mt-1">Highest admission count</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Training Branch</h3>
            <div className="text-center py-6">
              <Award className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <div className="text-xl font-bold text-gray-900">{summaryData.topBranch}</div>
              <div className="text-sm text-gray-500 mt-1">Most popular branch</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdmissionReport;