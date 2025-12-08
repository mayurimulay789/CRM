import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdmissions } from '../../../store/slices/admissionSlice';
import { fetchPayments } from '../../../store/slices/paymentSlice';
import { fetchCourses } from '../../../store/slices/courseSlice';
import { getBatches } from '../../../store/slices/batchSlice';
import { fetchOnlineDemos } from '../../../store/slices/onlineDemoSlice';
import { fetchOfflineDemos } from '../../../store/slices/offlineDemoSlice';
import { fetchStudents } from '../../../store/slices/studentSlice';
import { getTrainers } from '../../../store/slices/trainerSlice';

const MISReports = () => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const admissions = useSelector(state => state.admissions?.admissions || []);
  const payments = useSelector(state => state.payments?.payments || []);
  const courses = useSelector(state => state.courses?.courses || []);
  const batches = useSelector(state => state.batch?.batches || []);
  const onlineDemos = useSelector(state => state.onlineDemo?.rows || []);
  const offlineDemos = useSelector(state => state.offlineDemo?.rows || []);
  const students = useSelector(state => state.students?.students || []);
  const trainers = useSelector(state => state.trainer?.trainers || []);

  useEffect(() => {
    dispatch(fetchAdmissions());
    dispatch(fetchPayments());
    dispatch(fetchCourses());
    dispatch(getBatches());
    dispatch(fetchOnlineDemos());
    dispatch(fetchOfflineDemos());
    dispatch(fetchStudents());
    dispatch(getTrainers());
  }, [dispatch]);

  // Filter data based on selected date - recalculates when selectedDate changes
  const filterByDate = (data, dateFields = ['createdAt']) => {
    if (!data || !Array.isArray(data)) return [];
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    return data.filter(item => {
      for (const field of dateFields) {
        const dateValue = item[field];
        if (dateValue) {
          const itemDate = new Date(dateValue);
          itemDate.setHours(0, 0, 0, 0);
          if (itemDate.getTime() === selected.getTime()) {
            return true;
          }
        }
      }
      return false;
    });
  };

  // Calculate counts using useMemo to recalculate when data or selectedDate changes
  const filteredData = useMemo(() => {
    const filteredAdmissions = filterByDate(admissions, ['admissionDate', 'createdAt', 'date']);
    const filteredPayments = filterByDate(payments, ['paymentDate', 'createdAt', 'date']);
    const filteredOnlineDemos = filterByDate(onlineDemos, ['demoDate', 'scheduledDate', 'createdAt', 'date']);
    const filteredOfflineDemos = filterByDate(offlineDemos, ['demoDate', 'scheduledDate', 'createdAt', 'date']);
    const filteredBatches = filterByDate(batches, ['startDate', 'createdAt', 'date']);
    const filteredStudents = filterByDate(students, ['registrationDate', 'createdAt', 'date']);

    return {
      totalAdmissions: filteredAdmissions.length,
      approvedAdmissions: filteredAdmissions.filter(a => a.status?.toLowerCase() === 'approved').length,
      totalPayment: filteredPayments.length,
      totalCourses: courses.length, // Total courses (not filtered by date)
      totalBatches: batches.length, // Total batches (not filtered by date)
      totalStudents: students.length, // Total students (not filtered by date)
      todayStudents: filteredStudents.length, // Students registered today
      totalTrainers: trainers.length, // Total trainers (not filtered by date)
      totalOnlineDemo: filteredOnlineDemos.length,
      totalOfflineDemo: filteredOfflineDemos.length,
      totalDemo: filteredOnlineDemos.length + filteredOfflineDemos.length,
      runningBatch: batches.filter(b => b.status?.toLowerCase() === 'running').length,
      upcomingBatch: batches.filter(b => b.status?.toLowerCase() === 'upcoming').length,
      closedBatch: batches.filter(b => b.status?.toLowerCase() === 'closed').length,
    };
  }, [admissions, payments, courses, batches, onlineDemos, offlineDemos, students, trainers, selectedDate]);

  const fields = [
    { name: 'Total-Admission', value: filteredData.totalAdmissions },
    { name: 'Today-Admission', value: filteredData.totalAdmissions },
    { name: 'Approved Admission', value: filteredData.approvedAdmissions },
    { name: 'Total Payment', value: filteredData.totalPayment },
    { name: 'Total Students', value: filteredData.totalStudents },
    { name: 'Today Students', value: filteredData.todayStudents },
    { name: 'Total Courses', value: filteredData.totalCourses },
    { name: 'Total Batches', value: filteredData.totalBatches },
    { name: 'Total Trainers', value: filteredData.totalTrainers },
    { name: 'Total Demo', value: filteredData.totalDemo },
    { name: 'Total Online Demo', value: filteredData.totalOnlineDemo },
    { name: 'Total Offline Demo', value: filteredData.totalOfflineDemo },
    { name: 'Total Running Batch', value: filteredData.runningBatch },
    { name: 'Total Upcoming Batch', value: filteredData.upcomingBatch },
    { name: 'Total Closed Batch', value: filteredData.closedBatch },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Date Filter Section */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Table Section */}
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-red-700 text-white">
                  <th className="px-4 py-2 text-left font-semibold border-r border-red-600">Name</th>
                  <th className="px-4 py-2 text-left font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {fields.map((row, idx) => (
                  <tr key={row.name} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700 border-r border-gray-200">{row.name}</td>
                    <td className="px-4 py-2 text-gray-900 font-medium">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MISReports;
