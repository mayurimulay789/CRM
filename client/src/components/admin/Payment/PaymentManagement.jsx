import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPayments,
  approvePayment,
  rejectPayment,
  clearError,
  clearSuccess
} from '../../../store/slices/paymentSlice';
import PaymentForm from './PaymentForm';

// Safe rendering utility function
const safeRender = (value, fallback = 'N/A') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'object') return value.name || value.email || JSON.stringify(value);
  return fallback;
};

// Safe value extraction for filtering
const safeExtract = (value, type = 'string') => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (type === 'branch') return value.name || value.branchName || 'N/A';
    if (type === 'counsellor') return value.name || value.email || 'N/A';
    return value.name || 'N/A';
  }
  return 'N/A';
};

const PaymentManagement = () => {
  const dispatch = useDispatch();
  const {
    payments,
    loading,
    error,
    success
  } = useSelector(state => state.payments);

  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterCounsellor, setFilterCounsellor] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  const filterMenuRef = useRef(null);
  const filterButtonRef = useRef(null);

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  useEffect(() => {
    if (success && !showForm) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, showForm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterBranch, filterCounsellor, filterMode, searchTerm]);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterMenu &&
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterMenu]);

  const handleApprove = async (paymentId, notes = '') => {
    if (window.confirm('Are you sure you want to approve this payment?')) {
      setActionLoading(true);
      try {
        await dispatch(approvePayment({
          paymentId,
          verificationNotes: notes || 'Payment approved by admin'
        })).unwrap();
        await dispatch(fetchPayments()).unwrap();
      } catch (error) {
        console.error('Approve failed:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleReject = async (paymentId) => {
    const notes = prompt('Please enter reason for rejection:');
    if (notes !== null) {
      setActionLoading(true);
      try {
        await dispatch(rejectPayment({
          paymentId,
          verificationNotes: notes
        })).unwrap();
        await dispatch(fetchPayments()).unwrap();
      } catch (error) {
        console.error('Reject failed:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPayments.length === 0) return;

    if (window.confirm(`Approve ${selectedPayments.length} selected payments?`)) {
      setActionLoading(true);
      try {
        for (const paymentId of selectedPayments) {
          await dispatch(approvePayment({
            paymentId,
            verificationNotes: verificationNotes || 'Bulk approved by admin'
          })).unwrap();
        }
        await dispatch(fetchPayments()).unwrap();
        setSelectedPayments([]);
        setVerificationNotes('');
      } catch (error) {
        console.error('Bulk approve failed:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleBulkReject = async () => {
    if (selectedPayments.length === 0) return;

    const notes = prompt('Please enter reason for bulk rejection:');
    if (notes !== null) {
      setActionLoading(true);
      try {
        for (const paymentId of selectedPayments) {
          await dispatch(rejectPayment({
            paymentId,
            verificationNotes: notes
          })).unwrap();
        }
        await dispatch(fetchPayments()).unwrap();
        setSelectedPayments([]);
      } catch (error) {
        console.error('Bulk reject failed:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const togglePaymentSelection = (paymentId) => {
    setSelectedPayments(prev =>
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPayments.length === currentRecords.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(currentRecords.map(p => p._id));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Approval' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
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

  // Get unique values for filters - SAFE VERSION
  const branches = [...new Set(payments.map(p =>
    safeExtract(p.trainingBranch, 'branch')
  ).filter(branch => branch !== 'N/A'))];

  const counsellors = [...new Set(payments.map(p =>
    safeExtract(p.counsellor, 'counsellor')
  ).filter(counsellor => counsellor !== 'N/A'))];

  const paymentModes = [...new Set(payments.map(p =>
    safeExtract(p.paymentMode)
  ).filter(mode => mode !== 'N/A' && mode !== 'all'))];

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.verificationStatus === filterStatus;

    const paymentBranch = safeExtract(payment.trainingBranch, 'branch');
    const matchesBranch = filterBranch === 'all' || paymentBranch === filterBranch;

    const paymentCounsellor = safeExtract(payment.counsellor, 'counsellor');
    const matchesCounsellor = filterCounsellor === 'all' || paymentCounsellor === filterCounsellor;

    const paymentMode = safeExtract(payment.paymentMode);
    const matchesMode = filterMode === 'all' || paymentMode === filterMode;

    const matchesSearch = !searchTerm ||
      payment.paymentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeRender(payment.student?.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.enrollment?.enrollmentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paymentCounsellor.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesBranch && matchesCounsellor && matchesMode && matchesSearch;
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPayments.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredPayments.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(prev => prev + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(prev => prev - 1);

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

  // Admin Statistics
  const paymentStats = {
    total: payments.length,
    pending: payments.filter(p => p.verificationStatus === 'pending').length,
    approved: payments.filter(p => p.verificationStatus === 'approved').length,
    rejected: payments.filter(p => p.verificationStatus === 'rejected').length,
    totalAmount: payments.reduce((sum, p) => sum + (p.amountReceived || 0), 0),
    approvedAmount: payments
      .filter(p => p.verificationStatus === 'approved')
      .reduce((sum, p) => sum + (p.amountReceived || 0), 0),
    pendingAmount: payments
      .filter(p => p.verificationStatus === 'pending')
      .reduce((sum, p) => sum + (p.amountReceived || 0), 0)
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#890c25] border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Loading all payments...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Responsive */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Title and Stats */}
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Management - Admin</h1>
              <p className="text-sm text-gray-600 mt-1">Review and approve all student payments</p>

              {/* Stats - Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 mt-3">
                <span className="text-xs bg-blue-50 px-2 py-1.5 rounded-full text-blue-700 text-center font-medium">
                  Total: {paymentStats.total}
                </span>
                <span className="text-xs bg-yellow-50 px-2 py-1.5 rounded-full text-yellow-700 text-center font-medium">
                  Pending: {paymentStats.pending}
                </span>
                <span className="text-xs bg-green-50 px-2 py-1.5 rounded-full text-green-700 text-center font-medium">
                  Approved: {paymentStats.approved}
                </span>
                <span className="text-xs bg-red-50 px-2 py-1.5 rounded-full text-red-700 text-center font-medium">
                  Rejected: {paymentStats.rejected}
                </span>
                <span className="text-xs bg-purple-50 px-2 py-1.5 rounded-full text-purple-700 text-center font-medium col-span-2 sm:col-span-1">
                  Total Amt: {formatCurrency(paymentStats.totalAmount)}
                </span>
                <span className="text-xs bg-orange-50 px-2 py-1.5 rounded-full text-orange-700 text-center font-medium col-span-2 sm:col-span-1">
                  Pending Amt: {formatCurrency(paymentStats.pendingAmount)}
                </span>
              </div>
            </div>

            {/* Action Buttons - Responsive */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Bulk Actions - Show when payments selected */}
              {selectedPayments.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <input
                    type="text"
                    placeholder="Approval notes"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#890c25] w-full sm:w-64"
                    disabled={actionLoading}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkApprove}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✅ Approve {selectedPayments.length}
                    </button>
                    <button
                      onClick={handleBulkReject}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ❌ Reject {selectedPayments.length}
                    </button>
                  </div>
                </div>
              )}

              {/* Filter Button */}
              <div className="relative w-full sm:w-auto">
                <button
                  ref={filterButtonRef}
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  disabled={actionLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#890c25] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-base">🔍</span>
                  <span>Advanced Filters</span>
                  <svg className={`w-4 h-4 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Filter Dropdown - Responsive */}
                {showFilterMenu && (
                  <div
                    ref={filterMenuRef}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border rounded-lg shadow-xl z-50 p-4 max-h-[32rem] overflow-y-auto"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Advanced Filters</h3>

                    <div className="space-y-4">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#890c25]"
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending Approval</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      {/* Branch Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                        <select
                          value={filterBranch}
                          onChange={(e) => setFilterBranch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#890c25]"
                        >
                          <option value="all">All Branches</option>
                          {branches.map((branch, index) => (
                            <option key={`branch-${index}-${branch}`} value={branch}>
                              {safeRender(branch)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Counsellor Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Counsellor</label>
                        <select
                          value={filterCounsellor}
                          onChange={(e) => setFilterCounsellor(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#890c25]"
                        >
                          <option value="all">All Counsellors</option>
                          {counsellors.map((counsellor, index) => (
                            <option key={`counsellor-${index}-${counsellor}`} value={counsellor}>
                              {safeRender(counsellor)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Payment Mode Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                        <select
                          value={filterMode}
                          onChange={(e) => setFilterMode(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#890c25]"
                        >
                          <option value="all">All Modes</option>
                          {paymentModes.map((mode, index) => (
                            <option key={`mode-${index}-${mode}`} value={mode}>
                              {safeRender(mode).charAt(0).toUpperCase() + safeRender(mode).slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Search */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                          type="text"
                          placeholder="Search payments..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#890c25] focus:border-transparent"
                        />
                      </div>

                      <div className="flex justify-between pt-2 border-t">
                        <button
                          onClick={() => {
                            setFilterStatus('all');
                            setFilterBranch('all');
                            setFilterCounsellor('all');
                            setFilterMode('all');
                            setSearchTerm('');
                            setSelectedPayments([]);
                          }}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Reset All
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
            </div>
          </div>

          {/* Success and Error messages */}
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

          {/* Active Filters Display */}
          {(filterStatus !== 'all' || filterBranch !== 'all' || filterCounsellor !== 'all' || filterMode !== 'all' || searchTerm) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-600 font-medium">Active filters:</span>
              {filterStatus !== 'all' && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Status: {filterStatus}
                  <button onClick={() => setFilterStatus('all')} className="hover:text-blue-900">×</button>
                </span>
              )}
              {filterBranch !== 'all' && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Branch: {filterBranch}
                  <button onClick={() => setFilterBranch('all')} className="hover:text-purple-900">×</button>
                </span>
              )}
              {filterCounsellor !== 'all' && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Counsellor: {filterCounsellor}
                  <button onClick={() => setFilterCounsellor('all')} className="hover:text-green-900">×</button>
                </span>
              )}
              {filterMode !== 'all' && (
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Mode: {filterMode}
                  <button onClick={() => setFilterMode('all')} className="hover:text-orange-900">×</button>
                </span>
              )}
              {searchTerm && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="hover:text-yellow-900">×</button>
                </span>
              )}
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterBranch('all');
                  setFilterCounsellor('all');
                  setFilterMode('all');
                  setSearchTerm('');
                  setSelectedPayments([]);
                }}
                className="text-gray-500 underline hover:text-gray-700 text-xs"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container - Responsive */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
          {/* Table Header with Summary */}
          {filteredPayments.length > 0 && (
            <div className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{filteredPayments.length}</span> payments found
                  {searchTerm && <span className="text-gray-500 ml-1">• Matching: "{searchTerm}"</span>}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedPayments.length > 0 && (
                    <span className="text-blue-600 font-semibold">
                      {selectedPayments.length} selected
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Table - Horizontal scroll on mobile */}
          <div className="flex-1 overflow-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-[#890c25] focus:ring-[#890c25]"
                          checked={selectedPayments.length === currentRecords.length && currentRecords.length > 0}
                          onChange={toggleSelectAll}
                          disabled={actionLoading}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Payment No</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Enrollment</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Counsellor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Fee Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Payment Mode</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="px-4 py-12 text-center text-gray-500">
                          <div className="text-5xl mb-3">💰</div>
                          <p className="text-base font-medium">
                            {payments.length === 0 ? 'No payments found' : 'No matching payments'}
                          </p>
                          <p className="text-sm mt-1">
                            {payments.length === 0
                              ? 'Payments will appear here once counsellors record them'
                              : 'Try adjusting your filters'
                            }
                          </p>
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((payment) => (
                        <tr key={payment._id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-[#890c25] focus:ring-[#890c25]"
                              checked={selectedPayments.includes(payment._id)}
                              onChange={() => togglePaymentSelection(payment._id)}
                              disabled={actionLoading || payment.verificationStatus !== 'pending'}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-semibold">
                              {safeRender(payment.paymentNo)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <div>
                              <div className="font-medium">{safeRender(payment.student?.name)}</div>
                              <div className="text-xs text-gray-500 hidden lg:block">{safeRender(payment.student?.email)}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-semibold">
                              {safeRender(payment.enrollment?.enrollmentNo)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-semibold">
                              {safeExtract(payment.counsellor, 'counsellor')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600 whitespace-nowrap">
                            {formatCurrency(payment.amountReceived || 0)}
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-semibold capitalize">
                              {safeRender(payment.feeType)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-semibold capitalize">
                              {safeRender(payment.paymentMode)?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            {getStatusBadge(payment.verificationStatus)}
                            {payment.verificationStatus === 'pending' && (
                              <div className="text-xs text-yellow-600 mt-1 hidden lg:block">Waiting for approval</div>
                            )}
                            {payment.verificationStatus === 'rejected' && payment.verificationNotes && (
                              <div className="text-xs text-red-600 mt-1 hidden lg:block" title={payment.verificationNotes}>
                                Reason: {payment.verificationNotes.substring(0, 20)}...
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(payment.date)}
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {payment.verificationStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(payment._id)}
                                    disabled={actionLoading}
                                    className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50 transition-colors border border-green-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    ✅ Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(payment._id)}
                                    disabled={actionLoading}
                                    className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition-colors border border-red-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    ❌ Reject
                                  </button>
                                </>
                              )}
                              {payment.verificationStatus === 'approved' && (
                                <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded border border-green-200">
                                  ✓ Approved
                                </span>
                              )}
                              {payment.verificationStatus === 'rejected' && (
                                <span className="text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded border border-red-200">
                                  ✗ Rejected
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination - Responsive */}
          {filteredPayments.length > 0 && (
            <div className="border-t px-4 py-3 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastRecord, filteredPayments.length)}</span> of{' '}
                  <span className="font-medium">{filteredPayments.length}</span> results
                </div>
                
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1 || actionLoading}
                    className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="hidden sm:flex gap-1">
                    {getPageNumbers().map(num => (
                      <button
                        key={num}
                        onClick={() => paginate(num)}
                        disabled={actionLoading}
                        className={`relative inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
                    className="relative inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table Footer Summary */}
          {filteredPayments.length > 0 && (
            <div className="border-t px-4 py-3 sm:px-6 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
                <div className="text-gray-600">
                  <span className="font-semibold">Summary:</span> {filteredPayments.length} payments shown
                </div>
                <div className="text-gray-600 flex flex-wrap gap-3">
                  <span>Approved: <span className="text-green-600 font-semibold">{formatCurrency(paymentStats.approvedAmount)}</span></span>
                  <span>Pending: <span className="text-yellow-600 font-semibold">{formatCurrency(paymentStats.pendingAmount)}</span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Form Modal - Responsive */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
              <button 
                onClick={() => setShowForm(false)} 
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <PaymentForm onClose={() => setShowForm(false)} isCounsellor={false} />
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

export default PaymentManagement;