import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  getAllCounsellors,
  registerUser,
  clearError,
  clearSuccess
} from '../../../store/slices/authSlice';
import axios from 'axios';

const CounsellorManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    counsellors: { list: counsellors, loading, error, pagination },
    success
  } = useSelector(state => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [openpop, setopenpopUp] = useState(false); // registration modal state

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
  { key: 'FullName', label: 'Full Name', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'phone', label: 'Phone', visible: true },
  { key: 'education', label: 'Education', visible: true },
  { key: 'role', label: 'Role', visible: true },
  { key: 'createdAt', label: 'Created Date', visible: true },
  { key: 'updatedAt', label: 'Last Updated', visible: false },
  { key: 'actions', label: 'Actions', visible: true }
];

  const [columns, setColumns] = useState(allColumns);

  // Registration form state
  const [formData, setFormData] = useState({
    FullName: '',
    email: '',
    password: '',
    role: 'Counsellor',
    phone: '',
    education: ''
  });
  const [localMessage, setLocalMessage] = useState('');
  const { FullName, email, password, phone , education } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalMessage('');
    dispatch(clearError());

    if (!FullName.trim()) {
      setLocalMessage('FullName is required');
      return;
    }
    if (!validateEmail(email)) {
      setLocalMessage('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setLocalMessage('Password must be at least 6 characters');
      return;
    }
    const token = localStorage.getItem('token');

    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}api/auth/register`,
      formData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log(response);
    if (response.status === 201) {
      setopenpopUp(false);
    };
  }

  // Handle success/error toasts and close modal on success
  useEffect(() => {
    if (success) {
      toast.success('Counsellor added successfully!');
      setopenpopUp(false); // close modal
      dispatch(clearSuccess());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const displayMessage = localMessage || error || success;

  // Fetch counsellors on mount
  useEffect(() => {
    dispatch(getAllCounsellors());
  }, [dispatch]);

  // Auto-clear global messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Click outside detection for dropdowns
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

  const handleViewDetails = (counsellor) => {
    setSelectedCounsellor(counsellor);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedCounsellor(null);
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

  // Filter counsellors based on search
  const filteredCounsellors = counsellors.filter(counsellor => {
    const matchesSearch =
      counsellor.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counsellor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counsellor.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counsellor.role?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCounsellors.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredCounsellors.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const getRoleBadge = (role) => {
    return role === 'admin' ? (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#890c25]/10 text-[#890c25] border border-[#890c25]/20">Admin</span>
    ) : (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#890c25]/10 text-[#890c25] border border-[#890c25]/20">Counsellor</span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 25) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const handleSubmitPopUp = () => {
    setopenpopUp(true);
  };

  if (loading && counsellors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#890c25]"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header Section - Mobile Optimized */}
      <div className="flex-shrink-0 bg-white p-3 sm:p-4 lg:p-6 border-b border-[#890c25]/20 sticky top-0 z-20 shadow-sm">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          {/* Title and Add Button Row */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Counsellor Management</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">View and manage counsellor information</p>
            </div>
            
            {/* Add Counsellor Button - Mobile Optimized */}
            <button 
              onClick={handleSubmitPopUp}
              className="bg-[#890c25] hover:bg-[#6e091d] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center gap-1 shadow-sm"
            >
              <span className="text-base sm:text-lg">+</span>
              <span className="hidden xs:inline">Add</span>
              <span className="hidden sm:inline">Counsellor</span>
            </button>
          </div>

          {/* Search and Actions Row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Search Input - Visible on all screens */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search counsellors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#890c25] focus:border-transparent text-xs sm:text-sm"
                />
                <span className="absolute left-2.5 top-2 text-gray-400">🔍</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Filter Button */}
              <div className="relative">
                <button
                  ref={filterButtonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFilterMenu(!showFilterMenu);
                    setShowColumnsMenu(false);
                  }}
                  className="flex items-center space-x-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-xs sm:text-sm"
                >
                  <span className="text-sm">🔍</span>
                  <span className="hidden sm:inline">Filter</span>
                  <span className="text-xs">▼</span>
                </button>
                
                {showFilterMenu && (
                  <div
                    ref={filterMenuRef}
                    className="absolute right-0 mt-2 w-64 sm:w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                  >
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-3 text-sm">Search Counsellors</h3>
                      <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#890c25] focus:border-transparent text-sm"
                        autoFocus
                      />
                      <div className="mt-4 flex justify-between">
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setShowFilterMenu(false);
                          }}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setShowFilterMenu(false)}
                          className="px-4 py-2 bg-[#890c25] text-white text-sm rounded-lg hover:bg-[#6e091d] transition-colors"
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
                  className="flex items-center space-x-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-xs sm:text-sm"
                >
                  <span className="text-sm">📊</span>
                  <span className="hidden sm:inline">Columns</span>
                  <span className="text-xs">▼</span>
                </button>

                {showColumnsMenu && (
                  <div
                    ref={columnsMenuRef}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-800 text-sm">Show/Hide Columns</h3>
                        <div className="flex space-x-2">
                          <button onClick={selectAllColumns} className="text-xs text-[#890c25] hover:text-[#6e091d]">
                            Select All
                          </button>
                          <button onClick={deselectAllColumns} className="text-xs text-gray-500 hover:text-gray-700">
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
                              className="text-[#890c25] focus:ring-[#890c25] rounded"
                            />
                            <span className="text-sm text-gray-700">{column.label}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                        <button
                          onClick={() => setShowColumnsMenu(false)}
                          className="px-4 py-2 bg-[#890c25] text-white text-sm rounded-lg hover:bg-[#6e091d] transition-colors"
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
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span className="text-sm">{success}</span>
            </div>
            <button onClick={() => dispatch(clearSuccess())} className="text-green-700 hover:text-green-900 text-xl">×</button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span className="text-sm">{error}</span>
            </div>
            <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900 text-xl">×</button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 bg-gray-50 p-2 sm:p-3 lg:p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
          {/* Table with Horizontal Scroll on Mobile */}
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="overflow-x-auto h-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {columns.map(column =>
                      column.visible && (
                        <th key={column.key} className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50">
                          {column.label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={columns.filter(col => col.visible).length} className="px-4 lg:px-6 py-8 lg:py-12 text-center">
                        <div className="text-gray-500">
                          <span className="text-3xl lg:text-4xl mb-2 block">👨‍💼</span>
                          <p className="text-base lg:text-lg font-medium">
                            {counsellors.length === 0 ? 'No counsellors found' : 'No matching counsellors'}
                          </p>
                          <p className="text-xs lg:text-sm">
                            {counsellors.length === 0
                              ? 'Counsellors will appear here once they register.'
                              : 'Try adjusting your search terms.'}
                          </p>
                          {searchTerm && (
                            <button 
                              onClick={() => setSearchTerm('')} 
                              className="mt-3 text-[#890c25] hover:text-[#6e091d] text-sm font-medium"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentRecords.map((counsellor, index) => (
                      <tr key={counsellor._id} className={`transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-[#890c25]/5`}>
                        {columns.map(column => {
                          if (!column.visible) return null;
                          const baseCellClasses = "px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs sm:text-sm border-b border-gray-200";
                          
                          switch (column.key) {
                            case 'FullName':
                              return (
                                <td key={column.key} className={`${baseCellClasses} font-medium text-gray-900 whitespace-nowrap`}>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-[#890c25]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-[#890c25] font-semibold text-xs sm:text-sm">
                                        {counsellor.FullName?.charAt(0)?.toUpperCase() || 'C'}
                                      </span>
                                    </div>
                                    <span className="truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none">
                                      {counsellor.FullName}
                                    </span>
                                  </div>
                                </td>
                              );
                            
                            case 'education':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  <span className="truncate max-w-[100px] lg:max-w-none block">
                                    {counsellor.education || '-'}
                                  </span>
                                </td>
                              );
                            
                            case 'email':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  <span className="truncate max-w-[120px] lg:max-w-none block">
                                    {truncateText(counsellor.email, 20)}
                                  </span>
                                </td>
                              );
                            
                            case 'phone':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {counsellor.phone || '-'}
                                </td>
                              );
                            
                            case 'role':
                              return (
                                <td key={column.key} className={`${baseCellClasses}`}>
                                  {getRoleBadge(counsellor.role)}
                                </td>
                              );
                            
                            case 'createdAt':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  <div className="flex flex-col">
                                    <span>{formatDate(counsellor.createdAt)}</span>
                                    {counsellor.updatedAt && counsellor.updatedAt !== counsellor.createdAt && (
                                      <span className="text-[10px] text-gray-400">Updated</span>
                                    )}
                                  </div>
                                </td>
                              );
                            
                            case 'updatedAt':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {formatDate(counsellor.updatedAt)}
                                </td>
                              );
                            
                            case 'actions':
                              return (
                                <td key={column.key} className={`${baseCellClasses}`}>
                                  <button
                                    onClick={() => handleViewDetails(counsellor)}
                                    className="text-[#890c25] hover:text-[#6e091d] px-2 py-1 rounded hover:bg-[#890c25]/5 transition-colors border border-[#890c25]/20 text-xs font-medium"
                                  >
                                    View
                                  </button>
                                </td>
                              );
                            
                            default:
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700`}>
                                  {counsellor[column.key] || '-'}
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

          {/* Pagination - Mobile Optimized */}
          {filteredCounsellors.length > 0 && (
            <div className="flex-shrink-0 bg-gray-50 px-3 sm:px-4 lg:px-6 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                {/* Records Info */}
                <div className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
                  Showing <span className="font-semibold">{currentRecords.length}</span> of{' '}
                  <span className="font-semibold">{filteredCounsellors.length}</span>
                  <span className="hidden xs:inline"> counsellors</span>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-2 sm:px-3 py-1 rounded-lg border text-xs sm:text-sm font-medium transition-colors duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-[#890c25]'
                    }`}
                  >
                    ←
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {getPageNumbers().map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`min-w-[28px] sm:min-w-[32px] px-1.5 sm:px-2 py-1 rounded-lg border text-xs sm:text-sm font-medium transition-colors duration-200 ${
                          currentPage === number
                            ? 'bg-[#890c25] text-white border-[#890c25]'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-[#890c25]'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-2 sm:px-3 py-1 rounded-lg border text-xs sm:text-sm font-medium transition-colors duration-200 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-[#890c25]'
                    }`}
                  >
                    →
                  </button>
                </div>

                {/* Total Count - Hidden on mobile */}
                <div className="hidden sm:block text-xs lg:text-sm text-gray-500 order-3">
                  Total: {counsellors.length} counsellors
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Counsellor Details Modal - Mobile Optimized */}
      {showDetailsModal && selectedCounsellor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50" onClick={handleCloseDetails}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-white pb-2 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Counsellor Details</h2>
                <button onClick={handleCloseDetails} className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center">×</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {/* Personal Information */}
                <div className="bg-[#890c25]/5 p-3 sm:p-4 rounded-lg border border-[#890c25]/10">
                  <h3 className="text-base sm:text-lg font-semibold text-[#890c25] mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Full Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedCounsellor.FullName}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Email</label>
                      <p className="mt-1 text-sm text-gray-900 break-all">{selectedCounsellor.email}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedCounsellor.phone || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Role Information */}
                <div className="bg-[#890c25]/5 p-3 sm:p-4 rounded-lg border border-[#890c25]/10">
                  <h3 className="text-base sm:text-lg font-semibold text-[#890c25] mb-3">Role Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Role</label>
                      <div className="mt-1">{getRoleBadge(selectedCounsellor.role)}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Education</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedCounsellor.education || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">User ID</label>
                      <p className="mt-1 text-xs text-gray-900 font-mono break-all">{selectedCounsellor._id}</p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-[#890c25]/5 p-3 sm:p-4 rounded-lg border border-[#890c25]/10 md:col-span-2">
                  <h3 className="text-base sm:text-lg font-semibold text-[#890c25] mb-3">Account Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Account Created</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCounsellor.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Last Updated</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCounsellor.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleCloseDetails} 
                  className="px-4 py-2 bg-[#890c25] text-white rounded-lg hover:bg-[#6e091d] transition-colors duration-200 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form Modal - Mobile Optimized */}
      {openpop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50" onClick={() => setopenpopUp(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Add New Counsellor</h2>
                <button onClick={() => setopenpopUp(false)} className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center">×</button>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                {/* FullName */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="FullName"
                    value={FullName}
                    onChange={onChange}
                    placeholder="Enter full name"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#890c25] focus:border-transparent text-sm"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="Enter email address"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#890c25] focus:border-transparent text-sm"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Enter password (min. 6 characters)"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#890c25] focus:border-transparent text-sm"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={onChange}
                    placeholder="Enter mobile number"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#890c25] focus:border-transparent text-sm"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Education */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Education <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={education}
                    onChange={onChange}
                    placeholder="Enter education background"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#890c25] focus:border-transparent text-sm"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setopenpopUp(false)}
                    className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full sm:w-auto px-6 py-2 bg-[#890c25] hover:bg-[#6e091d] text-white rounded-lg font-semibold transition text-sm order-1 sm:order-2 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Adding...' : 'Add Counsellor'}
                  </button>
                </div>

                {/* Message display inside modal */}
                {displayMessage && (
                  <p className={`mt-4 text-center text-sm ${
                    localMessage || error ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {displayMessage}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounsellorManagement;