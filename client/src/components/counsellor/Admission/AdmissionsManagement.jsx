import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAdmissions, 
  createAdmission, 
  updateAdmission, 
  deleteAdmission, 
  clearError,
  clearSuccess 
} from '../../../store/slices/admissionSlice';
import AdmissionForm from './AdmissionForm';

const AdmissionsManagement = () => {
  const dispatch = useDispatch();
  const { 
    admissions, 
    loading, 
    error, 
    operationSuccess, 
    currentAdmission,
    stats 
  } = useSelector(state => state.admissions);
  
  const [showForm, setShowForm] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);

  // Refs for dropdown menus
  const filterMenuRef = useRef(null);
  const columnsMenuRef = useRef(null);
  const filterButtonRef = useRef(null);
  const columnsButtonRef = useRef(null);

  // Define all available columns
  const allColumns = [
    { key: 'admissionNo', label: 'Admission No', visible: true },
    { key: 'student', label: 'Student', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'alternateEmail', label: 'Alternate Email', visible: true },
    { key: 'alternatePhone', label: 'Alternate Phone', visible: true },
    { key: 'dateOfBirth', label: 'Date of Birth', visible: true },
    { key: 'gender', label: 'Gender', visible: true },
    { key: 'course', label: 'Course', visible: true },
    { key: 'trainingBranch', label: 'Branch', visible: true },
    { key: 'counsellor', label: 'Counsellor', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'priority', label: 'Priority', visible: true },
    { key: 'admissionDate', label: 'Admission Date', visible: true },
    { key: 'appliedBatch', label: 'Applied Batch', visible: false },
    { key: 'source', label: 'Source', visible: false },
    { key: 'emailVerified', label: 'Email Verified', visible: false },
    { key: 'notes', label: 'Notes', visible: false },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  const [columns, setColumns] = useState(allColumns);

  useEffect(() => {
    console.log("Counsellor: Dispatching fetchAdmissions...");
    dispatch(fetchAdmissions());
  }, [dispatch]);

  useEffect(() => {
    if (operationSuccess && !showForm) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [operationSuccess, dispatch, showForm]);

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
      await dispatch(deleteAdmission(admissionId));
      dispatch(fetchAdmissions());
    }
  };

  // UPDATED: Counsellor can edit pending AND rejected admissions
  const handleEdit = (admission) => {
    const editableStatuses = ['pending', 'rejected'];
    
    if (!editableStatuses.includes(admission.status)) {
      alert('You can only edit admissions that are in pending or rejected status.');
      return;
    }
    setEditingAdmission(admission);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAdmission(null);
    dispatch(fetchAdmissions());
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

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
      medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
      high: { color: 'bg-red-100 text-red-800', label: 'High' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const truncateText = (text, maxLength = 30) => {
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

  // UPDATED: Check if admission can be edited by counsellor
  const canEditAdmission = (admission) => {
    const editableStatuses = ['pending', 'rejected'];
    return editableStatuses.includes(admission.status);
  };

  //Delete :check if status not equal to approved
  const canDeleteAdmission=(admissions)=>{
    return admissions.status !=='approved';
  }

  const getEditButtonTitle = (admission) => {
    if (admission.status === 'pending') return 'Edit Admission';
    if (admission.status === 'rejected') return 'Edit and resubmit rejected admission';
    return 'Cannot edit approved or waiting list admissions';
  };

  // Counsellor Statistics
  const getCounsellorStats = () => {
    const stats = {
      total: admissions.length,
      pending: admissions.filter(a => a.status === 'pending').length,
      approved: admissions.filter(a => a.status === 'approved').length,
      rejected: admissions.filter(a => a.status === 'rejected').length,
      waiting: admissions.filter(a => a.status === 'waiting_list').length,
      editable: admissions.filter(a => canEditAdmission(a)).length
    };
    
    return stats;
  };

  const counsellorStats = getCounsellorStats();

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
      <div className="flex-shrink-0 bg-white p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex justify-between items-center w-full lg:w-auto space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admission Management - Counsellor</h1>
              <p className="text-gray-600">Create and manage student admissions</p>
              
              {/* Counsellor Stats */}
              <div className="flex space-x-4 mt-2">
                <div className="text-sm">
                  <span className="font-semibold text-blue-600">Total: {counsellorStats.total}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-yellow-600">Pending: {counsellorStats.pending}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-green-600">Approved: {counsellorStats.approved}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-red-600">Rejected: {counsellorStats.rejected}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-purple-600">Editable: {counsellorStats.editable}</span>
                </div>
              </div>
            </div>
            
            {/* Add New Admission Button - ONLY FOR COUNSELLOR */}
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>+</span>
              <span>New Admission</span>
            </button>
          </div>
          
          {/* Filter and Columns buttons remain the same */}
          <div className="flex items-center space-x-3 p-3 rounded-lg">
            {/* Filter Button */}
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterMenu(!showFilterMenu);
                  setShowColumnsMenu(false);
                }}
                className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <span>🔍</span>
                <span>Filter</span>
                <span>▼</span>
              </button>

              {showFilterMenu && (
                <div 
                  ref={filterMenuRef}
                  className="absolute right-0 left-2 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Filter by Status</h3>
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
                          <span className="capitalize">
                            {status === 'all' ? 'All Status' : status.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-3">Search</h3>
                      <input
                        type="text"
                        placeholder="Search admissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <span>📊</span>
                <span>Columns</span>
                <span>▼</span>
              </button>

              {showColumnsMenu && (
                <div 
                  ref={columnsMenuRef}
                  className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-800">Show/Hide Columns</h3>
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

        {/* Success and Error messages remain the same */}
        {operationSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>{operationSuccess}</span>
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
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="overflow-x-auto h-full">
              <table className="min-w-full divide-y divide-gray-200 border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {columns.map(column => 
                      column.visible && (
                        <th 
                          key={column.key} 
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50"
                        >
                          {column.label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmissions.length === 0 ? (
                    <tr>
                      <td 
                        colSpan={columns.filter(col => col.visible).length} 
                        className="px-6 py-12 text-center"
                      >
                        <div className="text-gray-500">
                          <span className="text-4xl mb-2 block">📝</span>
                          <p className="text-lg font-medium">
                            {admissions.length === 0 ? 'No admissions found' : 'No matching admissions'}
                          </p>
                          <p className="text-sm">
                            {admissions.length === 0 ? 'Get started by creating your first admission' : 'Try adjusting your filters or search'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAdmissions.map((admission, index) => (
                      <tr 
                        key={admission._id} 
                        className={`transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-50`}
                      >
                        {columns.map(column => {
                          if (!column.visible) return null;
                          
                          const baseCellClasses = "px-4 py-3 text-sm border-b border-gray-200";
                          const canEdit = canEditAdmission(admission);
                          const canDelete = canDeleteAdmission(admission);
                          
                          switch (column.key) {
                            case 'admissionNo':
                              return (
                                <td key={column.key} className={`${baseCellClasses} font-semibold text-gray-900 whitespace-nowrap`}>
                                  {admission.admissionNo}
                                </td>
                              );
                            case 'student':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {getStudentName(admission.student)}
                                </td>
                              );
                            case 'email':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {admission.student && typeof admission.student === 'object' ?
                                    (admission.student.email || 'N/A') : 'N/A'}
                                </td>
                              );
                            case 'alternateEmail':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {admission.student && typeof admission.student === 'object' ?
                                    (admission.student.alternateEmail || 'N/A') : 'N/A'}
                                </td>
                              );
                            case 'alternatePhone':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {admission.student && typeof admission.student === 'object' ?
                                    (admission.student.alternatePhone || 'N/A') : 'N/A'}
                                </td>
                              );
                            case 'dateOfBirth':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {admission.student && typeof admission.student === 'object' ?
                                    (admission.student.dateOfBirth ? formatDate(admission.student.dateOfBirth) : 'N/A') : 'N/A'}
                                </td>
                              );  
                            case 'gender':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap capitalize`}>
                                  {admission.student && typeof admission.student === 'object' ?
                                    (admission.student.gender || 'N/A') : 'N/A'}
                                </td>
                              );
                            case 'course':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                                  {getCourseName(admission.course)}
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
                                  {admission.counsellor}
                                </td>
                              );
                            case 'status':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  <div className="flex flex-col items-center">
                                    {getStatusBadge(admission.status)}
                                    {admission.status !== 'pending' && (
                                      <span className="text-xs text-gray-500 mt-1">
                                        {admission.status === 'approved' ? '✅ Approved by Admin' : 
                                         admission.status === 'rejected' ? '❌ Rejected by Admin - Can be edited' : 
                                         '⏳ In Waiting List'}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              );
                            case 'priority':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  {getPriorityBadge(admission.priority)}
                                </td>
                              );
                            case 'admissionDate':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                                  {formatDate(admission.admissionDate)}
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
                                  {admission.source?.replace('_', ' ') || '-'}
                                </td>
                              );
                            case 'emailVerified':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center`}>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    admission.emailVerified 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {admission.emailVerified ? 'Yes' : 'No'}
                                  </span>
                                </td>
                              );
                            case 'notes':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-gray-600`}>
                                  {truncateText(admission.notes, 40)}
                                </td>
                              );
                            case 'actions':
                              return (
                                <td key={column.key} className={`${baseCellClasses} text-center whitespace-nowrap`}>
                                  <div className="flex items-center justify-center space-x-2">
                                    {/* UPDATED: Edit button for pending AND rejected */}
                                    <button 
                                      onClick={() => handleEdit(admission)} 
                                      className={`px-2 py-1 rounded transition-colors border text-xs ${
                                        canEdit
                                          ? admission.status === 'pending' 
                                            ? 'text-blue-600 hover:text-blue-900 hover:bg-blue-50 border-blue-200' 
                                            : 'text-orange-600 hover:text-orange-900 hover:bg-orange-50 border-orange-200'
                                          : 'text-gray-400 border-gray-200 cursor-not-allowed'
                                      }`}
                                      title={getEditButtonTitle(admission)}
                                      disabled={!canEdit}
                                    >
                                      {admission.status === 'rejected' ? '🔄 Resubmit' : '✏️ Edit'}
                                    </button>
                                      <button 
                                      onClick={() => handleDelete(admission._id)} 
                                      className={`px-2 py-1 rounded transition-colors border text-xs ${
                                        canDelete
                                          ? admission.status === 'pending' 
                                            ? 'text-blue-600 hover:text-blue-900 hover:bg-blue-50 border-blue-200' 
                                            : 'text-orange-600 hover:text-orange-900 hover:bg-orange-50 border-orange-200'
                                          : 'text-gray-400 border-gray-200 cursor-not-allowed'
                                      }`} 
                                      title="Delete Admission"
                                      disabled={!canDelete}
                                    >
                                      🗑️ Delete
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

          {/* Table Footer */}
          {filteredAdmissions.length > 0 && (
            <div className="flex-shrink-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{filteredAdmissions.length}</span> of{' '}
                  <span className="font-semibold">{admissions.length}</span> admissions
                </div>
                <div className="text-sm text-gray-500">
                  Total: {admissions.length} admissions • Editable: {counsellorStats.editable}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admission Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingAdmission ? 
                    (editingAdmission.status === 'rejected' ? 'Resubmit Rejected Admission' : 'Edit Admission') 
                    : 'Create New Admission'
                  }
                </h2>
                <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <AdmissionForm 
                admission={editingAdmission} 
                onClose={handleCloseForm} 
                isCounsellor={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionsManagement;