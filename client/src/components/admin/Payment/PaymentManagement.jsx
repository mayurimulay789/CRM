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
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterCounsellor, setFilterCounsellor] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');

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

  const handleApprove = (paymentId, notes = '') => {
    if (window.confirm('Are you sure you want to approve this payment?')) {
      dispatch(approvePayment({
        paymentId,
        verificationNotes: notes || 'Payment approved by admin'
      }));
    }
  };

  const handleReject = (paymentId) => {
    const notes = prompt('Please enter reason for rejection:');
    if (notes !== null) {
      dispatch(rejectPayment({
        paymentId,
        verificationNotes: notes
      }));
    }
  };

  const handleBulkApprove = () => {
    if (selectedPayments.length === 0) return;

    if (window.confirm(`Approve ${selectedPayments.length} selected payments?`)) {
      selectedPayments.forEach(paymentId => {
        dispatch(approvePayment({
          paymentId,
          verificationNotes: verificationNotes || 'Bulk approved by admin'
        }));
      });
      setSelectedPayments([]);
      setVerificationNotes('');
    }
  };

  const handleBulkReject = () => {
    if (selectedPayments.length === 0) return;

    const notes = prompt('Please enter reason for bulk rejection:');
    if (notes !== null) {
      selectedPayments.forEach(paymentId => {
        dispatch(rejectPayment({
          paymentId,
          verificationNotes: notes
        }));
      });
      setSelectedPayments([]);
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
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(filteredPayments.map(p => p._id));
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
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
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

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.verificationStatus === filterStatus;

    const paymentBranch = safeExtract(payment.trainingBranch, 'branch');
    const matchesBranch = filterBranch === 'all' || paymentBranch === filterBranch;

    const paymentCounsellor = safeExtract(payment.counsellor, 'counsellor');
    const matchesCounsellor = filterCounsellor === 'all' || paymentCounsellor === filterCounsellor;

    const paymentMode = safeExtract(payment.paymentMode);
    const matchesMode = filterMode === 'all' || paymentMode === filterMode;

    const matchesSearch =
      payment.paymentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeRender(payment.student?.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.enrollment?.enrollmentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paymentCounsellor.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesBranch && matchesCounsellor && matchesMode && matchesSearch;
  });

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading all payments...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="flex-shrink-0 bg-white p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex justify-between items-center w-full lg:w-auto space-x-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Payment Management - Admin</h1>
              <p className="text-gray-600 text-sm lg:text-base">Review and approve all student payments</p>

              {/* Admin Stats */}
              <div className="flex flex-wrap gap-2 mt-3">
                <div className="text-xs lg:text-sm bg-blue-50 px-2 lg:px-3 py-1 rounded-full">
                  <span className="font-semibold text-blue-700">Total: {paymentStats.total}</span>
                </div>
                <div className="text-xs lg:text-sm bg-yellow-50 px-2 lg:px-3 py-1 rounded-full">
                  <span className="font-semibold text-yellow-700">Pending: {paymentStats.pending}</span>
                </div>
                <div className="text-xs lg:text-sm bg-green-50 px-2 lg:px-3 py-1 rounded-full">
                  <span className="font-semibold text-green-700">Approved: {paymentStats.approved}</span>
                </div>
                <div className="text-xs lg:text-sm bg-red-50 px-2 lg:px-3 py-1 rounded-full">
                  <span className="font-semibold text-red-700">Rejected: {paymentStats.rejected}</span>
                </div>
                <div className="text-xs lg:text-sm bg-purple-50 px-2 lg:px-3 py-1 rounded-full">
                  <span className="font-semibold text-purple-700">
                    Total: {formatCurrency(paymentStats.totalAmount)}
                  </span>
                </div>
                <div className="text-xs lg:text-sm bg-orange-50 px-2 lg:px-3 py-1 rounded-full">
                  <span className="font-semibold text-orange-700">
                    Pending: {formatCurrency(paymentStats.pendingAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedPayments.length > 0 && (
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Approval notes (optional)"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleBulkApprove}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
              >
                ✅ Approve {selectedPayments.length}
              </button>
              <button
                onClick={handleBulkReject}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300"
              >
                ❌ Reject {selectedPayments.length}
              </button>
            </div>
          )}

          {/* Filter Section */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <span>🔍</span>
                <span>Advanced Filters</span>
                <span>▼</span>
              </button>

              {showFilterMenu && (
                <div
                  ref={filterMenuRef}
                  className="absolute right-0 left-2 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Advanced Filters</h3>

                    {/* Status Filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Branch Filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                      <select
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Counsellor</label>
                      <select
                        value={filterCounsellor}
                        onChange={(e) => setFilterCounsellor(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                      <select
                        value={filterMode}
                        onChange={(e) => setFilterMode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                      <input
                        type="text"
                        placeholder="Search payments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => {
                          setFilterStatus('all');
                          setFilterBranch('all');
                          setFilterCounsellor('all');
                          setFilterMode('all');
                          setSearchTerm('');
                          setSelectedPayments([]);
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                      >
                        Reset All
                      </button>
                      <button
                        onClick={() => setShowFilterMenu(false)}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
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
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>{success}</span>
            </div>
            <button onClick={() => dispatch(clearSuccess())} className="text-green-700 hover:text-green-900">
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
            <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900">
              ×
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
          {/* Table Header */}
          {filteredPayments.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{filteredPayments.length}</span> payments found
                  {(filterStatus !== 'all' || filterBranch !== 'all' || filterCounsellor !== 'all' || filterMode !== 'all') && (
                    <span className="text-gray-500">
                      {filterStatus !== 'all' && ` • Status: ${filterStatus}`}
                      {filterBranch !== 'all' && ` • Branch: ${filterBranch}`}
                      {filterCounsellor !== 'all' && ` • Counsellor: ${filterCounsellor}`}
                      {filterMode !== 'all' && ` • Mode: ${filterMode}`}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="text-gray-500"> • Matching: "{searchTerm}"</span>
                  )}
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

          <div className="flex-1 min-h-0 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-12">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedPayments.length === filteredPayments.length && filteredPayments.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Enrollment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Counsellor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fee Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <span className="text-4xl mb-2 block">💰</span>
                        <p className="text-lg font-medium">
                          {payments.length === 0 ? 'No payments found' : 'No matching payments'}
                        </p>
                        <p className="text-sm mt-1">
                          {payments.length === 0
                            ? 'Payments will appear here once counsellors record them'
                            : 'Try adjusting your filters or search terms'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedPayments.includes(payment._id)}
                          onChange={() => togglePaymentSelection(payment._id)}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {safeRender(payment.paymentNo)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>
                          <div className="font-medium">{safeRender(payment.student?.name)}</div>
                          <div className="text-xs text-gray-500">{safeRender(payment.student?.email)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {safeRender(payment.enrollment?.enrollmentNo)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {safeExtract(payment.counsellor, 'counsellor')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        {formatCurrency(payment.amountReceived || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {safeRender(payment.feeType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          {safeRender(payment.paymentMode)?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {safeExtract(payment.trainingBranch, 'branch')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getStatusBadge(payment.verificationStatus)}
                        {payment.verificationStatus === 'pending' && (
                          <div className="text-xs text-yellow-600 mt-1">Waiting for approval</div>
                        )}
                        {payment.verificationStatus === 'rejected' && payment.verificationNotes && (
                          <div className="text-xs text-red-600 mt-1">Reason: {payment.verificationNotes}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-4 py-3 text-sm space-x-1">
                        {payment.verificationStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(payment._id)}
                              className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50 transition-colors border border-green-200 text-xs"
                              title="Approve Payment"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleReject(payment._id)}
                              className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition-colors border border-red-200 text-xs mt-1"
                              title="Reject Payment"
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        {payment.verificationStatus === 'approved' && (
                          <span className="text-green-600 text-xs">✓ Approved</span>
                        )}
                        {payment.verificationStatus === 'rejected' && (
                          <span className="text-red-600 text-xs">✗ Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredPayments.length > 0 && (
            <div className="flex-shrink-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{filteredPayments.length}</span> of{' '}
                  <span className="font-semibold">{payments.length}</span> payments
                </div>
                <div className="text-sm text-gray-500">
                  Approved Amount: {formatCurrency(paymentStats.approvedAmount)} |
                  Pending Approval: {formatCurrency(paymentStats.pendingAmount)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <PaymentForm onClose={() => setShowForm(false)} isCounsellor={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;