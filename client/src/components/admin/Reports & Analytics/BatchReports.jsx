import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBatches } from '../../../store/slices/batchSlice';
import { CSVLink } from 'react-csv';
import {
  Download,
  TrendingUp,
  BookOpen,
  Clock,
  Play,
  CheckCircle,
  Filter,
  Calendar,
  Users,
  BarChart3,
  Activity
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

const BatchReports = () => {
  const dispatch = useDispatch();
  const { batches, loading } = useSelector((state) => state.batch);
  const [filter, setFilter] = useState('month');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (batches.length === 0 && !loading) {
      dispatch(getBatches());
    }
  }, [dispatch, batches.length, loading]);

  useEffect(() => {
    if (batches.length > 0) {
      processData();
    }
  }, [batches, filter]);

  const processData = () => {
    const now = new Date();
    let data = [];

    if (filter === 'day') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayBatches = batches.filter(batch => {
          const batchDate = new Date(batch.createdAt || batch.startDate);
          return batchDate.toISOString().split('T')[0] === dateStr;
        });

        data.push({
          date: date.toLocaleDateString(),
          total: dayBatches.length,
          upcoming: dayBatches.filter(b => b.status === 'Upcoming').length,
          running: dayBatches.filter(b => b.status === 'Running').length,
          closed: dayBatches.filter(b => b.status === 'Closed').length,
        });
      }
    } else if (filter === 'week') {
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekBatches = batches.filter(batch => {
          const batchDate = new Date(batch.createdAt || batch.startDate);
          return batchDate >= weekStart && batchDate <= weekEnd;
        });

        data.push({
          week: `Week ${12 - i}`,
          total: weekBatches.length,
          upcoming: weekBatches.filter(b => b.status === 'Upcoming').length,
          running: weekBatches.filter(b => b.status === 'Running').length,
          closed: weekBatches.filter(b => b.status === 'Closed').length,
        });
      }
    } else if (filter === 'month') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthBatches = batches.filter(batch => {
          const batchDate = new Date(batch.createdAt || batch.startDate);
          return batchDate >= monthStart && batchDate <= monthEnd;
        });

        data.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          total: monthBatches.length,
          upcoming: monthBatches.filter(b => b.status === 'Upcoming').length,
          running: monthBatches.filter(b => b.status === 'Running').length,
          closed: monthBatches.filter(b => b.status === 'Closed').length,
        });
      }
    } else if (filter === 'year') {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const yearStart = new Date(now.getFullYear() - i, 0, 1);
        const yearEnd = new Date(now.getFullYear() - i, 11, 31);

        const yearBatches = batches.filter(batch => {
          const batchDate = new Date(batch.createdAt || batch.startDate);
          return batchDate >= yearStart && batchDate <= yearEnd;
        });

        data.push({
          year: yearStart.getFullYear().toString(),
          total: yearBatches.length,
          upcoming: yearBatches.filter(b => b.status === 'Upcoming').length,
          running: yearBatches.filter(b => b.status === 'Running').length,
          closed: yearBatches.filter(b => b.status === 'Closed').length,
        });
      }
    }

    setChartData(data);
  };

  const statusData = [
    { name: 'Upcoming', value: batches.filter(b => b.status === 'Upcoming').length, color: '#fbbf24' },
    { name: 'Running', value: batches.filter(b => b.status === 'Running').length, color: '#10b981' },
    { name: 'Closed', value: batches.filter(b => b.status === 'Closed').length, color: '#3b82f6' },
  ];

  const courseData = batches.reduce((acc, batch) => {
    const course = batch.course || 'Unknown';
    acc[course] = (acc[course] || 0) + 1;
    return acc;
  }, {});

  const courseChartData = Object.entries(courseData).map(([course, count]) => ({
    course,
    count,
  }));

  // Prepare CSV data
  const csvData = batches.map(batch => ({
    ID: batch._id,
    Name: batch.name,
    Course: batch.course || 'Unknown',
    Status: batch.status,
    StartDate: batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A',
    EndDate: batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A',
    Students: batch.students ? batch.students.length : 0,
    Trainer: batch.trainer || 'N/A',
    CreatedAt: batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : 'N/A'
  }));

  const csvHeaders = [
    { label: 'ID', key: 'ID' },
    { label: 'Name', key: 'Name' },
    { label: 'Course', key: 'Course' },
    { label: 'Status', key: 'Status' },
    { label: 'Start Date', key: 'StartDate' },
    { label: 'End Date', key: 'EndDate' },
    { label: 'Students', key: 'Students' },
    { label: 'Trainer', key: 'Trainer' },
    { label: 'Created At', key: 'CreatedAt' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Batch Reports
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Real-time batch analytics and insights
              </p>
            </div>
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename={`batch-reports-${new Date().toISOString().split('T')[0]}.csv`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </CSVLink>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/20">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Filter className="w-5 h-5" />
              Filter by:
            </div>
            <div className="flex flex-wrap gap-3">
              {['day', 'week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setFilter(period)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                    filter === period
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Batches</p>
              <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {batches.filter(b => b.status === 'Upcoming').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">▶️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-bold text-gray-900">
                {batches.filter(b => b.status === 'Running').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-gray-900">
                {batches.filter(b => b.status === 'Closed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Time-based Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Batch Creation Trend ({filter.charAt(0).toUpperCase() + filter.slice(1)})
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={filter === 'year' ? 'year' : filter === 'month' ? 'month' : filter === 'week' ? 'week' : 'date'}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="total" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="upcoming" stackId="2" stroke="#fbbf24" fill="#fbbf24" />
              <Area type="monotone" dataKey="running" stackId="3" stroke="#10b981" fill="#10b981" />
              <Area type="monotone" dataKey="closed" stackId="4" stroke="#3b82f6" fill="#3b82f6" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Batch Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Batches by Course</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={courseChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="course" fontSize={12} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      </div>
    </div>
  );
};

export default BatchReports;
