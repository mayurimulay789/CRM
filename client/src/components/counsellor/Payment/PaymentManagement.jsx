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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(7);

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

  // Counsellor can only see their own payments
  const counsellorPayments = payments.filter(
    payment => payment.counsellor?._id === user?._id || payment.counsellor === user?._id
  );

  const filteredPayments = counsellorPayments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.verificationStatus === filterStatus;
    const matchesSearch = 
      payment.paymentNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.enrollment?.enrollmentNo?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPayments.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredPayments.length / recordsPerPage);

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
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Payment Management</h1>
              <p className="text-gray-600 text-sm lg:text-base">Record and track student payments</p>
              
              {/* Counsellor Stats */}
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="text-xs bg-blue-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-blue-700">Total: {paymentStats.total}</span>
                </div>
                <div className="text-xs bg-yellow-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-yellow-700">Pending: {paymentStats.pending}</span>
                </div>
                <div className="text-xs bg-green-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-green-700">Approved: {paymentStats.approved}</span>
                </div>
                <div className="text-xs bg-red-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-red-700">Rejected: {paymentStats.rejected}</span>
                </div>
                <div className="text-xs bg-purple-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-purple-700">
                    Total: {formatCurrency(paymentStats.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <span>+</span>
              <span>Record Payment</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Search Input - Mobile Only */}
            <div className="lg:hidden flex-1">
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center space-x-1 lg:space-x-2 bg-white border border-gray-300 text-gray-700 px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Filter</span>
                <span>▼</span>
              </button>

              {showFilterMenu && (
                <div 
                  ref={filterMenuRef}
                  className="absolute right-0 mt-2 w-64 lg:w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">Filter by Status</h3>
                    <div className="space-y-2">
                      {['all', 'pending', 'approved', 'rejected'].map(status => (
                        <label key={status} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={filterStatus === status}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-blue-500 focus:ring-blue-500"
                          />
                          <span className="capitalize text-sm">
                            {status === 'all' ? 'All Status' : status}
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">Search</h3>
                      <input
                        type="text"
                        placeholder="Search payments..."
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
        {(filterStatus !== 'all' || searchTerm) && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-600">Active filters:</span>
            {filterStatus !== 'all' && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Status: {filterStatus}
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
                    <th className="px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50">
                      Payment No
                    </th>
                    <th className="px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50">
                      Student
                    </th>
                    <th className="px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50">
                      Enrollment
                    </th>
                    <th className="px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50">
                      Amount
                    </th>
                    <th className="px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50">
                      Fee Type
                    </th>
                    <th className="px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50">
                      Payment Mode
                    </th>
                    <th className="px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50">
                      Status
                    </th>
                    <th className="px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRecords.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 lg:px-6 py-8 lg:py-12 text-center">
                        <div className="text-gray-500">
                          <span className="text-3xl lg:text-4xl mb-2 block">💰</span>
                          <p className="text-base lg:text-lg font-medium">
                            {counsellorPayments.length === 0 ? 'No payments found' : 'No matching payments'}
                          </p>
                          <p className="text-xs lg:text-sm">
                            {counsellorPayments.length === 0 
                              ? 'Get started by recording your first payment' 
                              : 'Try adjusting your filters or search terms.'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentRecords.map((payment, index) => (
                      <tr 
                        key={payment._id} 
                        className={`transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-50`}
                      >
                        <td className="px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-semibold text-gray-900 whitespace-nowrap border-b border-gray-200">
                          <span className="bg-blue-100 text-blue-800 text-xs px-1 lg:px-2 py-0.5 lg:py-1 rounded">
                            {payment.paymentNo}
                          </span>
                        </td>
                        <td className="px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-gray-700 border-b border-gray-200">
                          <div>
                            <div className="font-medium">{payment.student?.name}</div>
                            <div className="text-xs text-gray-500 hidden lg:block">{payment.student?.email}</div>
                            <div className="text-xs text-gray-500 hidden lg:block">{payment.student?.phone}</div>
                            <div className="text-xs text-gray-500">
                              ReceivedBy: {payment.receivedBy?.FullName}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-gray-700 whitespace-nowrap border-b border-gray-200">
                          {payment.enrollment?.enrollmentNo}
                        </td>
                        <td className="px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-semibold text-green-600 whitespace-nowrap border-b border-gray-200">
                          {formatCurrency(payment.amountReceived)}
                        </td>
                        <td className="px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-gray-700 whitespace-nowrap border-b border-gray-200 capitalize">
                          <span className="bg-gray-100 text-gray-800 text-xs px-1 lg:px-2 py-0.5 lg:py-1 rounded">
                            {payment.feeType}
                          </span>
                        </td>
                        <td className="px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-gray-700 whitespace-nowrap border-b border-gray-200 capitalize">
                          <span className="bg-purple-100 text-purple-800 text-xs px-1 lg:px-2 py-0.5 lg:py-1 rounded">
                            {payment.paymentMode?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm border-b border-gray-200">
                          {getStatusBadge(payment.verificationStatus)}
                          {payment.verificationStatus === 'pending' && (
                            <div className="text-xs text-yellow-600 mt-1 hidden lg:block">Waiting for admin approval</div>
                          )}
                          {payment.verificationStatus === 'rejected' && payment.verificationNotes && (
                            <div className="text-xs text-red-600 mt-1 hidden lg:block">Reason: {payment.verificationNotes}</div>
                          )}
                        </td>
                        <td className="px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-gray-500 whitespace-nowrap border-b border-gray-200">
                          {formatDate(payment.date)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer with Pagination */}
          {filteredPayments.length > 0 && (
            <div className="flex-shrink-0 bg-gray-50 px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-center space-y-3 lg:space-y-0">
                {/* Records Info */}
                <div className="text-xs lg:text-sm text-gray-700">
                  Showing <span className="font-semibold">{currentRecords.length}</span> of{' '}
                  <span className="font-semibold">{filteredPayments.length}</span> payments 
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
                  Total: {counsellorPayments.length} payments • 
                  Approved: {formatCurrency(paymentStats.approvedAmount)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 lg:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800">
                  Record Payment
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <PaymentForm onClose={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;