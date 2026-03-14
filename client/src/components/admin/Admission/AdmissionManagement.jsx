import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdmissions,
  updateAdmission,
  deleteAdmission,
  updateAdmissionStatus,
  clearError,
  clearSuccess
} from '../../../store/slices/admissionSlice';
import AdmissionForm from './AdmissionForm';
import { fetchStudents } from '../../../store/slices/studentSlice';

const AdmissionManagement = () => {
  const dispatch = useDispatch();
  const {
    admissions,
    loading,
    error,
    operationSuccess,
    currentAdmission,
    stats
  } = useSelector(state => state.admissions);
   const studentState = useSelector((state) => state.students || { students: [] });

  const [showForm, setShowForm] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [imageTitle, setImageTitle] = useState('');

  // NEW: Email verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [admissionToVerify, setAdmissionToVerify] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(7);

  // Refs for dropdown menus
  const filterMenuRef = useRef(null);
  const columnsMenuRef = useRef(null);
  const filterButtonRef = useRef(null);
  const columnsButtonRef = useRef(null);
  const { students } = studentState;

  // Define all available columns
  const allColumns = [
    { key: 'admissionNo', label: 'Admission No', visible: true },
    { key: 'student', label: 'Student', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'course', label: 'Course', visible: true },
    { key: 'trainingBranch', label: 'Branch', visible: true },
    { key: 'counsellor', label: 'Counsellor', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'admissionDate', label: 'Admission Date', visible: true },
    { key: 'documents', label: 'Documents', visible: true },
    { key: 'appliedBatch', label: 'Applied Batch', visible: false },
    { key: 'source', label: 'Source', visible: false },
    // { key: 'emailVerified', label: 'Email Verified', visible: true },
    { key: 'notes', label: 'Notes', visible: false },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  const [columns, setColumns] = useState(allColumns);

  useEffect(() => {
    console.log("Admin: Dispatching fetchAdmissions...");
    dispatch(fetchAdmissions());
    dispatch(fetchStudents());
  }, [dispatch]);



  useEffect(() => {
    if (operationSuccess && !showForm) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [operationSuccess, dispatch, showForm]);

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

  const handleDelete = async (admissionId) => {
    if (window.confirm('Are you sure you want to delete this admission? This action cannot be undone.')) {
      try {
        await dispatch(deleteAdmission(admissionId)).unwrap();
        dispatch(fetchAdmissions());
        // Reset to first page if current page becomes empty
        if (filteredAdmissions.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleStatusUpdate = async (admissionId, newStatus) => {
    if (window.confirm(`Are you sure you want to change status to ${newStatus.replace('_', ' ')}?`)) {
      try {
        await dispatch(updateAdmissionStatus({
          admissionId,
          statusData: { status: newStatus }
        })).unwrap();
        dispatch(fetchAdmissions());
      } catch (error) {
        console.error('Status update failed:', error);
      }
    }
  };

  const handleEdit = (admission) => {
    setEditingAdmission(admission);
    setShowForm(true);
  };

  const handleViewDetails = (admission) => {
    setSelectedAdmission(admission);
    setShowDetailsModal(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAdmission(null);
    dispatch(fetchAdmissions());
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedAdmission(null);
  };

  const handleImageClick = (imageUrl, title) => {
    console.log('📄 Opening document:', title, imageUrl);
    setSelectedImage(imageUrl);
    setImageTitle(title);
    setShowImageModal(true);
  };

  // Alternative: Direct PDF opening in new tab (can be used for quick access)
  const handlePdfClick = (pdfUrl, title) => {
    console.log('📄 Opening PDF in new tab:', title, pdfUrl);
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage('');
    setImageTitle('');
  };

  // NEW: Function to open the email verification modal
  const openVerifyModal = (admission) => {
    setAdmissionToVerify(admission);
    setShowVerifyModal(true);
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

  // Filter admissions based on active filters and search
  const filteredAdmissions = admissions.filter(admission => {
    const matchesStatus = filterStatus === 'all' || admission.status === filterStatus;

    const matchesSearch =
      admission.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.trainingBranch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.counsellor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.appliedBatch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admission.student && typeof admission.student === 'object' ?
        admission.student.name?.toLowerCase().includes(searchTerm.toLowerCase()) :
        false) ||
      (admission.course && typeof admission.course === 'object' ?
        admission.course.name?.toLowerCase().includes(searchTerm.toLowerCase()) :
        false);

    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredAdmissions.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredAdmissions.length / recordsPerPage);

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      waiting_list: { color: 'bg-blue-100 text-blue-800', label: 'Waiting List' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const truncateText = (text, maxLength = 25) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const getStudentName = (student) => {
    if (!student) return 'N/A';
    if (typeof student === 'object') {
      return student.name || 'N/A';
    }
    return 'N/A';
  };

  const getCourseName = (course) => {
    if (!course) return 'N/A';
    if (typeof course === 'object') {
      return course.name || 'N/A';
    }
    return 'N/A';
  };

  // ========== IMPROVED: getFilePreview with clickable PDF and fixed tooltip ==========
  const getFilePreview = (url, title = 'Document') => {
    if (!url) return null;

    if (url.toLowerCase().endsWith('.pdf')) {
      return (
        <div
          onClick={() => handleImageClick(url, title)}
          className="relative flex items-center space-x-2 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors duration-200 group"
          title={`Click to view ${title}`}
        >
          <span>📄</span>
          <span className="text-sm hidden lg:inline">PDF</span>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Click to view PDF
          </div>
        </div>
      );
    } else if (/\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(url)) {
      // Image files
      return (
        <div
          onClick={() => handleImageClick(url, title)}
          className="flex items-center space-x-2 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors duration-200"
          title={`Click to view ${title}`}
        >
          <span>🖼️</span>
          <span className="text-sm hidden lg:inline">Image</span>
        </div>
      );
    } else {
      // Fallback for other file types (though unlikely)
      return (
        <div className="flex justify-center">
          <img
            src={url}
            alt={title}
            className="w-6 h-6 lg:w-8 lg:h-8 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={() => handleImageClick(url, title)}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      );
    }
  };

  const getDocumentCount = (admission) => {
    let count = 0;
    if (admission.admissionFrontPage) count++;
    if (admission.admissionBackPage) count++;
    if (admission.studentStatement) count++;
    if (admission.confidentialForm) count++;
    return count;
  };

  const getStatusActions = (admission) => {
    if (admission.status === 'pending') {
      return (
        <div className="flex flex-col lg:flex-row space-y-1 lg:space-y-0 lg:space-x-1">
          <button
            onClick={() => openVerifyModal(admission)}  // MODIFIED: now opens verification modal
            className="text-green-600 hover:text-green-900 px-1 lg:px-2 py-1 rounded hover:bg-green-50 transition-colors border border-green-200 text-xs w-full lg:w-auto"
          >
            ✅ Approve
          </button>
          <button
            onClick={() => handleStatusUpdate(admission._id, 'rejected')}
            className="text-red-600 hover:text-red-900 px-1 lg:px-2 py-1 rounded hover:bg-red-50 transition-colors border border-red-200 text-xs w-full lg:w-auto"
          >
            ❌ Reject
          </button>
          <button
            onClick={() => handleStatusUpdate(admission._id, 'waiting_list')}
            className="text-blue-600 hover:text-blue-900 px-1 lg:px-2 py-1 rounded hover:bg-blue-50 transition-colors border border-blue-200 text-xs w-full lg:w-auto"
          >
            ⏳ Wait List
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => handleStatusUpdate(admission._id, 'pending')}
        className="text-gray-600 hover:text-gray-900 px-1 lg:px-2 py-1 rounded hover:bg-gray-50 transition-colors border border-gray-200 text-xs w-full lg:w-auto"
      >
        🔄 Reset
      </button>
    );
  };

  // Admin Statistics
  const getAdminStats = () => {
    const stats = {
      total: admissions.length,
      pending: admissions.filter(a => a.status === 'pending').length,
      approved: admissions.filter(a => a.status === 'approved').length,
      rejected: admissions.filter(a => a.status === 'rejected').length,
      waiting: admissions.filter(a => a.status === 'waiting_list').length
    };

    return stats;
  };

  const adminStats = getAdminStats();

  if (loading && admissions.length === 0) {
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
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Admission Management</h1>
              <p className="text-gray-600 text-sm lg:text-base">Review and manage student admissions</p>

              {/* Admin Stats */}
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="text-xs bg-blue-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-blue-700">Total: {adminStats.total}</span>
                </div>
                <div className="text-xs bg-yellow-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-yellow-700">Pending: {adminStats.pending}</span>
                </div>
                <div className="text-xs bg-green-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-green-700">Approved: {adminStats.approved}</span>
                </div>
                <div className="text-xs bg-red-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-red-700">Rejected: {adminStats.rejected}</span>
                </div>
                <div className="text-xs bg-indigo-50 px-2 py-1 rounded-full">
                  <span className="font-semibold text-indigo-700">Waiting: {adminStats.waiting}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Search Input - Mobile Only */}
            <div className="lg:hidden flex-1">
              <input
                type="text"
                placeholder="Search admissions..."
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
                  className="absolute right-0 mt-2 w-64 lg:w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">Filter by Status</h3>
                    <div className="space-y-2">
                      {['all', 'pending', 'approved', 'rejected', 'waiting_list'].map(status => (
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
                            {status === 'all' ? 'All Status' : status.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">Search</h3>
                      <input
                        type="text"
                        placeholder="Search admissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={() => {
                          setFilterStatus('all');
                          setSearchTerm('');
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilterMenu(false)}
                        className="px-4 py-2 bg-[#890c25] text-white text-sm rounded-lg hover:bg-[#890c25]"
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
                        <label key={column.key} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer text-center">
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
                        className="px-4 py-2 bg-[#890c25] text-white text-sm rounded-lg hover:bg-[#890c25]"
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
        {operationSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span className="text-sm">{operationSuccess}</span>
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
                          className="px-2 lg:px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50 text-center"
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
                            {admissions.length === 0 ? 'No admissions found' : 'No matching admissions'}
                          </p>
                          <p className="text-xs lg:text-sm">
                            {admissions.length === 0
                              ? 'Admissions will appear here once counsellors create them.'
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
                    currentRecords.map((admission, index) => (
                      <tr
                        key={admission._id}
                        className={`transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-blue-50`}
                      >
                        {columns.map(column => {
                          if (!column.visible) return null;

                          // Common cell styling
                          const baseCellClasses = "px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm border-b border-gray-200";

                          switch (column.key) {
                            case 'admissionNo':
                              return (
                                <td key={column.key} className={`${baseCellClasses} font-semibold text-gray-900 whitespace-nowrap`}>
                                  <button
                                    onClick={() => handleViewDetails(admission)}
                                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
                                  >
                                    <span className="bg-blue-100 text-blue-800 text-xs px-1 lg:px-2 py-0.5 lg:py-1 rounded">
                                      #{admission.admissionNo}
                                    </span>
                                  </button>
                                </td>
                              );
                            case 'student':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  <div className="font-medium">{getStudentName(admission.student)}</div>
                                </td>
                              );
                            case 'email':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {admission.student && typeof admission.student === 'object' ?
                                    (admission.student.email || 'N/A') : 'N/A'}
                                </td>
                              );
                            case 'course':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  <span className="bg-purple-100 text-purple-800 text-xs px-1 lg:px-2 py-0.5 lg:py-1 rounded">
                                    {getCourseName(admission.course)}
                                  </span>
                                </td>
                              );
                            case 'trainingBranch':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {admission.trainingBranch}
                                </td>
                              );
                            case 'counsellor':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  <span className="bg-green-100 text-green-800 text-xs px-1 lg:px-2 py-0.5 lg:py-1 rounded">
                                    {admission.counsellor}
                                  </span>
                                </td>
                              );
                            case 'status':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  {getStatusBadge(admission.status)}
                                </td>
                              );
                            case 'admissionDate':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  <div className="flex flex-col items-start">
                                    <span>{formatDate(admission.admissionDate)}</span>
                                  </div>
                                </td>
                              );
                            case 'documents':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  <div className="flex justify-center space-x-1">
                                    {admission.admissionFrontPage && getFilePreview(admission.admissionFrontPage, 'Front Page')}
                                    {admission.admissionBackPage && getFilePreview(admission.admissionBackPage, 'Back Page')}
                                    {admission.studentStatement && getFilePreview(admission.studentStatement, 'Student Statement')}
                                    {admission.confidentialForm && getFilePreview(admission.confidentialForm, 'Confidential Form')}
                                    {getDocumentCount(admission) === 0 && (
                                      <span className="text-gray-400 text-xs">No docs</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 hidden lg:block">
                                    {getDocumentCount(admission)}/4 docs
                                  </div>
                                </td>
                              );
                            case 'appliedBatch':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {admission.appliedBatch || '-'}
                                </td>
                              );
                            case 'source':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap capitalize`}>
                                  <span className="bg-gray-100 text-gray-800 text-xs px-1 lg:px-2 py-0.5 lg:py-1 rounded">
                                    {admission.source?.replace('_', ' ') || '-'}
                                  </span>
                                </td>
                              );
                            case 'emailVerified':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${admission.emailVerified
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {admission.emailVerified ? '✅' : '⏳'}
                                    <span className="hidden lg:inline ml-1">{admission.emailVerified ? 'Verified' : 'Pending'}</span>
                                  </span>
                                </td>
                              );
                            case 'notes':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-600`}>
                                  {truncateText(admission.notes)}
                                </td>
                              );
                            case 'actions':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center whitespace-nowrap`}>
                                  <div className="flex flex-row lg:flex-row items-center justify-center space-x-2 lg:space-y-0 lg:space-x-1">
                                    <button
                                      onClick={() => handleEdit(admission)}
                                      className="text-blue-600 hover:text-blue-900 px-1 lg:px-2 py-1 rounded hover:bg-blue-50 transition-colors border border-blue-200 text-xs w-full lg:w-auto"
                                      title="Edit Admission"
                                    >
                                      Edit
                                    </button>
                                    {getStatusActions(admission)}
                                    <button
                                      onClick={() => handleDelete(admission._id)}
                                      className="text-red-600 hover:text-red-900 px-1 lg:px-2 py-1 rounded hover:bg-red-50 transition-colors border border-red-200 text-xs w-full lg:w-auto"
                                      title="Delete Admission"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              );
                            default:
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700`}>
                                  {admission[column.key] || '-'}
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
          {filteredAdmissions.length > 0 && (
            <div className="flex-shrink-0 bg-gray-50 px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-center space-y-3 lg:space-y-0">
                {/* Records Info */}
                <div className="text-xs lg:text-sm text-gray-700">
                  Showing <span className="font-semibold">{currentRecords.length}</span> of{' '}
                  <span className="font-semibold">{filteredAdmissions.length}</span> admissions
                  (Page <span className="font-semibold">{currentPage}</span> of{' '}
                  <span className="font-semibold">{totalPages}</span>)
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 lg:px-4 lg:py-2 rounded-lg border text-xs lg:text-sm font-medium transition-colors duration-200 ${currentPage === 1
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
                        className={`px-2 lg:px-3 py-1 lg:py-2 rounded-lg border text-xs lg:text-sm font-medium transition-colors duration-200 ${currentPage === number
                          ? 'bg-[#890c25] text-white border-blue-500'
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
                    className={`px-3 py-1 lg:px-4 lg:py-2 rounded-lg border text-xs lg:text-sm font-medium transition-colors duration-200 ${currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                  >
                    Next
                  </button>
                </div>

                {/* Total Records */}
                <div className="text-xs lg:text-sm text-gray-500">
                  Total: {admissions.length} admissions
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admission Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 lg:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800">
                  {editingAdmission ? 'Edit Admission' : 'Create New Admission'}
                </h2>
                <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <AdmissionForm
                admission={editingAdmission}
                onClose={handleCloseForm}
                isCounsellor={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Admission Details Modal */}
      {showDetailsModal && selectedAdmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 lg:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800">Admission Details</h2>
                <button onClick={handleCloseDetails} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {/* Personal Information */}
                <div className="bg-blue-50 p-3 lg:p-4 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold text-blue-800 mb-3 lg:mb-4">Admission Information</h3>
                  <div className="space-y-2 lg:space-y-3">
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Admission Number</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900 font-mono">{selectedAdmission.admissionNo}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Student</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{getStudentName(selectedAdmission.student)}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Course</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{getCourseName(selectedAdmission.course)}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Training Branch</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{selectedAdmission.trainingBranch}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Counsellor</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{selectedAdmission.counsellor}</p>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div className="bg-green-50 p-3 lg:p-4 rounded-lg">
                  <h3 className="text-base lg:text-lg font-semibold text-green-800 mb-3 lg:mb-4">Status Information</h3>
                  <div className="space-y-2 lg:space-y-3">
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedAdmission.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Admission Date</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{formatDate(selectedAdmission.admissionDate)}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Applied Batch</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900">{selectedAdmission.appliedBatch || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700">Source</label>
                      <p className="mt-1 text-xs lg:text-sm text-gray-900 capitalize">{selectedAdmission.source?.replace('_', ' ') || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-purple-50 p-3 lg:p-4 rounded-lg md:col-span-2">
                  <h3 className="text-base lg:text-lg font-semibold text-purple-800 mb-3 lg:mb-4 text-center">Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                    {/* Admission Front Page */}
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Admission Front Page</label>
                      <div className="mt-1">
                        {selectedAdmission.admissionFrontPage ? (
                          <div className="flex items-center space-x-2">
                            {getFilePreview(selectedAdmission.admissionFrontPage, 'Front Page')}
                            <button
                              onClick={() => handleImageClick(selectedAdmission.admissionFrontPage, 'Admission Front Page')}
                              className="text-blue-600 hover:text-blue-800 underline text-xs lg:text-sm"
                            >
                              View Document
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs lg:text-sm">Not uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Admission Back Page */}
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Admission Back Page</label>
                      <div className="mt-1">
                        {selectedAdmission.admissionBackPage ? (
                          <div className="flex items-center space-x-2">
                            {getFilePreview(selectedAdmission.admissionBackPage, 'Back Page')}
                            <button
                              onClick={() => handleImageClick(selectedAdmission.admissionBackPage, 'Admission Back Page')}
                              className="text-blue-600 hover:text-blue-800 underline text-xs lg:text-sm"
                            >
                              View Document
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs lg:text-sm">Not uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Student Statement */}
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Student Statement</label>
                      <div className="mt-1">
                        {selectedAdmission.studentStatement ? (
                          <div className="flex items-center space-x-2">
                            {getFilePreview(selectedAdmission.studentStatement, 'Student Statement')}
                            <button
                              onClick={() => handleImageClick(selectedAdmission.studentStatement, 'Student Statement')}
                              className="text-blue-600 hover:text-blue-800 underline text-xs lg:text-sm"
                            >
                              View Document
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs lg:text-sm">Not uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Confidential Form */}
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Confidential Form</label>
                      <div className="mt-1">
                        {selectedAdmission.confidentialForm ? (
                          <div className="flex items-center space-x-2">
                            {getFilePreview(selectedAdmission.confidentialForm, 'Confidential Form')}
                            <button
                              onClick={() => handleImageClick(selectedAdmission.confidentialForm, 'Confidential Form')}
                              className="text-blue-600 hover:text-blue-800 underline text-xs lg:text-sm"
                            >
                              View Document
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs lg:text-sm">Not uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {selectedAdmission.notes && (
                  <div className="bg-yellow-50 p-3 lg:p-4 rounded-lg md:col-span-2">
                    <h3 className="text-base lg:text-lg font-semibold text-yellow-800 mb-3 lg:mb-4">Notes</h3>
                    <p className="text-xs lg:text-sm text-gray-700">{selectedAdmission.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseDetails}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 text-sm lg:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4"
          onClick={handleCloseImageModal} // close on backdrop click
          role="dialog"
          aria-modal="true"
          aria-label={imageTitle || 'Document preview'}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />

          {/* Modal content */}
          <div
            className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            {/* Header with title and close button */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/50 to-transparent text-white z-10">
              <span className="font-medium truncate pr-8 text-sm sm:text-base">
                {imageTitle || 'Document'}
              </span>
              <button
                onClick={handleCloseImageModal}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="h-full w-full overflow-auto bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4">
              {selectedImage?.toLowerCase().endsWith('.pdf') ? (
                // PDF preview card
                <div className="text-center p-8 max-w-md">
                  <div className="text-7xl mb-4">📄</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    PDF Document
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    This file cannot be previewed inline. Download to view.
                  </p>
                  <a
                    href={selectedImage}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </a>
                </div>
              ) : (
                // Image display with loading/error handling
                <div className="relative max-w-full max-h-full">
                  <img
                    src={selectedImage}
                    alt={imageTitle || 'Document image'}
                    className="max-w-full max-h-[calc(90vh-8rem)] object-contain rounded-lg shadow-lg"
                    onLoad={(e) => {
                      // Optional: hide loader on load
                      e.currentTarget.style.opacity = '1';
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      // Show error fallback
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'text-center p-8';
                        fallback.innerHTML = `
                    <div class="text-5xl mb-10">🖼️</div>
                  `;
                        parent.appendChild(fallback);
                      }
                    }}
                    style={{ opacity: 0, transition: 'opacity 0.2s' }}
                  />
                  {/* Download button for images */}
                  <a
                    href={selectedImage}
                    download
                    className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-lg px-3 py-2 shadow-lg flex items-center space-x-2 text-sm font-medium backdrop-blur-sm transition-colors focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Download</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NEW: Email Verification Modal */}
      {showVerifyModal && admissionToVerify && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Verify Student Email
              </h3>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Please confirm the student's email address before approving this admission.
                </p>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Student Name</p>
                  <p className="text-sm font-medium">
                    {admissionToVerify.student && typeof admissionToVerify.student === 'object'
                      ? admissionToVerify.student.name || 'N/A'
                      : 'N/A'}
                  </p>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-sm font-mono break-all">
                    {admissionToVerify.student && typeof admissionToVerify.student === 'object'
                      ? admissionToVerify.student.email || 'No email provided'
                      : 'No email provided'}
                  </p>
                </div>

                {(!admissionToVerify.student?.email) && (
                  <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                    ⚠️ No email address found for this student. Consider updating the student record first.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setAdmissionToVerify(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleStatusUpdate(admissionToVerify._id, 'approved');
                    setShowVerifyModal(false);
                    setAdmissionToVerify(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                  disabled={!admissionToVerify.student?.email}
                >
                  Confirm & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionManagement;