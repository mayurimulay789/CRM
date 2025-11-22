import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchEnrollments,
  createEnrollment, 
  updateEnrollment,
  deleteEnrollmentByCounsellor,
  clearError,
  clearSuccess 
} from '../../../store/slices/enrollmentSlice';
import AdminEnrollmentForm from './EnrollmentForm';

const EnrollmentManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { 
    enrollments,
    loading, 
    error, 
    success
  } = useSelector(state => state.enrollments);
  
  const [showForm, setShowForm] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCounsellor, setSelectedCounsellor] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(7);

  // Refs for dropdown menus
  const filterMenuRef = useRef(null);
  const columnsMenuRef = useRef(null);
  const filterButtonRef = useRef(null);
  const columnsButtonRef = useRef(null);

  // Define all available columns
  const allColumns = [
    { key: 'enrollmentNo', label: 'Enrollment No', visible: true },
    { key: 'student', label: 'Student', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'phone', label: 'Phone', visible: true },
    { key: 'course', label: 'Course', visible: true },
    { key: 'batch', label: 'Batch', visible: true },
    { key: 'timing', label: 'Timing', visible: true },
    { key: 'trainingBranch', label: 'Branch', visible: true },
    { key: 'mode', label: 'Mode', visible: true },
    { key: 'counsellor', label: 'Counsellor', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'feeStatus', label: 'Fee Status', visible: true },
    { key: 'feeType', label: 'Fee Type', visible: true },
    { key: 'totalAmount', label: 'Total Amount', visible: true },
    { key: 'amountReceived', label: 'Amount Received', visible: true },
    { key: 'pendingAmount', label: 'Pending Amount', visible: true },
    { key: 'enrollmentDate', label: 'Enrollment Date', visible: true },
    { key: 'charges', label: 'Charges', visible: true },
    { key: 'dueDate', label: 'Due Date', visible: false },
    { key: 'paymentMode', label: 'Payment Mode', visible: false },
    { key: 'notes', label: 'Notes', visible: false },
    { key: '1stEmiAmount', label: '1st EMI', visible: false },
    { key: '1stEmiDate', label: '1st EMI Date', visible: false },
    { key: '1stEmiStatus', label: '1st EMI Status', visible: false },
    { key: '2ndEmiAmount', label: '2nd EMI', visible: false },
    { key: '2ndEmiDate', label: '2nd EMI Date', visible: false },
    { key: '2ndEmiStatus', label: '2nd EMI Status', visible: false },
    { key: '3rdEmiAmount', label: '3rd EMI', visible: false },
    { key: '3rdEmiDate', label: '3rd EMI Date', visible: false },
    { key: '3rdEmiStatus', label: '3rd EMI Status', visible: false },
    { key: 'nextEmiAmount', label: 'Next EMI', visible: true },
    { key: 'nextEmiDate', label: 'Next EMI Date', visible: true },
    { key: 'nextEmiStatus', label: 'Next EMI Status', visible: true },
    { key: 'actions', label: 'Actions', visible: true },
  ];

  const [columns, setColumns] = useState(allColumns);

  // Get unique counsellors and branches for admin filters
  const counsellors = [...new Set(enrollments
    .filter(e => e.counsellor)
    .map(e => typeof e.counsellor === 'object' ? e.counsellor : null)
    .filter(Boolean)
    .map(c => ({ _id: c._id, name: c.name }))
  )];

  const branches = [...new Set(enrollments
    .map(e => e.trainingBranch)
    .filter(Boolean)
  )];

  useEffect(() => {
    console.log('🔄 Admin: Fetching all enrollments');
    dispatch(fetchEnrollments());
  }, [dispatch]);

  useEffect(() => {
    if (success && !showForm) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, showForm]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm, selectedCounsellor, selectedBranch]);

  // Fixed click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterMenu && 
          filterMenuRef.current && 
          !filterMenuRef.current.contains(event.target) &&
          filterButtonRef.current &&
          !filterButtonRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }

      if (showColumnsMenu && 
          columnsMenuRef.current && 
          !columnsMenuRef.current.contains(event.target) &&
          columnsButtonRef.current &&
          !columnsButtonRef.current.contains(event.target)) {
        setShowColumnsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu, showColumnsMenu]);

  const handleEdit = (enrollment) => {
    setEditingEnrollment(enrollment);
    setShowForm(true);
  };

  const handleDelete = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to delete this enrollment? This action cannot be undone.')) {
      try {
        await dispatch(deleteEnrollmentByCounsellor(enrollmentId)).unwrap();
        dispatch(fetchEnrollments());
        // Reset to first page if current page becomes empty
        if (filteredEnrollments.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEnrollment(null);
    dispatch(fetchEnrollments());
  };

  const toggleColumnVisibility = (columnKey) => {
    setColumns(prevColumns => 
      prevColumns.map(col => 
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const selectAllColumns = () => {
    setColumns(prevColumns => 
      prevColumns.map(col => ({ ...col, visible: true }))
    );
  };

  const deselectAllColumns = () => {
    setColumns(prevColumns => 
      prevColumns.map(col => ({ ...col, visible: false }))
    );
  };

  // Helper functions
  const getStudentName = (enrollment) => {
    try {
      if (!enrollment?.student) return 'N/A';
      if (typeof enrollment.student === 'string') return enrollment.student;
      return enrollment.student.name || enrollment.student.studentId || 'N/A';
    } catch (error) {
      console.error('Error getting student name:', error);
      return 'N/A';
    }
  };

  const getStudentEmail = (enrollment) => {
    try {
      if (!enrollment?.student) return '';
      if (typeof enrollment.student === 'string') return '';
      return enrollment.student.email || '';
    } catch (error) {
      console.error('Error getting student email:', error);
      return '';
    }
  };

  const getStudentPhone = (enrollment) => {
    try {
      if (!enrollment?.student) return '';
      if (typeof enrollment.student === 'string') return '';
      return enrollment.student.phone || '';
    } catch (error) {
      console.error('Error getting student phone:', error);
      return '';
    }
  };

  const getCourseName = (enrollment) => {
    try {
      if (!enrollment?.course) return 'N/A';
      if (typeof enrollment.course === 'string') return enrollment.course;
      return enrollment.course.name || 'N/A';
    } catch (error) {
      console.error('Error getting course name:', error);
      return 'N/A';
    }
  };

  const getBatchName = (enrollment) => {
    try {
      if (!enrollment?.batch) return '-';
      if (typeof enrollment.batch === 'string') return enrollment.batch;
      return enrollment.batch.name || '-';
    } catch (error) {
      console.error('Error getting batch name:', error);
      return '-';
    }
  };

  const getBatchTiming = (enrollment) => {
    try {
      if (!enrollment?.batch) return '';
      if (typeof enrollment.batch === 'string') return '';
      return enrollment.batch.timing || '';
    } catch (error) {
      console.error('Error getting batch timing:', error);
      return '';
    }
  };

  const getCounsellorName = (enrollment) => {
    try {
      if (!enrollment?.counsellor) return 'N/A';
      if (typeof enrollment.counsellor === 'string') return enrollment.counsellor;
      return enrollment.counsellor.name || 'N/A';
    } catch (error) {
      console.error('Error getting counsellor name:', error);
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      dropout: { color: 'bg-red-100 text-red-800', label: 'Dropout' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
      on_hold: { color: 'bg-yellow-100 text-yellow-800', label: 'On Hold' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      notattending: { color: 'bg-orange-100 text-orange-800', label: 'Not Attending' }
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getFeeStatus = (enrollment) => {
    if (enrollment.pendingAmount === 0) {
      return { color: 'bg-green-100 text-green-800', label: 'Paid' };
    } else if (enrollment.dueDate && new Date(enrollment.dueDate) < new Date()) {
      return { color: 'bg-red-100 text-red-800', label: 'Overdue' };
    } else {
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
    }
  };

  const emiFeeStatusColor = (status) => {
    if (status === "paid") {
      return { color: 'bg-green-100 text-green-800', label: 'Paid' };
    } else if (status === "pending") {
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
    } else {
      return { color: 'bg-red-100 text-red-800', label: 'Overdue' };
    }
  };

  // Safe EMI data accessor functions
  const getFirstEMI = (enrollment) => {
    return enrollment.firstEMI || { amount: 0, date: null, status: 'pending' };
  };

  const getSecondEMI = (enrollment) => {
    return enrollment.secondEMI || { amount: 0, date: null, status: 'pending' };
  };

  const getThirdEMI = (enrollment) => {
    return enrollment.thirdEMI || { amount: 0, date: null, status: 'pending' };
  };

  const getNextEMI = (enrollment) => {
    return enrollment.nextEMI || { amount: 0, date: null, status: 'pending' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  const truncateText = (text, maxLength = 25) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  // Filter enrollments based on admin filters
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus;
    const matchesCounsellor = selectedCounsellor === 'all' || 
      (enrollment.counsellor && 
       (enrollment.counsellor._id === selectedCounsellor || enrollment.counsellor === selectedCounsellor));
    const matchesBranch = selectedBranch === 'all' || enrollment.trainingBranch === selectedBranch;
    
    const matchesSearch = 
      enrollment.enrollmentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getStudentName(enrollment).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCourseName(enrollment).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBatchName(enrollment).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCounsellorName(enrollment).toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesCounsellor && matchesBranch && matchesSearch;
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEnrollments.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredEnrollments.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  // Statistics for admin - ALL ENROLLMENTS
  const enrollmentStats = {
    total: enrollments.length,
    active: enrollments.filter(e => e.status === 'active').length,
    completed: enrollments.filter(e => e.status === 'completed').length,
    pendingPayments: enrollments.filter(e => e.pendingAmount > 0).length,
    totalRevenue: enrollments.reduce((sum, e) => sum + (e.amountReceived || 0), 0),
    totalPending: enrollments.reduce((sum, e) => sum + (e.pendingAmount || 0), 0)
  };

  // Check if enrollment can be deleted (only if no payments) - ADMIN CAN DELETE ANY
  const canDeleteEnrollment = (enrollment) => {
    return enrollment.amountReceived === 0;
  };

  const resetFilters = () => {
    setFilterStatus('all');
    setSelectedCounsellor('all');
    setSelectedBranch('all');
    setSearchTerm('');
  };

  if (loading && enrollments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="flex-shrink-0 bg-white p-4 lg:p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full lg:w-auto space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Enrollment Management</h1>
              {/* Admin Stats */}
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="text-xs bg-blue-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-blue-700">Total: {enrollmentStats.total}</span>
                </div>
                <div className="text-xs bg-green-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-green-700">Active: {enrollmentStats.active}</span>
                </div>
                <div className="text-xs bg-purple-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-purple-700">Completed: {enrollmentStats.completed}</span>
                </div>
                <div className="text-xs bg-yellow-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-yellow-700">Pending: {enrollmentStats.pendingPayments}</span>
                </div>
                <div className="text-xs bg-green-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-green-700">Revenue: {formatCurrency(enrollmentStats.totalRevenue)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Search Input - Mobile Only */}
            <div className="lg:hidden flex-1">
              <input
                type="text"
                placeholder="Search enrollments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterMenu(!showFilterMenu);
                  setShowColumnsMenu(false);
                }}
                className="flex items-center space-x-1 lg:space-x-2 bg-white border border-gray-300 text-gray-700 px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Filter</span>
                <span>▼</span>
              </button>

              {/* Filter Dropdown Menu */}
              {showFilterMenu && (
                <div 
                  ref={filterMenuRef}
                  className="absolute right-0 mt-2 w-72 lg:w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">Filter Enrollments</h3>
                    
                    {/* Status Filter */}
                    <div className="mb-3">
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                        <option value="inactive">Inactive</option>
                        <option value="dropout">Dropout</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="notattending">Not Attending</option>
                      </select>
                    </div>

                    {/* Counsellor Filter */}
                    <div className="mb-3">
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Counsellor</label>
                      <select
                        value={selectedCounsellor}
                        onChange={(e) => setSelectedCounsellor(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="all">All Counsellors</option>
                        {counsellors.map(counsellor => (
                          <option key={counsellor._id} value={counsellor._id}>
                            {counsellor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Branch Filter */}
                    <div className="mb-3">
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Branch</label>
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="all">All Branches</option>
                        {branches.map(branch => (
                          <option key={branch} value={branch}>
                            {branch}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">Search</h3>
                      <input
                        type="text"
                        placeholder="Search enrollments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={resetFilters}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilterMenu(false)}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Columns Button */}
            <div className="relative">
              <button
                ref={columnsButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColumnsMenu(!showColumnsMenu);
                  setShowFilterMenu(false);
                }}
                className="flex items-center space-x-1 lg:space-x-2 bg-white border border-gray-300 text-gray-700 px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                <span>📊</span>
                <span className="hidden sm:inline">Columns</span>
                <span>▼</span>
              </button>

              {/* Columns Dropdown Menu */}
              {showColumnsMenu && (
                <div 
                  ref={columnsMenuRef}
                  className="absolute right-0 mt-2 w-72 lg:w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-800 text-sm lg:text-base">Show/Hide Columns</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={selectAllColumns}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          Select All
                        </button>
                        <button
                          onClick={deselectAllColumns}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {columns.map(column => (
                        <label key={column.key} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={column.visible}
                            onChange={() => toggleColumnVisibility(column.key)}
                            className="text-blue-500 focus:ring-blue-500 rounded"
                          />
                          <span className="text-sm text-gray-700">{column.label}</span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                      <button
                        onClick={() => setShowColumnsMenu(false)}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span className="text-sm">{success}</span>
            </div>
            <button onClick={() => dispatch(clearSuccess())} className="text-green-700 hover:text-green-900">
              ×
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span className="text-sm">{error}</span>
            </div>
            <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        )}

        {/* Active Filters Display */}
        {(filterStatus !== 'all' || selectedCounsellor !== 'all' || selectedBranch !== 'all' || searchTerm) && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-600">Active filters:</span>
            {filterStatus !== 'all' && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Status: {filterStatus}
              </span>
            )}
            {selectedCounsellor !== 'all' && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Counsellor: {counsellors.find(c => c._id === selectedCounsellor)?.name}
              </span>
            )}
            {selectedBranch !== 'all' && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                Branch: {selectedBranch}
              </span>
            )}
            {searchTerm && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                Search: "{searchTerm}"
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 bg-gray-50 p-2 lg:p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
          {/* Table with horizontal scroll only */}
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="overflow-x-auto h-full">
              <table className="min-w-full divide-y divide-gray-200 border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {columns.map(column => 
                      column.visible && (
                        <th 
                          key={column.key} 
                          className="px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50"
                        >
                          {column.label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRecords.length === 0 ? (
                    <tr>
                      <td 
                        colSpan={columns.filter(col => col.visible).length} 
                        className="px-4 lg:px-6 py-8 lg:py-12 text-center"
                      >
                        <div className="text-gray-500">
                          <span className="text-3xl lg:text-4xl mb-2 block">📝</span>
                          <p className="text-base lg:text-lg font-medium">
                            {enrollments.length === 0 ? 'No enrollments found' : 'No matching enrollments'}
                          </p>
                          <p className="text-xs lg:text-sm">
                            {enrollments.length === 0 
                              ? 'Get started by creating your first enrollment' 
                              : 'Try adjusting your filters or search terms.'
                            }
                          </p>
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="mt-3 text-blue-500 hover:text-blue-700 text-sm"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentRecords.map((enrollment, index) => (
                      <tr 
                        key={enrollment._id} 
                        className={`transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-50`}
                      >
                        {columns.map(column => {
                          if (!column.visible) return null;
                          
                          // Common cell styling
                          const baseCellClasses = "px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm border-b border-gray-200";
                          const canDelete = canDeleteEnrollment(enrollment);
                          
                          switch (column.key) {
                            case 'enrollmentNo':
                              return (
                                <td key={column.key} className={`${baseCellClasses} font-semibold text-gray-900 whitespace-nowrap`}>
                                  <span className="bg-blue-100 text-blue-800 text-xs px-1 lg:px-2 py-0.5 lg:py-1 rounded">
                                    {enrollment.enrollmentNo || 'N/A'}
                                  </span>
                                </td>
                              );
                            case 'student':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  <div className="font-medium">{getStudentName(enrollment)}</div>
                                </td>
                              );
                            case 'email':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {getStudentEmail(enrollment) || '-'}
                                </td>
                              );
                            case 'phone':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {getStudentPhone(enrollment) || '-'}
                                </td>
                              );
                            case 'course':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  <span className="bg-purple-100 text-purple-800 text-xs px-1 lg:px-2 py-0.5 lg:py-1 rounded">
                                    {getCourseName(enrollment)}
                                  </span>
                                </td>
                              );
                            case 'batch':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {getBatchName(enrollment)}
                                </td>
                              );
                            case 'timing':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {getBatchTiming(enrollment) || '-'}
                                </td>
                              );
                            case 'trainingBranch':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {enrollment.trainingBranch || '-'}
                                </td>
                              );
                            case 'mode':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>  
                                  {enrollment.mode || '-'}
                                </td>
                              );
                            case 'counsellor':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  <span className="bg-green-100 text-green-800 text-xs px-1 lg:px-2 py-0.5 lg:py-1 rounded">
                                    {getCounsellorName(enrollment)}
                                  </span>
                                </td>
                              );
                            case 'status':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  {getStatusBadge(enrollment.status)}
                                </td>
                              );
                            case 'feeStatus':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getFeeStatus(enrollment).color}`}>
                                    {getFeeStatus(enrollment).label}
                                  </span>
                                  {enrollment.pendingAmount > 0 && (
                                    <div className="text-xs text-gray-500 mt-1 hidden lg:block">
                                      Due: {formatCurrency(enrollment.pendingAmount)}
                                    </div>
                                  )}
                                </td>
                              );
                            case 'feeType':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap capitalize`}>
                                  {enrollment.feeType || '-'}
                                </td>
                              );
                            case 'totalAmount':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-900 font-semibold whitespace-nowrap`}>
                                  {formatCurrency(enrollment.totalAmount)}
                                </td>
                              );
                            case 'amountReceived':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-green-600 font-semibold whitespace-nowrap`}>
                                  {formatCurrency(enrollment.amountReceived)}
                                </td>
                              );
                            case 'pendingAmount':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-red-600 font-semibold whitespace-nowrap`}>
                                  {formatCurrency(enrollment.pendingAmount)}
                                </td>
                              );
                            case 'charges':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-red-600 font-semibold whitespace-nowrap`}>
                                  {formatCurrency(enrollment.charges)}
                                </td>
                              );
                            case 'enrollmentDate':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {formatDate(enrollment.enrollmentDate)}
                                </td>
                              );
                            case 'dueDate':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {formatDate(enrollment.dueDate)}
                                </td>
                              );
                            case 'paymentMode':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap capitalize`}>
                                  {enrollment.paymentMode || '-'}
                                </td>
                              );
                            case 'notes':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-600`}>
                                  {truncateText(enrollment.notes)}
                                </td>
                              );
                            case '1stEmiAmount':
                              const firstEMI = getFirstEMI(enrollment);
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-900 font-semibold whitespace-nowrap`}>
                                  {formatCurrency(firstEMI.amount)}
                                </td>
                              );
                            case '1stEmiDate':
                              const firstEMIDate = getFirstEMI(enrollment);
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {formatDate(firstEMIDate.date)}
                                </td>
                              );
                            case '1stEmiStatus':
                              const firstEMIStatus = getFirstEMI(enrollment);
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${emiFeeStatusColor(firstEMIStatus.status).color}`}>
                                    {emiFeeStatusColor(firstEMIStatus.status).label}
                                  </span>
                                </td>
                              );
                            case '2ndEmiAmount':
                              const secondEMI = getSecondEMI(enrollment);
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-900 font-semibold whitespace-nowrap`}>
                                  {formatCurrency(secondEMI.amount)}
                                </td>
                              );
                            case '2ndEmiDate':
                              const secondEMIDate = getSecondEMI(enrollment);
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {formatDate(secondEMIDate.date)}
                                </td>
                              );
                            case '2ndEmiStatus':
                              const secondEMIStatus = getSecondEMI(enrollment);
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${emiFeeStatusColor(secondEMIStatus.status).color}`}>
                                    {emiFeeStatusColor(secondEMIStatus.status).label}
                                  </span>
                                </td>
                              );
                            case '3rdEmiAmount':
                              const thirdEMI = getThirdEMI(enrollment);
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-900 font-semibold whitespace-nowrap`}>
                                  {formatCurrency(thirdEMI.amount)}
                                </td>
                              );
                            case '3rdEmiDate':
                              const thirdEMIDate = getThirdEMI(enrollment);
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {formatDate(thirdEMIDate.date)}
                                </td>
                              );
                            case '3rdEmiStatus':
                              const thirdEMIStatus = getThirdEMI(enrollment);
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${emiFeeStatusColor(thirdEMIStatus.status).color}`}>
                                    {emiFeeStatusColor(thirdEMIStatus.status).label}
                                  </span>
                                </td>
                              );
                            case 'nextEmiAmount':
                              const nextEMI = getNextEMI(enrollment);
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-900 font-semibold whitespace-nowrap`}>
                                  {formatCurrency(nextEMI.amount)}
                                </td>
                              );
                            case 'nextEmiDate':
                              const nextEMIDate = getNextEMI(enrollment);
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {formatDate(nextEMIDate.date)}
                                </td>
                              );
                            case 'nextEmiStatus':
                              const nextEMIStatus = getNextEMI(enrollment);
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${emiFeeStatusColor(nextEMIStatus.status).color}`}>
                                    {emiFeeStatusColor(nextEMIStatus.status).label}
                                  </span>
                                </td>
                              );
                            case 'actions':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center whitespace-nowrap`}>
                                  <div className="flex flex-col lg:flex-row items-center justify-center space-y-2 lg:space-y-0 lg:space-x-1">
                                    <button 
                                      onClick={() => handleEdit(enrollment)} 
                                      className="text-blue-600 hover:text-blue-900 px-1 lg:px-2 py-1 rounded hover:bg-blue-50 transition-colors border border-blue-200 text-xs w-full lg:w-auto" 
                                      title="Edit Enrollment"
                                    >
                                      Edit
                                    </button>
                                    {canDelete && (
                                      <button 
                                        onClick={() => handleDelete(enrollment._id)} 
                                        className="text-red-600 hover:text-red-900 px-1 lg:px-2 py-1 rounded hover:bg-red-50 transition-colors border border-red-200 text-xs w-full lg:w-auto" 
                                        title="Delete Enrollment"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </td>
                              );
                            default:
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700`}>
                                  {enrollment[column.key] || '-'}
                                </td>
                              );
                          }
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer with Pagination */}
          {filteredEnrollments.length > 0 && (
            <div className="flex-shrink-0 bg-gray-50 px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-center space-y-3 lg:space-y-0">
                {/* Records Info */}
                <div className="text-xs lg:text-sm text-gray-700">
                  Showing <span className="font-semibold">{currentRecords.length}</span> of{' '}
                  <span className="font-semibold">{filteredEnrollments.length}</span> enrollments 
                  (Page <span className="font-semibold">{currentPage}</span> of{' '}
                  <span className="font-semibold">{totalPages}</span>)
                </div>
                
                {/* Pagination Controls */}
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 lg:px-4 lg:py-2 rounded-lg border text-xs lg:text-sm font-medium transition-colors duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {getPageNumbers().map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-2 lg:px-3 py-1 lg:py-2 rounded-lg border text-xs lg:text-sm font-medium transition-colors duration-200 ${
                          currentPage === number
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 lg:px-4 lg:py-2 rounded-lg border text-xs lg:text-sm font-medium transition-colors duration-200 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Next
                  </button>
                </div>

                {/* Total Records */}
                <div className="text-xs lg:text-sm text-gray-500">
                  Total: {enrollments.length} enrollments • 
                  Revenue: {formatCurrency(enrollmentStats.totalRevenue)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 lg:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800">
                  {editingEnrollment ? 'Edit Enrollment' : 'Create New Enrollment'}
                </h2>
                <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <AdminEnrollmentForm 
                enrollment={editingEnrollment} 
                onClose={handleCloseForm}
                isAdmin={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;