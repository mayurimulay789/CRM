import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSVLink } from 'react-csv';
import {
  Download,
  Filter,
  Users,
  Play,
  Clock,
  BookOpen,
  Award,
  Calendar,
  User,
  Shield,
  RefreshCw,
  PieChart,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { fetchAllDemoReports, clearDemoReportError } from '../../../store/slices/demoReportSlice';

const DEMO_COLORS = {
  Total: '#0d9488',
  Students: '#3b82f6',
  Conversions: '#f59e0b',
  Online: '#3b82f6',
  Offline: '#10b981',
  'One-to-One': '#8b5cf6',
  Live: '#f59e0b',
};

const PIECOLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

const DemoReport = () => {
  const dispatch = useDispatch();
  const { demos, loading, error } = useSelector((state) => state.demoReports);
  const { user } = useSelector((state) => state.auth);
  
  const [dateRange, setDateRange] = useState('month');
  const [chartData, setChartData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isCounsellor = user?.role === 'counsellor';

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAllDemoReports());
  }, [dispatch]);

  // Refresh data function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchAllDemoReports());
    setIsRefreshing(false);
  };

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearDemoReportError());
    };
  }, [dispatch]);

  // Process data when demos or dateRange changes
  useEffect(() => {
    if (demos.length > 0) {
      processData();
    } else {
      setChartData([]);
    }
  }, [demos, dateRange]);

  const processData = () => {
    const now = new Date();
    const data = [];

    const filterByDate = (start, end) => {
      return demos.filter(demo => {
        try {
          const demoDate = new Date(demo.createdAt || demo.date || demo.scheduledAt || demo.startTime || Date.now());
          return !isNaN(demoDate) && demoDate >= start && demoDate <= end;
        } catch (error) {
          console.warn('Invalid date for demo:', demo);
          return false;
        }
      });
    };

    if (dateRange === 'day') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStart = new Date(date);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);

        const dayDemos = filterByDate(dateStart, dateEnd);

        data.push({
          period: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
          total: dayDemos.length,
          students: dayDemos.reduce((sum, demo) => {
            const students = Array.isArray(demo.registeredStudents) ? demo.registeredStudents.length : 
                           demo.students ? (Array.isArray(demo.students) ? demo.students.length : 1) : 
                           demo.attendees ? (Array.isArray(demo.attendees) ? demo.attendees.length : 1) : 0;
            return sum + students;
          }, 0),
          conversions: dayDemos.reduce((sum, demo) => {
            const conversions = Array.isArray(demo.convertedStudents) ? demo.convertedStudents.length : 
                              demo.conversions ? (Array.isArray(demo.conversions) ? demo.conversions.length : 1) : 
                              demo.converted ? 1 : 0;
            return sum + conversions;
          }, 0),
        });
      }
    } else if (dateRange === 'week') {
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7) - 6);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekDemos = filterByDate(weekStart, weekEnd);

        data.push({
          period: `W${12 - i}`,
          total: weekDemos.length,
          students: weekDemos.reduce((sum, demo) => {
            const students = Array.isArray(demo.registeredStudents) ? demo.registeredStudents.length : 
                           demo.students ? (Array.isArray(demo.students) ? demo.students.length : 1) : 
                           demo.attendees ? (Array.isArray(demo.attendees) ? demo.attendees.length : 1) : 0;
            return sum + students;
          }, 0),
          conversions: weekDemos.reduce((sum, demo) => {
            const conversions = Array.isArray(demo.convertedStudents) ? demo.convertedStudents.length : 
                              demo.conversions ? (Array.isArray(demo.conversions) ? demo.conversions.length : 1) : 
                              demo.converted ? 1 : 0;
            return sum + conversions;
          }, 0),
        });
      }
    } else if (dateRange === 'month') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        const monthDemos = filterByDate(monthStart, monthEnd);

        data.push({
          period: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          total: monthDemos.length,
          students: monthDemos.reduce((sum, demo) => {
            const students = Array.isArray(demo.registeredStudents) ? demo.registeredStudents.length : 
                           demo.students ? (Array.isArray(demo.students) ? demo.students.length : 1) : 
                           demo.attendees ? (Array.isArray(demo.attendees) ? demo.attendees.length : 1) : 0;
            return sum + students;
          }, 0),
          conversions: monthDemos.reduce((sum, demo) => {
            const conversions = Array.isArray(demo.convertedStudents) ? demo.convertedStudents.length : 
                              demo.conversions ? (Array.isArray(demo.conversions) ? demo.conversions.length : 1) : 
                              demo.converted ? 1 : 0;
            return sum + conversions;
          }, 0),
        });
      }
    }

    setChartData(data);
  };

  // Calculate summary data
  const summaryData = useMemo(() => {
    const totalDemos = demos.length;
    
    const totalStudents = demos.reduce((sum, demo) => {
      const students = Array.isArray(demo.registeredStudents) ? demo.registeredStudents.length : 
                     demo.students ? (Array.isArray(demo.students) ? demo.students.length : 1) : 
                     demo.attendees ? (Array.isArray(demo.attendees) ? demo.attendees.length : 1) : 0;
      return sum + students;
    }, 0);
    
    const totalConversions = demos.reduce((sum, demo) => {
      const conversions = Array.isArray(demo.convertedStudents) ? demo.convertedStudents.length : 
                        demo.conversions ? (Array.isArray(demo.conversions) ? demo.conversions.length : 1) : 
                        demo.converted ? 1 : 0;
      return sum + conversions;
    }, 0);
    
    const conversionRate = totalStudents > 0 ? (totalConversions / totalStudents) * 100 : 0;

    // Calculate demo types
    const demoTypes = {
      online: demos.filter(demo => demo.type === 'online' || demo.demoType === 'online').length,
      offline: demos.filter(demo => demo.type === 'offline' || demo.demoType === 'offline').length,
      oneToOne: demos.filter(demo => demo.type === 'one-to-one' || demo.demoType === 'one-to-one').length,
      live: demos.filter(demo => demo.type === 'live' || demo.demoType === 'live').length,
    };

    // Calculate status distribution
    const statusDistribution = {
      scheduled: demos.filter(demo => demo.status === 'scheduled' || demo.status === 'upcoming').length,
      completed: demos.filter(demo => demo.status === 'completed' || demo.status === 'done').length,
      cancelled: demos.filter(demo => demo.status === 'cancelled' || demo.status === 'canceled').length,
      ongoing: demos.filter(demo => demo.status === 'ongoing' || demo.status === 'in-progress').length,
    };

    return {
      totalDemos,
      totalStudents,
      totalConversions,
      conversionRate: conversionRate.toFixed(1),
      demoTypes,
      statusDistribution,
    };
  }, [demos]);

  // Prepare top demo enrollment data
  const topDemoEnrollment = useMemo(() => 
    demos
      .map(demo => ({
        name: demo.title || demo.name || demo.courseName || 'Untitled Demo',
        students: Array.isArray(demo.registeredStudents) ? demo.registeredStudents.length : 
                 demo.students ? (Array.isArray(demo.students) ? demo.students.length : 1) : 
                 demo.attendees ? (Array.isArray(demo.attendees) ? demo.attendees.length : 1) : 0,
        type: demo.type || demo.demoType || 'unknown',
        conversions: Array.isArray(demo.convertedStudents) ? demo.convertedStudents.length : 
                    demo.conversions ? (Array.isArray(demo.conversions) ? demo.conversions.length : 1) : 
                    demo.converted ? 1 : 0,
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 10), 
    [demos]
  );

  // Prepare demo type data for pie chart
  const demoTypeData = useMemo(() => {
    return Object.entries(summaryData.demoTypes)
      .map(([type, count], index) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' '),
        value: count,
        color: PIECOLORS[index % PIECOLORS.length]
      }))
      .filter(item => item.value > 0);
  }, [summaryData.demoTypes]);

  // Prepare status distribution data
  const statusData = useMemo(() => {
    return Object.entries(summaryData.statusDistribution)
      .map(([status, count], index) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: PIECOLORS[index % PIECOLORS.length]
      }))
      .filter(item => item.value > 0);
  }, [summaryData.statusDistribution]);

  // Prepare CSV data
  const csvData = useMemo(() => 
    demos.map(demo => {
      const students = Array.isArray(demo.registeredStudents) ? demo.registeredStudents.length : 
                     demo.students ? (Array.isArray(demo.students) ? demo.students.length : 1) : 
                     demo.attendees ? (Array.isArray(demo.attendees) ? demo.attendees.length : 1) : 0;
      
      const conversions = Array.isArray(demo.convertedStudents) ? demo.convertedStudents.length : 
                        demo.conversions ? (Array.isArray(demo.conversions) ? demo.conversions.length : 1) : 
                        demo.converted ? 1 : 0;

      return {
        ID: demo._id || demo.id || 'N/A',
        Title: demo.title || demo.name || demo.courseName || 'Untitled Demo',
        Type: demo.type || demo.demoType || 'Unknown',
        Students: students,
        Conversions: conversions,
        Status: demo.status || 'Unknown',
        Counsellor: demo.counsellorName || demo.assignedCounsellorName || 'Not Assigned',
        CreatedAt: demo.createdAt ? new Date(demo.createdAt).toLocaleDateString() : 
                  demo.date ? new Date(demo.date).toLocaleDateString() : 
                  demo.scheduledAt ? new Date(demo.scheduledAt).toLocaleDateString() : 'N/A',
      };
    }), 
    [demos]
  );

  const csvHeaders = [
    { label: 'ID', key: 'ID' },
    { label: 'Title', key: 'Title' },
    { label: 'Type', key: 'Type' },
    { label: 'Students Registered', key: 'Students' },
    { label: 'Conversions', key: 'Conversions' },
    { label: 'Status', key: 'Status' },
    ...(isAdmin ? [{ label: 'Counsellor', key: 'Counsellor' }] : []),
    { label: 'Created At', key: 'CreatedAt' },
  ];

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 text-sm">
          <p className="font-semibold mb-1 text-gray-700">{label}</p>
          {payload.map((p, index) => (
            <p key={index} style={{ color: p.color }}>
              {p.name}: <span className="font-bold">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Pie Chart Tooltip
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 text-sm">
          <p className="font-semibold text-gray-700">{payload[0].name}</p>
          <p style={{ color: payload[0].color }}>
            Count: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading State
  if (loading && demos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
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

  // Error State
  if (error && demos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">Error loading demo reports</div>
            <div className="text-gray-500 mb-4">{error}</div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header and Export */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 mb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold text-gray-800">
                Demo Analytics Dashboard
              </h1>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {isAdmin ? 'Admin' : 'Counsellor'}
              </div>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              {isAdmin 
                ? 'Comprehensive metrics on all demo sessions, registrations, and conversions.' 
                : 'Your demo session performance and student engagement metrics.'
              }
              {demos.length > 0 && (
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {demos.length} demos found
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="inline-flex items-center gap-2 bg-white text-gray-700 text-sm px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition duration-300 border border-gray-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename={`demo-reports-${user?.role}-${new Date().toISOString().split('T')[0]}.csv`}
              className="inline-flex items-center gap-2 bg-teal-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition duration-300 shadow-md"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </CSVLink>
          </div>
        </div>

        {/* Error Banner */}
        {error && demos.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-600 text-sm">Error: {error}</span>
              </div>
              <button
                onClick={() => dispatch(clearDemoReportError())}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
            <Filter className="w-4 h-4 text-teal-600" />
            Time Period:
          </div>
          <div className="flex flex-wrap gap-2">
            {['day', 'week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setDateRange(period)}
                disabled={loading}
                className={`px-4 py-1.5 text-sm rounded-md transition duration-200 ${
                  dateRange === period
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                } disabled:opacity-50`}
              >
                {period === 'day' && 'Last 30 Days'}
                {period === 'week' && 'Last 12 Weeks'}
                {period === 'month' && 'Last 12 Months'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              title: 'Total Demos', 
              value: summaryData.totalDemos, 
              icon: Play, 
              color: 'text-gray-600', 
              bg: 'bg-gray-100',
              description: isAdmin ? 'All demo sessions' : 'Your demo sessions'
            },
            { 
              title: 'Total Students', 
              value: summaryData.totalStudents, 
              icon: Users, 
              color: 'text-blue-500', 
              bg: 'bg-blue-50',
              description: 'Registered students'
            },
            { 
              title: 'Conversions', 
              value: summaryData.totalConversions, 
              icon: Award, 
              color: 'text-amber-500', 
              bg: 'bg-amber-50',
              description: 'Successful conversions'
            },
            { 
              title: 'Conversion Rate', 
              value: `${summaryData.conversionRate}%`, 
              icon: Award, 
              color: 'text-teal-600', 
              bg: 'bg-teal-50',
              description: 'Conversion percentage'
            },
          ].map((item, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{item.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{item.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                </div>
                <div className={`p-2 rounded-full ${item.bg}`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Type and Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Demo Type Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600"/>
              Demo Type Distribution
            </h3>
            {demoTypeData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={demoTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {demoTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                No demo type data available
              </div>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-600"/>
              Demo Status Distribution
            </h3>
            {statusData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                No status data available
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Demo & Registration Trend */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600"/>
              Demo & Registration Trend
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="period"
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }} 
                    tickLine={false} 
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: DEMO_COLORS.Total }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: DEMO_COLORS.Students }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                  
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="total" 
                    name="Demos Scheduled"
                    stroke={DEMO_COLORS.Total} 
                    strokeWidth={2}
                    dot={false}
                  />
                  
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="students" 
                    name="Students Registered" 
                    stroke={DEMO_COLORS.Students} 
                    strokeWidth={2} 
                    dot={false} 
                  />

                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="conversions" 
                    name="Conversions" 
                    stroke={DEMO_COLORS.Conversions} 
                    strokeWidth={2} 
                    dot={false} 
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                No trend data available for the selected period
              </div>
            )}
          </div>

          {/* Top Demo Registration */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600"/>
              Top Demo Registration
            </h3>
            {topDemoEnrollment.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={topDemoEnrollment} 
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
                  <Tooltip 
                    formatter={(value) => [value, 'Students']} 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <Bar 
                    dataKey="students" 
                    name="Students Registered" 
                    fill={DEMO_COLORS.Students} 
                    barSize={15} 
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                No demo enrollment data available
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {demos.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Demo Data Available</h3>
            <p className="text-gray-500 mb-6">
              {isAdmin 
                ? 'There are no demo sessions in the system yet.' 
                : 'You have not conducted any demo sessions yet.'
              }
            </p>
            <button
              onClick={handleRefresh}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition duration-300"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoReport;