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
} from 'recharts';
import { fetchAllDemoReports } from '../../../store/slices/demoReportSlice';

const DEMO_COLORS = {
  Total: '#0d9488',
  Students: '#3b82f6',
  Conversions: '#f59e0b',
};

const DemoReport = () => {
  const dispatch = useDispatch();
  const { demos, loading, error } = useSelector((state) => state.demoReports);
  
  const [filter, setFilter] = useState('month');
  const [chartData, setChartData] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchAllDemoReports());
  }, [dispatch]);

  // Process data when demos or filter changes
  useEffect(() => {
    if (demos.length > 0) {
      processData();
    }
  }, [demos, filter]);

  const processData = () => {
    const now = new Date();
    const data = [];

    const filterByDate = (start, end) => {
      return demos.filter(demo => {
        const demoDate = new Date(demo.createdAt || demo.date || demo.scheduledAt || demo.startTime || Date.now());
        return demoDate >= start && demoDate <= end;
      });
    };

    if (filter === 'day') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(23, 59, 59, 999);
        const dateStart = new Date(date);
        dateStart.setHours(0, 0, 0, 0);

        const dayDemos = filterByDate(dateStart, date);

        data.push({
          date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
          total: dayDemos.length,
          students: dayDemos.reduce((sum, demo) => sum + (demo.registeredStudents?.length || demo.students?.length || demo.attendees?.length || 0), 0),
          conversions: dayDemos.reduce((sum, demo) => sum + (demo.convertedStudents?.length || demo.conversions?.length || 0), 0),
        });
      }
    } else if (filter === 'month') {
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        const monthDemos = filterByDate(monthStart, monthEnd);

        data.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          total: monthDemos.length,
          students: monthDemos.reduce((sum, demo) => sum + (demo.registeredStudents?.length || demo.students?.length || demo.attendees?.length || 0), 0),
          conversions: monthDemos.reduce((sum, demo) => sum + (demo.convertedStudents?.length || demo.conversions?.length || 0), 0),
        });
      }
    }

    setChartData(data);
  };

  // Calculate summary data
  const summaryData = useMemo(() => {
    const totalDemos = demos.length;
    const totalStudents = demos.reduce((sum, demo) => 
      sum + (demo.registeredStudents?.length || demo.students?.length || demo.attendees?.length || 0), 0);
    
    const totalConversions = demos.reduce((sum, demo) => 
      sum + (demo.convertedStudents?.length || demo.conversions?.length || 0), 0);
    
    const conversionRate = totalStudents > 0 ? (totalConversions / totalStudents) * 100 : 0;

    // Calculate demo types
    const demoTypes = {
      online: demos.filter(demo => demo.type === 'online' || demo.demoType === 'online').length,
      offline: demos.filter(demo => demo.type === 'offline' || demo.demoType === 'offline').length,
      oneToOne: demos.filter(demo => demo.type === 'one-to-one' || demo.demoType === 'one-to-one').length,
      live: demos.filter(demo => demo.type === 'live' || demo.demoType === 'live').length,
    };

    return {
      totalDemos,
      totalStudents,
      totalConversions,
      conversionRate: conversionRate.toFixed(1),
      demoTypes,
    };
  }, [demos]);

  // Prepare top demo enrollment data
  const topDemoEnrollment = useMemo(() => 
    demos
      .map(demo => ({
        name: demo.title || demo.name || demo.courseName || 'Untitled Demo',
        students: demo.registeredStudents?.length || demo.students?.length || demo.attendees?.length || 0,
        type: demo.type || demo.demoType || 'unknown'
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 10), 
    [demos]
  );

  // Prepare CSV data
  const csvData = useMemo(() => 
    demos.map(demo => ({
      ID: demo._id || demo.id,
      Title: demo.title || demo.name || 'Untitled Demo',
      Type: demo.type || demo.demoType || 'Unknown',
      Students: demo.registeredStudents?.length || demo.students?.length || demo.attendees?.length || 0,
      Conversions: demo.convertedStudents?.length || demo.conversions?.length || 0,
      Status: demo.status || 'Unknown',
      CreatedAt: demo.createdAt ? new Date(demo.createdAt).toLocaleDateString() : 
                  demo.date ? new Date(demo.date).toLocaleDateString() : 
                  demo.scheduledAt ? new Date(demo.scheduledAt).toLocaleDateString() : 'N/A',
    })), 
    [demos]
  );

  const csvHeaders = [
    { label: 'ID', key: 'ID' },
    { label: 'Title', key: 'Title' },
    { label: 'Type', key: 'Type' },
    { label: 'Students Registered', key: 'Students' },
    { label: 'Conversions', key: 'Conversions' },
    { label: 'Status', key: 'Status' },
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

  // Loading State
  if (loading) {
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

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">Error loading demo reports</div>
            <div className="text-gray-500 mb-4">{error}</div>
            <button
              onClick={() => dispatch(fetchAllDemoReports())}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition duration-300"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header and Export */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">
              Demo Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <BookOpen className="w-4 h-4 text-teal-600" />
              Comprehensive metrics on all demo sessions, registrations, and conversions.
            </p>
          </div>
          <CSVLink
            data={csvData}
            headers={csvHeaders}
            filename={`demo-reports-${new Date().toISOString().split('T')[0]}.csv`}
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
            Demo Trend:
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              title: 'Total Demos', 
              value: summaryData.totalDemos, 
              icon: Play, 
              color: 'text-gray-600', 
              bg: 'bg-gray-100',
              description: 'All demo sessions'
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
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
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

        {/* Demo Type Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600"/>
            Demo Type Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'Online', count: summaryData.demoTypes.online, color: 'bg-blue-100 text-blue-700' },
              { type: 'Offline', count: summaryData.demoTypes.offline, color: 'bg-green-100 text-green-700' },
              { type: 'One-to-One', count: summaryData.demoTypes.oneToOne, color: 'bg-purple-100 text-purple-700' },
              { type: 'Live Classes', count: summaryData.demoTypes.live, color: 'bg-orange-100 text-orange-700' },
            ].map((item, index) => (
              <div key={index} className={`p-4 rounded-lg text-center ${item.color}`}>
                <div className="text-2xl font-bold">{item.count}</div>
                <div className="text-sm font-medium">{item.type}</div>
              </div>
            ))}
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey={filter === 'day' ? 'date' : 'month'}
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
          </div>

          {/* Top 10 Demo Registration */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600"/>
              Top 10 Demo Registration
            </h3>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoReport;