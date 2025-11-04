import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAdmission, updateAdmission, clearError, clearSuccess } from '../../../store/slices/admissionSlice';

const AdmissionForm = ({ admission, onClose }) => {
  const dispatch = useDispatch();
  const { operationLoading, operationSuccess, error } = useSelector(state => state.admissions);
  
  const [formData, setFormData] = useState({
    // Basic Information
    admissionNo: '',
    admissionDate: '',
    name: '',
    
    // Contact Information
    email: '',
    alternateEmail: '',
    phoneNo: '',
    alternateNumber: '',
    primaryEmail: '',
    primaryNumber: '',
    
    // Course Information
    course: '',
    courseFee: '',
    trainingBranch: '',
    counsellor: '',
    
    // Document URLs
    idProofPhoto: '',
    studentPhoto: '',
    studentSignature: '',
    admissionFrontPage: '',
    admissionBackPage: '',
    paymentReceipt: '',
    studentStatement: '',
    confidentialForm: '',
    
    // Status & Terms
    termsCondition: false,
    emailVerified: false,
    status: 'pending',
    operation: ''
  });

  const [fileUploads, setFileUploads] = useState({
    idProofPhoto: null,
    studentPhoto: null,
    studentSignature: null,
    admissionFrontPage: null,
    admissionBackPage: null,
    paymentReceipt: null,
    studentStatement: null,
    confidentialForm: null
  });

  useEffect(() => {
    if (admission) {
      // Pre-fill form for edit mode
      setFormData({
        admissionNo: admission.admissionNo || '',
        admissionDate: admission.admissionDate ? new Date(admission.admissionDate).toISOString().split('T')[0] : '',
        name: admission.name || '',
        
        email: admission.email || '',
        alternateEmail: admission.alternateEmail || '',
        phoneNo: admission.phoneNo || '',
        alternateNumber: admission.alternateNumber || '',
        primaryEmail: admission.primaryEmail || '',
        primaryNumber: admission.primaryNumber || '',
        
        course: admission.course || '',
        courseFee: admission.courseFee || '',
        trainingBranch: admission.trainingBranch || '',
        counsellor: admission.counsellor || '',
        
        idProofPhoto: admission.idProofPhoto || '',
        studentPhoto: admission.studentPhoto || '',
        studentSignature: admission.studentSignature || '',
        admissionFrontPage: admission.admissionFrontPage || '',
        admissionBackPage: admission.admissionBackPage || '',
        paymentReceipt: admission.paymentReceipt || '',
        studentStatement: admission.studentStatement || '',
        confidentialForm: admission.confidentialForm || '',
        
        termsCondition: admission.termsCondition || false,
        emailVerified: admission.emailVerified || false,
        status: admission.status || 'pending',
        operation: admission.operation || ''
      });
    } else {
      // Generate admission number for new admission
      const newAdmissionNo = `ADM${Date.now()}`;
      setFormData(prev => ({ ...prev, admissionNo: newAdmissionNo }));
    }
  }, [admission]);

  useEffect(() => {
    if (operationSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [operationSuccess, onClose]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFileUploads(prev => ({
        ...prev,
        [fieldName]: file
      }));
      
      // For demo purposes, create a temporary URL
      // In real application, you would upload to cloud storage and get URL
      const tempUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        [fieldName]: tempUrl
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        courseFee: Number(formData.courseFee),
        admissionDate: new Date(formData.admissionDate).toISOString()
      };

      if (admission) {
        // Update existing admission
        await dispatch(updateAdmission({ admissionNo: admission.admissionNo, admissionData: submitData }));
      } else {
        // Create new admission
        await dispatch(createAdmission(submitData));
      }
    } catch (error) {
      console.error('Error submitting admission:', error);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'enrolled', label: 'Enrolled' }
  ];

  const courseOptions = [
    'Full Stack Development',
    'Data Science',
    'Cyber Security',
    'Cloud Computing',
    'Digital Marketing',
    'UI/UX Design'
  ];

  const branchOptions = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Pune',
    'Kolkata'
  ];

  const renderFileInput = (fieldName, label, accept = "image/*,.pdf,.doc,.docx") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => handleFileChange(e, fieldName)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {formData[fieldName] && (
        <div className="mt-1">
          <span className="text-xs text-green-600">✓ File selected</span>
          {formData[fieldName].startsWith('blob:') && (
            <a 
              href={formData[fieldName]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-xs text-blue-600 hover:underline"
            >
              Preview
            </a>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {operationSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>{operationSuccess}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
            <button 
              type="button"
              onClick={() => dispatch(clearError())} 
              className="mt-2 text-red-700 hover:text-red-900 text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Information Section */}
          <div className="col-span-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number *</label>
            <input
              type="text"
              name="admissionNo"
              value={formData.admissionNo}
              onChange={handleInputChange}
              required
              disabled={!!admission} // Disable editing admission number for existing records
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date *</label>
            <input
              type="date"
              name="admissionDate"
              value={formData.admissionDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Contact Information Section */}
          <div className="col-span-full mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Contact Information</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Email</label>
            <input
              type="email"
              name="alternateEmail"
              value={formData.alternateEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
            <input
              type="tel"
              name="alternateNumber"
              value={formData.alternateNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Email</label>
            <input
              type="email"
              name="primaryEmail"
              value={formData.primaryEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone</label>
            <input
              type="tel"
              name="primaryNumber"
              value={formData.primaryNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Course Information Section */}
          <div className="col-span-full mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Course Information</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Course</option>
              {courseOptions.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Fee (₹) *</label>
            <input
              type="number"
              name="courseFee"
              value={formData.courseFee}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Training Branch *</label>
            <select
              name="trainingBranch"
              value={formData.trainingBranch}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Branch</option>
              {branchOptions.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Counsellor *</label>
            <input
              type="text"
              name="counsellor"
              value={formData.counsellor}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Document Uploads Section */}
          <div className="col-span-full mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Document Uploads</h3>
          </div>

          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderFileInput('idProofPhoto', 'ID Proof Photo')}
            {renderFileInput('studentPhoto', 'Student Photo')}
            {renderFileInput('studentSignature', 'Student Signature')}
            {renderFileInput('admissionFrontPage', 'Admission Front Page')}
            {renderFileInput('admissionBackPage', 'Admission Back Page')}
            {renderFileInput('paymentReceipt', 'Payment Receipt')}
            {renderFileInput('studentStatement', 'Student Statement')}
            {renderFileInput('confidentialForm', 'Confidential Form')}
          </div>

          {/* Status & Terms Section */}
          <div className="col-span-full mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Status & Terms</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
            <input
              type="text"
              name="operation"
              value={formData.operation}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="col-span-full">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="termsCondition"
                checked={formData.termsCondition}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Terms & Conditions Accepted
              </label>
            </div>
          </div>

          {admission && (
            <div className="col-span-full">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="emailVerified"
                  checked={formData.emailVerified}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Email Verified
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={operationLoading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={operationLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 flex items-center space-x-2"
          >
            {operationLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{admission ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{admission ? 'Update Admission' : 'Create Admission'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdmissionForm;