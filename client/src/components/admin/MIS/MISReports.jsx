import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBatches } from '../../../store/slices/batchSlice';

const MISReports = () => {
  const dispatch = useDispatch();
  const { batches, loading } = useSelector((state) => state.batch);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    dispatch(getBatches());
  }, [dispatch]);

  // Calculate Key Metrics
  const calculateMetrics = () => {
    if (!batches || batches.length === 0) {
      return {
        totalBatches: 0,
        activeBatches: 0,
        upcomingBatches: 0,
        runningBatches: 0,
        closedBatches: 0,
        totalStudents: 0,
        totalTrainers: new Set(batches.map(b => b.trainer)).size,
        completionRate: 0,
        avgStudentsPerBatch: 0,
      };
    }

    const totalBatches = batches.length;
    const upcomingBatches = batches.filter(b => b.status === 'Upcoming').length;
    const runningBatches = batches.filter(b => b.status === 'Running').length;
    const closedBatches = batches.filter(b => b.status === 'Closed').length;
    const activeBatches = upcomingBatches + runningBatches;
    const totalStudents = batches.reduce((sum, b) => sum + (b.studentsActive || 0), 0);
    const totalTrainers = new Set(batches.map(b => b.trainer)).size;
    const completionRate = totalBatches > 0 ? ((closedBatches / totalBatches) * 100).toFixed(1) : 0;
    const avgStudentsPerBatch = totalBatches > 0 ? (totalStudents / totalBatches).toFixed(1) : 0;

    return {
      totalBatches,
      activeBatches,
      upcomingBatches,
      runningBatches,
      closedBatches,
      totalStudents,
      totalTrainers,
      completionRate,
      avgStudentsPerBatch,
    };
  };

  const metrics = calculateMetrics();

  // Prepare chart data
  const batchStatusData = [
    { name: 'Upcoming', value: metrics.upcomingBatches, color: '#FBBF24' },
    { name: 'Running', value: metrics.runningBatches, color: '#10B981' },
    { name: 'Closed', value: metrics.closedBatches, color: '#3B82F6' },
  ];

  const batchTrendData = batches.reduce((acc, batch) => {
    const month = new Date(batch.startDate).toLocaleDateString('default', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.count += 1;
      existing.students += batch.studentsActive || 0;
    } else {
      acc.push({ month, count: 1, students: batch.studentsActive || 0 });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.month) - new Date(b.month));

  const courseDistribution = batches.reduce((acc, batch) => {
    const existing = acc.find(item => item.course === batch.course);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ course: batch.course || 'Unknown', count: 1 });
    }
    return acc;
  }, []);

  // Metric Card Component
  const MetricCard = ({ title, value, subtitle, icon, color }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">📊 MIS Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Management Information System Dashboard</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['overview', 'batches', 'students', 'courses', 'financial'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedMetric(tab)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
              selectedMetric === tab
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:shadow-md'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {selectedMetric === 'overview' && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Batches"
              value={metrics.totalBatches}
              subtitle="Active + Closed"
              icon="📚"
              color="border-blue-500"
            />
            <MetricCard
              title="Active Batches"
              value={metrics.activeBatches}
              subtitle="Upcoming + Running"
              icon="🚀"
              color="border-green-500"
            />
            <MetricCard
              title="Total Students"
              value={metrics.totalStudents}
              subtitle="Enrolled in batches"
              icon="👥"
              color="border-purple-500"
            />
            <MetricCard
              title="Completion Rate"
              value={`${metrics.completionRate}%`}
              subtitle={`${metrics.closedBatches} completed`}
              icon="✅"
              color="border-orange-500"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Batch Status Pie Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Batch Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={batchStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {batchStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Batch Trend */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Batch Enrollment Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={batchTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="students" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* BATCHES TAB */}
      {selectedMetric === 'batches' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Upcoming Batches"
              value={metrics.upcomingBatches}
              icon="📅"
              color="border-yellow-500"
            />
            <MetricCard
              title="Running Batches"
              value={metrics.runningBatches}
              icon="▶️"
              color="border-green-500"
            />
            <MetricCard
              title="Closed Batches"
              value={metrics.closedBatches}
              icon="✔️"
              color="border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Batch Status Bar Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Batch Status Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={batchStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Batch Details Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Batch Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Average Students/Batch</span>
                  <span className="text-xl font-bold text-indigo-600">{metrics.avgStudentsPerBatch}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Total Trainers</span>
                  <span className="text-xl font-bold text-indigo-600">{metrics.totalTrainers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Completion Rate</span>
                  <span className="text-xl font-bold text-indigo-600">{metrics.completionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* STUDENTS TAB */}
      {selectedMetric === 'students' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Total Enrolled"
              value={metrics.totalStudents}
              subtitle="Active students"
              icon="👨‍🎓"
              color="border-blue-500"
            />
            <MetricCard
              title="Avg per Batch"
              value={metrics.avgStudentsPerBatch}
              subtitle="Students per batch"
              icon="📊"
              color="border-green-500"
            />
            <MetricCard
              title="Active Batches"
              value={metrics.activeBatches}
              subtitle="With students"
              icon="✨"
              color="border-purple-500"
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Batches by Enrollment</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Batch Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Course</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Students</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batches
                    .sort((a, b) => (b.studentsActive || 0) - (a.studentsActive || 0))
                    .slice(0, 10)
                    .map(batch => (
                      <tr key={batch._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{batch.name}</td>
                        <td className="py-3 px-4 text-gray-600">{batch.course || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                            {batch.studentsActive || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            batch.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-800' :
                            batch.status === 'Running' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {batch.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* COURSES TAB */}
      {selectedMetric === 'courses' && (
        <>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Course Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={courseDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Courses Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseDistribution.map((item, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-gray-900">{item.course}</h4>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">{item.count} Batches</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* FINANCIAL TAB */}
      {selectedMetric === 'financial' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Total Batches"
              value={metrics.totalBatches}
              subtitle="For revenue calculation"
              icon="💰"
              color="border-green-500"
            />
            <MetricCard
              title="Active Revenue"
              value={`${metrics.activeBatches}`}
              subtitle="Active batches generating revenue"
              icon="💵"
              color="border-blue-500"
            />
            <MetricCard
              title="Students Enrolled"
              value={metrics.totalStudents}
              subtitle="Total paying students"
              icon="👥"
              color="border-purple-500"
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Summary</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-gray-700 font-medium">💳 Payment Methods</p>
                <p className="text-sm text-gray-600 mt-1">Track all payment modes and invoicing for students</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-gray-700 font-medium">📈 Revenue by Course</p>
                <p className="text-sm text-gray-600 mt-1">Analyze revenue generated from each course offering</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-gray-700 font-medium">📊 Outstanding Payments</p>
                <p className="text-sm text-gray-600 mt-1">Monitor pending invoices and payment status</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MISReports;
