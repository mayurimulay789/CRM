import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchPayments, 
  clearError,
  clearSuccess 
} from '../../../store/slices/paymentSlice';
import PaymentForm from './PaymentForm';

const PaymentManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { 
    payments, 
    loading, 
    error, 
    success
  } = useSelector(state => state.payments);
  
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  const filterMenuRef = useRef(null);
  const filterButtonRef = useRef(null);

  // Fetch payments on mount
  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  // Handle success message timeout
  useEffect(() => {
    if (success && !showForm) {
      const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, showForm]);

  // Handle error message timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

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

  // Counsellor can only see their own payments
  const counsellorPayments = payments.filter(
    payment => payment.counsellor?._id === user?._id || payment.counsellor === user?._id
  );

  const filteredPayments = counsellorPayments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.verificationStatus === filterStatus;
    const matchesSearch = !searchTerm || 
      payment.paymentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.enrollment?.enrollmentNo?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Pagination logic - FIXED
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPayments.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredPayments.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
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
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  // Counsellor-specific statistics
  const paymentStats = {
    total: counsellorPayments.length,
    pending: counsellorPayments.filter(p => p.verificationStatus === 'pending').length,
    approved: counsellorPayments.filter(p => p.verificationStatus === 'approved').length,
    rejected: counsellorPayments.filter(p => p.verificationStatus === 'rejected').length,
    totalAmount: counsellorPayments.reduce((sum, p) => sum + (p.amountReceived || 0), 0),
    approvedAmount: counsellorPayments
      .filter(p => p.verificationStatus === 'approved')
      .reduce((sum, p) => sum + (p.amountReceived || 0), 0)
  };

  const resetFilters = () => {
    setFilterStatus('all');
    setSearchTerm('');
  };

  if (loading && payments.length === 0) {
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Management</h1>
              <p className="text-sm text-gray-600 mt-1">Record and track student payments</p>
              
              {/* Stats - Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3">
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
                <span className="text-xs bg-emerald-50 px-2 py-1.5 rounded-full text-emerald-700 text-center font-medium col-span-2 sm:col-span-1">
                  Approved: {formatCurrency(paymentStats.approvedAmount)}
                </span>
              </div>
            </div>

            {/* Action Buttons - Responsive */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Record Payment Button */}
              <button
                onClick={() => setShowForm(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#890c25] text-white rounded-lg text-sm font-medium hover:bg-[#6a091d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#890c25] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-base">+</span>
                <span className="hidden sm:inline">Record Payment</span>
              </button>

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
                  <div 
                    ref={filterMenuRef}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border rounded-lg shadow-xl z-50 p-4 max-h-[32rem] overflow-y-auto"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Filter Options</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Payment Status</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {['all', 'pending', 'approved', 'rejected'].map(status => (
                            <label key={status} className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name="status"
                                value={status}
                                checked={filterStatus === status}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-4 h-4 text-[#890c25] focus:ring-[#890c25]"
                              />
                              <span className="capitalize">{status === 'all' ? 'All' : status}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Search</h4>
                        <input
                          type="text"
                          placeholder="Payment No, Student, Enrollment..."
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
          {(filterStatus !== 'all' || searchTerm) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-600 font-medium">Active filters:</span>
              {filterStatus !== 'all' && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                  Status: {filterStatus}
                  <button onClick={() => setFilterStatus('all')} className="hover:text-blue-900">×</button>
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Payment No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Student Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Enrollment
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Fee Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Payment Mode
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                          <div className="text-5xl mb-3">💰</div>
                          <p className="text-base font-medium">
                            {counsellorPayments.length === 0 ? 'No payments found' : 'No matching payments'}
                          </p>
                          <p className="text-sm mt-1">
                            {counsellorPayments.length === 0 
                              ? 'Click "Record Payment" to record your first payment' 
                              : 'Try adjusting your filters'
                            }
                          </p>
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((payment, index) => (
                        <tr 
                          key={payment._id} 
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                        >
                          <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-semibold">
                              {payment.paymentNo}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <div>
                              <div className="font-medium">{payment.student?.name || 'N/A'}</div>
                              <div className="text-xs text-gray-500 hidden lg:block">{payment.student?.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-semibold">
                              {payment.enrollment?.enrollmentNo || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600 whitespace-nowrap">
                            {formatCurrency(payment.amountReceived)}
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-semibold capitalize">
                              {payment.feeType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-semibold capitalize">
                              {payment.paymentMode?.replace('_', ' ')}
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination - Responsive & Fixed */}
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
        </div>
      </div>

      {/* Payment Form Modal - Responsive */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
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
              <PaymentForm onClose={() => setShowForm(false)} />
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