import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchEnrollments,
  approveEnrollment,
  rejectEnrollment,
  deleteEnrollment,
  clearError,
  clearSuccess 
} from '../../../store/slices/enrollmentSlice';
import EnrollmentForm from './EnrollmentForm';

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
  const [filterApprovalStatus, setFilterApprovalStatus] = useState('all');
  const [filterCounsellor, setFilterCounsellor] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  // Refs for dropdown menus
  const filterMenuRef = useRef(null);
  const columnsMenuRef = useRef(null);
  const filterButtonRef = useRef(null);
  const columnsButtonRef = useRef(null);

  // Get unique counsellors for filter
  const counsellors = [...new Set(enrollments.map(e => e.counsellor?._id || e.counsellor))] 
    .filter(Boolean)
    .map(id => {
      const enrollment = enrollments.find(e => e.counsellor?._id === id || e.counsellor === id);
      return {
        id,
        name: enrollment?.counsellor?.FullName || 'Unknown Counsellor'
      };
    });

  // Define all available columns for admin
  const allColumns = [
    { key: 'enrollmentNo', label: 'Enrollment No', visible: true },
    { key: 'student', label: 'Student', visible: true },
    { key: 'phone', label: 'Phone', visible: true },
    { key: 'course', label: 'Course', visible: true },
    { key: 'batch', label: 'Batch', visible: true },
    { key: 'counsellor', label: 'Counsellor', visible: true},
    { key: 'approvalStatus', label: 'Approval', visible: true },
    { key: 'studentStatus', label: 'Student Status', visible: true },
    { key: 'feeStatus', label: 'Fee Status', visible: true },
    { key: 'totalAmount', label: 'Total', visible: true },
    { key: 'amountReceived', label: 'Received', visible: true },
    { key: 'pendingAmount', label: 'Pending', visible: true },
    { key: 'enrollmentDate', label: 'Enrolled On', visible: true },
    { key: 'actions', label: 'Actions', visible: true },
  ];

  const [columns, setColumns] = useState(allColumns);

  // Fetch enrollments on mount
  useEffect(() => {
    dispatch(fetchEnrollments());
  }, [dispatch]);

  // Handle success message timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Handle error message timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterApprovalStatus, filterCounsellor, searchTerm]);

  // Click outside detection for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterMenu && filterMenuRef.current && !filterMenuRef.current.contains(event.target) &&
          filterButtonRef.current && !filterButtonRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
      if (showColumnsMenu && columnsMenuRef.current && !columnsMenuRef.current.contains(event.target) &&
          columnsButtonRef.current && !columnsButtonRef.current.contains(event.target)) {
        setShowColumnsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterMenu, showColumnsMenu]);

  // Handle approve with refresh
  const handleApprove = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to approve this enrollment?')) {
      setActionLoading(true);
      try {
        await dispatch(approveEnrollment(enrollmentId)).unwrap();
        // Refresh enrollments after approval
        await dispatch(fetchEnrollments()).unwrap();
      } catch (error) {
        console.error('Approve failed:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Handle reject with refresh
  const handleReject = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to reject this enrollment?')) {
      setActionLoading(true);
      try {
        await dispatch(rejectEnrollment(enrollmentId)).unwrap();
        // Refresh enrollments after rejection
        await dispatch(fetchEnrollments()).unwrap();
      } catch (error) {
        console.error('Reject failed:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Handle edit
  const handleEdit = (enrollment) => {
    setEditingEnrollment(enrollment);
    setShowForm(true);
  };

  // Handle delete with refresh
  const handleDelete = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to delete this enrollment? This action cannot be undone.')) {
      setActionLoading(true);
      try {
        await dispatch(deleteEnrollment(enrollmentId)).unwrap();
        await dispatch(fetchEnrollments()).unwrap();
        if (filteredEnrollments.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error('Delete failed:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEnrollment(null);
    dispatch(fetchEnrollments());
  };

  const toggleColumnVisibility = (columnKey) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const selectAllColumns = () => {
    setColumns(prev => prev.map(col => ({ ...col, visible: true })));
  };

  const deselectAllColumns = () => {
    setColumns(prev => prev.map(col => ({ ...col, visible: false })));
  };

  // Helper functions
  const getStudentName = (enrollment) => {
    try {
      return enrollment?.student?.name || enrollment?.student?.studentId || 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const getStudentPhone = (enrollment) => {
    try {
      return enrollment?.student?.phone || '-';
    } catch {
      return '-';
    }
  };

  const getCourseName = (enrollment) => {
    try {
      return enrollment?.course?.name || 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const getBatchName = (enrollment) => {
    try {
      return enrollment?.batch?.name || '-';
    } catch {
      return '-';
    }
  };

  const getCounsellorName = (enrollment) => {
    try {
      return enrollment?.counsellor?.FullName || 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const getApprovalStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    const badge = config[status] || config.pending;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getStudentStatusBadge = (status) => {
    const config = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      dropout: { color: 'bg-red-100 text-red-800', label: 'Dropout' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
      on_hold: { color: 'bg-yellow-100 text-yellow-800', label: 'On Hold' }
    };
    const badge = config[status] || config.active;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getFeeStatus = (enrollment) => {
    const pending = enrollment.pendingAmount || 0;
    if (pending <= 0) {
      return { color: 'bg-green-100 text-green-800', label: 'Paid' };
    } else if (enrollment.dueDate && new Date(enrollment.dueDate) < new Date()) {
      return { color: 'bg-red-100 text-red-800', label: 'Overdue' };
    } else {
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const resetFilters = () => {
    setFilterStatus('all');
    setFilterApprovalStatus('all');
    setFilterCounsellor('all');
    setSearchTerm('');
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesStudentStatus = filterStatus === 'all' || enrollment.status === filterStatus;
    const matchesApprovalStatus = filterApprovalStatus === 'all' || enrollment.enrollmentStatus === filterApprovalStatus;
    const matchesCounsellor = filterCounsellor === 'all' || 
      enrollment.counsellor?._id === filterCounsellor || 
      enrollment.counsellor === filterCounsellor;
    
    const matchesSearch = !searchTerm || 
      enrollment.enrollmentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getStudentName(enrollment).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCourseName(enrollment).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCounsellorName(enrollment).toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStudentStatus && matchesApprovalStatus && matchesCounsellor && matchesSearch;
  });

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEnrollments.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredEnrollments.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start < maxVisible - 1) start = end - maxVisible + 1;
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  // Statistics
  const stats = {
    total: filteredEnrollments.length,
    pending: filteredEnrollments.filter(e => e.enrollmentStatus === 'pending').length,
    approved: filteredEnrollments.filter(e => e.enrollmentStatus === 'approved').length,
    rejected: filteredEnrollments.filter(e => e.enrollmentStatus === 'rejected').length,
    active: filteredEnrollments.filter(e => e.status === 'active').length,
    completed: filteredEnrollments.filter(e => e.status === 'completed').length,
    totalRevenue: filteredEnrollments.reduce((sum, e) => sum + (e.amountReceived || 0), 0),
    totalPendingAmount: filteredEnrollments.reduce((sum, e) => sum + (e.pendingAmount || 0), 0)
  };

  if (loading && enrollments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#890c25] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Responsive */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title and Stats */}
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Enrollment Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage all system enrollments</p>
              
              {/* Stats - Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 mt-3">
                <span className="text-xs bg-blue-50 px-2 py-1.5 rounded-full text-blue-700 text-center font-medium">Total: {stats.total}</span>
                <span className="text-xs bg-yellow-50 px-2 py-1.5 rounded-full text-yellow-700 text-center font-medium">Pending: {stats.pending}</span>
                <span className="text-xs bg-green-50 px-2 py-1.5 rounded-full text-green-700 text-center font-medium">Approved: {stats.approved}</span>
                <span className="text-xs bg-red-50 px-2 py-1.5 rounded-full text-red-700 text-center font-medium">Rejected: {stats.rejected}</span>
                <span className="text-xs bg-purple-50 px-2 py-1.5 rounded-full text-purple-700 text-center font-medium">Active: {stats.active}</span>
                <span className="text-xs bg-emerald-50 px-2 py-1.5 rounded-full text-emerald-700 text-center font-medium">Revenue: {formatCurrency(stats.totalRevenue)}</span>
                <span className="text-xs bg-orange-50 px-2 py-1.5 rounded-full text-orange-700 text-center font-medium col-span-2 sm:col-span-1">Pending Amt: {formatCurrency(stats.totalPendingAmount)}</span>
              </div>
            </div>

            {/* Filter and Columns Buttons - Responsive */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Filter Button */}
              <div className="relative">
                <button
                  ref={filterButtonRef}
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#890c25] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-base">🔍</span>
                  <span className="hidden sm:inline">Filter</span>
                  <svg className={`w-4 h-4 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Filter Dropdown - Responsive */}
                {showFilterMenu && (
                  <div ref={filterMenuRef} className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border rounded-lg shadow-xl z-50 p-4 max-h-[32rem] overflow-y-auto">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Filter Options</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Student Status</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {['all', 'active', 'completed', 'on_hold', 'inactive', 'dropout'].map(s => (
                            <label key={s} className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name="status"
                                value={s}
                                checked={filterStatus === s}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-4 h-4 text-[#890c25] focus:ring-[#890c25]"
                              />
                              <span className="capitalize">{s === 'all' ? 'All' : s.replace('_', ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Approval Status</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {['all', 'pending', 'approved', 'rejected'].map(s => (
                            <label key={s} className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name="approvalStatus"
                                value={s}
                                checked={filterApprovalStatus === s}
                                onChange={(e) => setFilterApprovalStatus(e.target.value)}
                                className="w-4 h-4 text-[#890c25] focus:ring-[#890c25]"
                              />
                              <span className="capitalize">{s}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Counsellor</h4>
                        <div className="max-h-32 overflow-y-auto space-y-1 border rounded-lg p-2">
                          <label className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50">
                            <input
                              type="radio"
                              name="counsellor"
                              value="all"
                              checked={filterCounsellor === 'all'}
                              onChange={(e) => setFilterCounsellor(e.target.value)}
                              className="w-4 h-4 text-[#890c25] focus:ring-[#890c25]"
                            />
                            All Counsellors
                          </label>
                          {counsellors.map(c => (
                            <label key={c.id} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50">
                              <input
                                type="radio"
                                name="counsellor"
                                value={c.id}
                                checked={filterCounsellor === c.id}
                                onChange={(e) => setFilterCounsellor(e.target.value)}
                                className="w-4 h-4 text-[#890c25] focus:ring-[#890c25]"
                              />
                              <span className="truncate">{c.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Search</h4>
                        <input
                          type="text"
                          placeholder="Name, course, enrollment no..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#890c25] focus:border-transparent"
                        />
                      </div>

                      <div className="flex justify-between pt-2 border-t">
                        <button
                          onClick={resetFilters}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setShowFilterMenu(false)}
                          className="px-4 py-2 bg-[#890c25] text-white text-sm rounded-lg hover:bg-[#6a091d] font-medium"
                        >
                          Apply Filters
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
                  onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#890c25] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-base">📊</span>
                  <span className="hidden sm:inline">Columns</span>
                  <svg className={`w-4 h-4 transition-transform ${showColumnsMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Columns Dropdown */}
                {showColumnsMenu && (
                  <div ref={columnsMenuRef} className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-xl z-50 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">Show/Hide Columns</h3>
                      <div className="space-x-2">
                        <button onClick={selectAllColumns} className="text-xs text-blue-600 hover:text-blue-800 font-medium">All</button>
                        <button onClick={deselectAllColumns} className="text-xs text-gray-600 hover:text-gray-800 font-medium">None</button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {columns.map(col => (
                        <label key={col.key} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={col.visible}
                            onChange={() => toggleColumnVisibility(col.key)}
                            className="w-4 h-4 text-[#890c25] focus:ring-[#890c25] rounded"
                          />
                          <span>{col.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span>✅</span>
                <span>{success}</span>
              </span>
              <button onClick={() => dispatch(clearSuccess())} className="text-green-700 hover:text-green-900 text-lg">×</button>
            </div>
          )}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span>❌</span>
                <span>{error}</span>
              </span>
              <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900 text-lg">×</button>
            </div>
          )}

          {/* Active Filters */}
          {(filterStatus !== 'all' || filterApprovalStatus !== 'all' || filterCounsellor !== 'all' || searchTerm) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-600 font-medium">Active filters:</span>
              {filterStatus !== 'all' && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Status: {filterStatus}
                  <button onClick={() => setFilterStatus('all')} className="hover:text-blue-900">×</button>
                </span>
              )}
              {filterApprovalStatus !== 'all' && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Approval: {filterApprovalStatus}
                  <button onClick={() => setFilterApprovalStatus('all')} className="hover:text-purple-900">×</button>
                </span>
              )}
              {filterCounsellor !== 'all' && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Counsellor: {counsellors.find(c => c.id === filterCounsellor)?.name || 'Selected'}
                  <button onClick={() => setFilterCounsellor('all')} className="hover:text-green-900">×</button>
                </span>
              )}
              {searchTerm && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="hover:text-yellow-900">×</button>
                </span>
              )}
              <button onClick={resetFilters} className="text-gray-500 underline hover:text-gray-700 text-xs">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container - Responsive */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
          {/* Table - Horizontal scroll on mobile */}
          <div className="flex-1 overflow-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {columns.filter(c => c.visible).map(col => (
                        <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan={columns.filter(c => c.visible).length} className="px-4 py-12 text-center text-gray-500">
                          <div className="text-5xl mb-3">📝</div>
                          <p className="text-base font-medium">No enrollments found</p>
                          <p className="text-sm mt-1">Try adjusting your filters</p>
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((enrollment, idx) => (
                        <tr key={enrollment._id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                          {columns.filter(c => c.visible).map(col => {
                            switch(col.key) {
                              case 'enrollmentNo':
                                return (
                                  <td key={col.key} className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-semibold">
                                      {enrollment.enrollmentNo}
                                    </span>
                                  </td>
                                );
                              case 'student':
                                return <td key={col.key} className="px-4 py-3 text-sm whitespace-nowrap">{getStudentName(enrollment)}</td>;
                              case 'phone':
                                return <td key={col.key} className="px-4 py-3 text-sm whitespace-nowrap">{getStudentPhone(enrollment)}</td>;
                              case 'course':
                                return (
                                  <td key={col.key} className="px-4 py-3 text-sm whitespace-nowrap">
                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-semibold">
                                      {getCourseName(enrollment)}
                                    </span>
                                  </td>
                                );
                              case 'batch':
                                return <td key={col.key} className="px-4 py-3 text-sm whitespace-nowrap">{getBatchName(enrollment)}</td>;
                              case 'counsellor':
                                return (
                                  <td key={col.key} className="px-4 py-3 text-sm whitespace-nowrap">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-semibold">
                                      {getCounsellorName(enrollment)}
                                    </span>
                                  </td>
                                );
                              case 'approvalStatus':
                                return <td key={col.key} className="px-4 py-3 text-sm whitespace-nowrap">{getApprovalStatusBadge(enrollment.enrollmentStatus)}</td>;
                              case 'studentStatus':
                                return <td key={col.key} className="px-4 py-3 text-sm whitespace-nowrap">{getStudentStatusBadge(enrollment.status)}</td>;
                              case 'feeStatus':
                                return (
                                  <td key={col.key} className="px-4 py-3 text-sm whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getFeeStatus(enrollment).color}`}>
                                      {getFeeStatus(enrollment).label}
                                    </span>
                                  </td>
                                );
                              case 'totalAmount':
                                return <td key={col.key} className="px-4 py-3 text-sm font-medium whitespace-nowrap">{formatCurrency(enrollment.totalAmount)}</td>;
                              case 'amountReceived':
                                return <td key={col.key} className="px-4 py-3 text-sm text-green-600 font-medium whitespace-nowrap">{formatCurrency(enrollment.amountReceived)}</td>;
                              case 'pendingAmount':
                                return <td key={col.key} className="px-4 py-3 text-sm text-red-600 font-medium whitespace-nowrap">{formatCurrency(enrollment.pendingAmount)}</td>;
                              case 'enrollmentDate':
                                return <td key={col.key} className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(enrollment.enrollmentDate)}</td>;
                              case 'actions':
                                return (
                                  <td key={col.key} className="px-4 py-3 text-sm whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1.5">
                                      {enrollment.enrollmentStatus === 'pending' && (
                                        <>
                                          <button
                                            onClick={() => handleApprove(enrollment._id)}
                                            disabled={actionLoading}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                          >
                                            Approve
                                          </button>
                                          <button
                                            onClick={() => handleReject(enrollment._id)}
                                            disabled={actionLoading}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                          >
                                            Reject
                                          </button>
                                        </>
                                      )}
                                      <button
                                        onClick={() => handleEdit(enrollment)}
                                        disabled={actionLoading}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDelete(enrollment._id)}
                                        disabled={actionLoading}
                                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                );
                              default:
                                return <td key={col.key} className="px-4 py-3 text-sm">-</td>;
                            }
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination - Responsive */}
          {filteredEnrollments.length > 0 && (
            <div className="border-t px-4 py-3 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastRecord, filteredEnrollments.length)}</span> of{' '}
                  <span className="font-medium">{filteredEnrollments.length}</span> results
                </div>
                
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1 || actionLoading}
                    className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="hidden sm:flex gap-1">
                    {getPageNumbers().map(num => (
                      <button
                        key={num}
                        onClick={() => paginate(num)}
                        disabled={actionLoading}
                        className={`relative inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                          currentPage === num
                            ? 'bg-[#890c25] text-white'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <div className="sm:hidden">
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages || actionLoading}
                    className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Form Modal - Responsive */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEnrollment ? `Edit Enrollment - ${editingEnrollment.enrollmentNo}` : 'Create New Enrollment'}
              </h2>
              <button 
                onClick={handleCloseForm} 
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <EnrollmentForm
                enrollment={editingEnrollment}
                onClose={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Global Loading Overlay */}
      {actionLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#890c25] border-t-transparent"></div>
            <span className="text-sm font-medium">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;