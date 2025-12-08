
import React, { useState, useEffect, useRef } from 'react';
import {
  getAllGrievances,
  approveGrievance,
  rejectGrievance,
} from '../../../store/api/campusAPI';

const CampusGrievanceAdmin = () => {
  const [grievances, setGrievances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filterButtonRef = useRef(null);
  const filterMenuRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    fetchGrievances();
  }, []);

  useEffect(() => {
    if (success) {
      setShowModal(false);
      setSelectedGrievance(null);
      setAdminResponse('');
      setTimeout(() => setSuccess(''), 3000);
    }
  }, [success]);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(e.target) &&
        !filterButtonRef.current.contains(e.target)
      ) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
      }
    };
    if (showModal) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const fetchGrievances = async () => {
    try {
      const data = await getAllGrievances();
      setGrievances(data);
    } catch {
      setError('Failed to fetch grievances');
    }
  };

  const handleStatusUpdate = (grievance, status) => {
    setSelectedGrievance(grievance);
    setSelectedStatus(status);
    setAdminResponse(grievance.adminResponse || '');
    setShowModal(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedGrievance) return;
    setLoading(true);
    try {
      if (selectedStatus === 'approved') {
        await approveGrievance(selectedGrievance._id, { adminResponse });
        setSuccess('Grievance approved successfully!');
      } else if (selectedStatus === 'rejected') {
        await rejectGrievance(selectedGrievance._id, { adminResponse });
        setSuccess('Grievance rejected successfully!');
      }
      fetchGrievances();
    } catch {
      setError(`Failed to ${selectedStatus} grievance`);
    } finally {
      setLoading(false);
    }
  };

  // Filter grievances
  const filteredGrievances = grievances.filter((g) => {
    const matchesSearch =
      (g.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (g.complaint?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (g.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || g.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Sort grievances by creation date (newest first)
  const sortedGrievances = [...filteredGrievances].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Pagination calculations
  const totalItems = sortedGrievances.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGrievances = sortedGrievances.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status) {
      case 'submittedToAdmin':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const formatStatus = (status) => {
    const statusMap = {
      'submittedToAdmin': 'Pending Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'pending': 'Pending'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 rounded-xl shadow-md p-4 sm:p-5 md:p-6 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide">
              Campus Grievance Management
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-blue-100 mt-1 lg:mt-2">
              Review, approve, or reject grievances submitted by students.
            </p>
          </div>

          {/* Quick Status Summary */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <span className="inline-flex items-center bg-white text-blue-700 font-semibold px-3 py-1 rounded-full shadow-sm text-xs sm:text-sm">
              📊 {grievances?.length || 0} Total
            </span>
            <span className="inline-flex items-center bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full shadow-sm text-xs sm:text-sm">
              ✅ {grievances.filter((g) => g.status === 'approved').length} Approved
            </span>
            <span className="inline-flex items-center bg-yellow-100 text-yellow-700 font-semibold px-3 py-1 rounded-full shadow-sm text-xs sm:text-sm">
              ⏳ {
                grievances.filter(
                  (g) =>
                    g.status === 'submittedToAdmin' || g.status === 'pending'
                ).length
              } Pending
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="mb-4 space-y-3">
        {success && (
          <div className="p-3 sm:p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-xs sm:text-sm md:text-base flex items-center justify-between">
            <span className="flex items-center">
              <span className="mr-2">✅</span>
              {success}
            </span>
            <button
              onClick={() => setSuccess('')}
              className="text-green-600 hover:text-green-800 text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}
        {error && (
          <div className="p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs sm:text-sm md:text-base flex items-center justify-between">
            <span className="flex items-center">
              <span className="mr-2">❌</span>
              {error}
            </span>
            <button
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800 text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Section */}
      <div className="mb-4 bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, subject, or complaint..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              ref={filterButtonRef}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 w-full sm:w-auto text-sm sm:text-base font-medium"
            >
              <span>📂 Filter</span>
              <span className={`transform transition-transform ${showFilterMenu ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {showFilterMenu && (
              <div
                ref={filterMenuRef}
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
              >
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Filter by Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['all', 'submittedToAdmin', 'approved', 'rejected'].map((status) => (
                      <label key={status} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={filterStatus === status}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="text-blue-500 focus:ring-blue-500"
                        />
                        <span className="capitalize text-xs sm:text-sm">
                          {status === 'all' ? 'All Status' : formatStatus(status)}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Items per page</h3>
                    </div>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => {
                        setFilterStatus('all');
                        setSearchTerm('');
                      }}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded border border-gray-300"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => setShowFilterMenu(false)}
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 border border-blue-500"
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

      {/* Results Summary Section */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="text-sm sm:text-base font-medium text-gray-700">
              Showing <span className="font-bold text-blue-700">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> of{' '}
              <span className="font-bold text-blue-700">{totalItems}</span> grievances
            </span>
            
            {/* Active Filters Badges */}
            <div className="flex flex-wrap gap-2">
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                  Status: {formatStatus(filterStatus)}
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="flex items-center space-x-1 px-3 py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <span>🗑️</span>
              <span>Clear all filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop & Tablet Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Submitter', 'Subject', 'Description', 'Status', 'Submitted', 'Actions'].map(
                  (head) => (
                    <th
                      key={head}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                    >
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentGrievances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center py-8">
                      <span className="text-4xl mb-2">📝</span>
                      <p className="text-gray-500">No grievances found</p>
                      {(searchTerm || filterStatus !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterStatus('all');
                          }}
                          className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Clear filters to see all grievances
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentGrievances.map((g) => (
                  <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{g.name}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <p className="truncate">{g.subject}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 line-clamp-2">{g.complaint}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          g.status
                        )}`}
                      >
                        {formatStatus(g.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(g.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      {(g.status === 'submittedToAdmin' || g.status === 'pending') ? (
                        <div className="flex flex-col xs:flex-row gap-2">
                          <button
                            onClick={() => handleStatusUpdate(g, 'approved')}
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium border border-green-200"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(g, 'rejected')}
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium border border-red-200"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination for Desktop */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-700">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> •{' '}
                <strong>{totalItems}</strong> total items
              </div>
              
              <div className="flex items-center space-x-1">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <span className="mr-1">←</span>
                  Previous
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-gray-500 text-sm">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 text-sm border rounded-lg min-w-[36px] ${
                        currentPage === page
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Next
                  <span className="ml-1">→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {currentGrievances.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <span className="text-4xl mb-2 block">📝</span>
            <p className="text-gray-500 mb-2">No grievances found</p>
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Clear filters to see all grievances
              </button>
            )}
          </div>
        ) : (
          currentGrievances.map((g) => (
            <div
              key={g._id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{g.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{g.subject}</p>
                </div>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    g.status
                  )}`}
                >
                  {formatStatus(g.status)}
                </span>
              </div>

              {/* Complaint */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{g.complaint}</p>

              {/* Meta Info */}
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>Submitted: {new Date(g.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              {(g.status === 'submittedToAdmin' || g.status === 'pending') ? (
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleStatusUpdate(g, 'approved')}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium border border-green-200"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(g, 'rejected')}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium border border-red-200"
                  >
                    ❌ Reject
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-center text-gray-500 text-xs">Already Processed</p>
                </div>
              )}
            </div>
          ))
        )}

        {/* Pagination for Mobile */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col items-center space-y-3">
              <div className="text-sm text-gray-600 text-center">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex items-center space-x-2 w-full justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex-1 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <select
                  value={currentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white mx-2"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <option key={page} value={page}>
                      {page}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex-1 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedGrievance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 px-3 sm:px-4">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-sm sm:max-w-md p-4 sm:p-5 md:p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">
              {selectedStatus === 'approved' ? 'Approve' : 'Reject'} Grievance
            </h3>
            
            <div className="mb-3 sm:mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Student:</strong> {selectedGrievance.name}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Subject:</strong> {selectedGrievance.subject}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Complaint:</strong> {selectedGrievance.complaint}
              </p>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Response {selectedStatus === 'rejected' && '(Recommended)'}
            </label>
            <textarea
              rows={4}
              placeholder="Enter your response here..."
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            />
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === 'approved'
                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                    : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                } disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Processing...
                  </span>
                ) : selectedStatus === 'approved' ? (
                  '✅ Approve'
                ) : (
                  '❌ Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusGrievanceAdmin;