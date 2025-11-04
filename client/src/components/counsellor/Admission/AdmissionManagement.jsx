import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAdmissions, 
  deleteAdmission, 
  verifyEmail,
  clearError,
  clearSuccess 
} from '../../../store/slices/admissionSlice';
import AdmissionForm from './AdmissionForm';

const AdmissionManagement = () => {
  const dispatch = useDispatch();
  const { admissions, loading, error, operationLoading, operationSuccess } = useSelector(state => state.admissions);
  
  const [showForm, setShowForm] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);

  // Define all available columns
  const allColumns = [
    { key: 'admissionNo', label: 'Admission No', visible: true },
    { key: 'admissionDate', label: 'Admission Date', visible: true },
    { key: 'name', label: 'Name', visible: true },
    { key: 'email', label: 'Email', visible: true },
    { key: 'alternateEmail', label: 'Alt Email', visible: true },
    { key: 'phoneNo', label: 'Phone', visible: true },
    { key: 'alternateNumber', label: 'Alt Phone', visible: true },
    { key: 'primaryEmail', label: 'Primary Email', visible: true },
    { key: 'primaryNumber', label: 'Primary Phone', visible: true },
    { key: 'course', label: 'Course', visible: true },
    { key: 'courseFee', label: 'Course Fee', visible: true },
    { key: 'trainingBranch', label: 'Training Branch', visible: true },
    { key: 'counsellor', label: 'Counsellor', visible: true },
    { key: 'idProofPhoto', label: 'ID Proof', visible: true },
    { key: 'studentPhoto', label: 'Student Photo', visible: true },
    { key: 'studentSignature', label: 'Signature', visible: true },
    { key: 'admissionFrontPage', label: 'Front Page', visible: true },
    { key: 'admissionBackPage', label: 'Back Page', visible: true },
    { key: 'paymentReceipt', label: 'Payment Receipt', visible: true },
    { key: 'studentStatement', label: 'Student Statement', visible: true },
    { key: 'confidentialForm', label: 'Confidential Form', visible: true },
    { key: 'termsCondition', label: 'Terms Accepted', visible: true },
    { key: 'emailVerified', label: 'Email Verified', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'operation', label: 'Operation', visible: true },
    { key: 'createdAt', label: 'Created At', visible: true },
    { key: 'updatedAt', label: 'Updated At', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  const [columns, setColumns] = useState(allColumns);

  useEffect(() => {
    dispatch(getAdmissions());
  }, [dispatch]);

  useEffect(() => {
    if (operationSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [operationSuccess, dispatch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterMenu || showColumnsMenu) {
        setShowFilterMenu(false);
        setShowColumnsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu, showColumnsMenu]);

  const handleDelete = async (admissionNo) => {
    if (window.confirm('Are you sure you want to delete this admission?')) {
      await dispatch(deleteAdmission(admissionNo));
      dispatch(getAdmissions());
    }
  };

  const handleVerifyEmail = async (admissionNo) => {
    await dispatch(verifyEmail(admissionNo));
    dispatch(getAdmissions());
  };

  const handleEdit = (admission) => {
    setEditingAdmission(admission);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAdmission(null);
    dispatch(getAdmissions());
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
      admission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.phoneNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.trainingBranch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.counsellor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      enrolled: { color: 'bg-blue-100 text-blue-800', label: 'Enrolled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getEmailVerificationBadge = (verified) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
      verified 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      {verified ? 'Verified' : 'Pending'}
    </span>
  );

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `₹${amount.toLocaleString()}`;
  };

  const renderFileLink = (fileUrl, fileName) => {
    if (!fileUrl) {
      return (
        <span className="text-red-500 text-lg" title={`${fileName} not available`}>
          ❌
        </span>
      );
    }
    return (
      <a 
        href={fileUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-green-600 hover:text-green-800 text-lg transition-colors"
        title={`View ${fileName}`}
      >
        ✅
      </a>
    );
  };

  const renderBoolean = (value) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
      value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {value ? 'Yes' : 'No'}
    </span>
  );

  if (loading) {
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
          <div >
            <h1 className="text-2xl font-bold text-gray-800">Admission Management</h1>
            <p  className="text-gray-600">Manage student admissions and applications</p>
            </div>
             {/* Add New Admission Button */}
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>+</span>
              <span>New Admission</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3  p-3 rounded-lg ">
            {/* Filter Button */}
            <div className="relative">
              <button
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

              {/* Filter Dropdown Menu */}
              {showFilterMenu && (
                <div className="absolute right-0 left-10 mt-5 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Filter by Status</h3>
                    <div className="space-y-2">
                      {['all', 'pending', 'approved', 'rejected', 'enrolled'].map(status => (
                        <label key={status} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={filterStatus === status}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-blue-500 focus:ring-blue-500"
                          />
                          <span className="capitalize">{status === 'all' ? 'All Status' : status}</span>
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

              {/* Columns Dropdown Menu */}
              {showColumnsMenu && (
                <div className="absolute right-0 left-1 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
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

        {/* Success Message */}
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

        {/* Error Message */}
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
                    <p className="text-lg font-medium">No admissions found</p>
                    <p className="text-sm">Get started by creating your first admission</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAdmissions.map((admission, index) => (
                <tr 
                  key={admission.admissionNo} 
                  className={`transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50`}
                >
                  {columns.map(column => {
                    if (!column.visible) return null;
                    
                    // Common cell styling
                    const baseCellClasses = "px-4 py-3 text-sm border-b border-gray-200";
                    
                    switch (column.key) {
                      case 'admissionNo':
                        return (
                          <td key={column.key} className={`${baseCellClasses} font-semibold text-gray-900 whitespace-nowrap`}>
                            {admission.admissionNo}
                          </td>
                        );
                      case 'admissionDate':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                            {formatDate(admission.admissionDate)}
                          </td>
                        );
                      case 'name':
                        return (
                          <td key={column.key} className={`${baseCellClasses} font-medium text-gray-900 whitespace-nowrap`}>
                            {admission.name}
                          </td>
                        );
                      case 'email':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                            {admission.email}
                          </td>
                        );
                      case 'alternateEmail':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
                            {admission.alternateEmail || '-'}
                          </td>
                        );
                      case 'phoneNo':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-gray-700 whitespace-nowrap`}>
                            {admission.phoneNo}
                          </td>
                        );
                      case 'alternateNumber':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
                            {admission.alternateNumber || '-'}
                          </td>
                        );
                      case 'primaryEmail':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
                            {admission.primaryEmail || '-'}
                          </td>
                        );
                      case 'primaryNumber':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
                            {admission.primaryNumber || '-'}
                          </td>
                        );
                      case 'course':
                        return (
                          <td key={column.key} className={`${baseCellClasses} font-medium text-gray-900 whitespace-nowrap`}>
                            {admission.course}
                          </td>
                        );
                      case 'courseFee':
                        return (
                          <td key={column.key} className={`${baseCellClasses} font-semibold text-green-600 whitespace-nowrap`}>
                            {formatCurrency(admission.courseFee)}
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
                      case 'idProofPhoto':
                      case 'studentPhoto':
                      case 'studentSignature':
                      case 'admissionFrontPage':
                      case 'admissionBackPage':
                      case 'paymentReceipt':
                      case 'studentStatement':
                      case 'confidentialForm':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-center`}>
                            {renderFileLink(admission[column.key], column.label)}
                          </td>
                        );
                      case 'termsCondition':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-center`}>
                            {renderBoolean(admission.termsCondition)}
                          </td>
                        );
                      case 'emailVerified':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-center`}>
                            {getEmailVerificationBadge(admission.emailVerified)}
                          </td>
                        );
                      case 'status':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-center`}>
                            {getStatusBadge(admission.status)}
                          </td>
                        );
                      case 'operation':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-gray-600 whitespace-nowrap`}>
                            {admission.operation || '-'}
                          </td>
                        );
                      case 'createdAt':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                            {formatDate(admission.createdAt)}
                          </td>
                        );
                      case 'updatedAt':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-gray-500 whitespace-nowrap`}>
                            {formatDate(admission.updatedAt)}
                          </td>
                        );
                      case 'actions':
                        return (
                          <td key={column.key} className={`${baseCellClasses} text-center whitespace-nowrap`}>
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={() => handleEdit(admission)} 
                                className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 transition-colors border border-blue-200" 
                                title="Edit Admission"
                              >
                                Edit
                              </button>
                              {!admission.emailVerified && (
                                <button 
                                  onClick={() => handleVerifyEmail(admission.admissionNo)} 
                                  disabled={operationLoading} 
                                  className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50 transition-colors disabled:opacity-50 border border-green-200" 
                                  title="Verify Email"
                                >
                                  Verify
                                </button>
                              )}
                              <button 
                                onClick={() => handleDelete(admission.admissionNo)} 
                                disabled={operationLoading} 
                                className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50 border border-red-200" 
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

    {/* Table Footer */}
    {filteredAdmissions.length > 0 && (
      <div className="flex-shrink-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing <span className="font-semibold">{filteredAdmissions.length}</span> of{' '}
            <span className="font-semibold">{admissions.length}</span> admissions
          </div>
          <div className="text-sm text-gray-500">
            Total: {admissions.length} admissions
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
                  {editingAdmission ? 'Edit Admission' : 'Create New Admission'}
                </h2>
                <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <AdmissionForm admission={editingAdmission} onClose={handleCloseForm} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionManagement;