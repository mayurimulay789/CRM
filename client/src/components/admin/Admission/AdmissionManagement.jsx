import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAdmissions, 
  deleteAdmission, 
  verifyEmail,
  clearError,
  clearSuccess 
} from '../../../store/slices/admissionSlice';
import AdmissionForm from '../../counsellor/Admission/AdmissionForm';

const AdmissionManagement = () => {
  const dispatch = useDispatch();
  const { admissions, loading, error, operationLoading, operationSuccess } = useSelector(state => state.admissions);
  
  const [showForm, setShowForm] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleDelete = async (admissionNo) => {
    if (window.confirm('Are you sure you want to delete this admission?')) {
      await dispatch(deleteAdmission(admissionNo));
      dispatch(getAdmissions()); // Refresh the list
    }
  };

  const handleVerifyEmail = async (admissionNo) => {
    await dispatch(verifyEmail(admissionNo));
    dispatch(getAdmissions()); // Refresh the list
  };

  const handleEdit = (admission) => {
    setEditingAdmission(admission);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAdmission(null);
    dispatch(getAdmissions()); // Refresh the list
  };

  // Filter admissions based on status and search term
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

  const renderFileLink = (fileUrl) => {
    if (!fileUrl) return '-';
    return (
      <a 
        href={fileUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline text-xs"
      >
        View
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
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admission Management</h1>
          <p className="text-gray-600">Manage student admissions and applications</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add New Admission</span>
        </button>
      </div>

      {/* Success Message */}
      {operationSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>❌</span>
            <span>{error}</span>
          </div>
          <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900">
            ×
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, admission no, course, phone, branch, or counsellor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="enrolled">Enrolled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admissions Table with Horizontal Scroll Only */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto"> {/* This enables horizontal scroll only for the table */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Basic Information */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Admission No
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Admission Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Name
                </th>

                {/* Contact Information */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Email
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Alt Email
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Phone
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Alt Phone
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Primary Email
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Primary Phone
                </th>

                {/* Course Information */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Course
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Course Fee
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Training Branch
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Counsellor
                </th>

                {/* Document Links */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  ID Proof
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Student Photo
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Signature
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Front Page
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Back Page
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Payment Receipt
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Student Statement
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Confidential Form
                </th>

                {/* Status & Verification */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Terms Accepted
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Email Verified
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Operation
                </th>

                {/* Timestamps */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Created At
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Updated At
                </th>

                {/* Actions */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan="28" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <span className="text-4xl mb-2 block">📝</span>
                      <p className="text-lg font-medium">No admissions found</p>
                      <p className="text-sm">Get started by creating your first admission</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((admission) => (
                  <tr key={admission.admissionNo} className="hover:bg-gray-50 transition-colors duration-150">
                    {/* Basic Information */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {admission.admissionNo}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(admission.admissionDate)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {admission.name}
                    </td>

                    {/* Contact Information */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {admission.email}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {admission.alternateEmail || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {admission.phoneNo}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {admission.alternateNumber || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {admission.primaryEmail || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {admission.primaryNumber || '-'}
                    </td>

                    {/* Course Information */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {admission.course}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-blue-600 font-semibold">
                      {formatCurrency(admission.courseFee)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {admission.trainingBranch}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {admission.counsellor}
                    </td>

                    {/* Document Links */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                      {renderFileLink(admission.idProofPhoto)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                      {renderFileLink(admission.studentPhoto)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                      {renderFileLink(admission.studentSignature)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                      {renderFileLink(admission.admissionFrontPage)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                      {renderFileLink(admission.admissionBackPage)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                      {renderFileLink(admission.paymentReceipt)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                      {renderFileLink(admission.studentStatement)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                      {renderFileLink(admission.confidentialForm)}
                    </td>

                    {/* Status & Verification */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                      {renderBoolean(admission.termsCondition)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {getEmailVerificationBadge(admission.emailVerified)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {getStatusBadge(admission.status)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {admission.operation || '-'}
                    </td>

                    {/* Timestamps */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(admission.createdAt)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(admission.updatedAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEdit(admission)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit Admission"
                        >
                          ✏️
                        </button>
                        
                        {!admission.emailVerified && (
                          <button
                            onClick={() => handleVerifyEmail(admission.admissionNo)}
                            disabled={operationLoading}
                            className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
                            title="Verify Email"
                          >
                            ✅
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(admission.admissionNo)}
                          disabled={operationLoading}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete Admission"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredAdmissions.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
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

      {/* Admission Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingAdmission ? 'Edit Admission' : 'Create New Admission'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <AdmissionForm 
                admission={editingAdmission}
                onClose={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionManagement;