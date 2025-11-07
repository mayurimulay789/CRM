import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createAdmission, 
  updateAdmission, 
  clearError,
  clearSuccess 
} from '../../../store/slices/admissionSlice';

const AdmissionForm = ({ admission, onClose, isCounsellor = false }) => {
  const dispatch = useDispatch();
  const { loading, error, operationSuccess } = useSelector(state => state.admissions);
  
  const [formData, setFormData] = useState({
    // Student Information
    student: {
      name: '',
      email: '',
      phone: '',
      alternateEmail: '',
      alternatePhone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    
    // Course Information
    course: '',
    trainingBranch: '',
    appliedBatch: '',
    admissionDate: new Date().toISOString().split('T')[0],
    
    // Admission Details
    counsellor: '',
    priority: 'medium',
    source: 'website',
    notes: '',
    
    // Documents (for display only - would be file uploads in real implementation)
    idProof: '',
    studentPhoto: '',
    signature: '',
    
    // Status (Admin only)
    status: 'pending',
    emailVerified: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Courses and branches data (would typically come from API)
  const courses = [
    'Full Stack Development',
    'Data Science',
    'Cyber Security',
    'Cloud Computing',
    'AI & Machine Learning',
    'Digital Marketing'
  ];

  const branches = [
    'Main Campus',
    'Downtown Branch',
    'Westside Center',
    'Online'
  ];

  const batches = [
    'Morning Batch (9 AM - 12 PM)',
    'Afternoon Batch (1 PM - 4 PM)',
    'Evening Batch (6 PM - 9 PM)',
    'Weekend Batch'
  ];

  const counsellors = [
    'John Smith',
    'Sarah Johnson',
    'Mike Davis',
    'Emily Wilson',
    'Robert Brown'
  ];

  useEffect(() => {
    if (admission) {
      // Populate form with existing admission data
      setFormData(prev => ({
        ...prev,
        ...admission,
        student: {
          ...prev.student,
          ...(admission.student || {})
        },
        course: admission.course?._id || admission.course || '',
        admissionDate: admission.admissionDate ? new Date(admission.admissionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));
    }
  }, [admission]);

  useEffect(() => {
    if (operationSuccess) {
      setIsSubmitting(false);
      onClose();
    }
  }, [operationSuccess, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('student.')) {
      const studentField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        student: {
          ...prev.student,
          [studentField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Student validation
    if (!formData.student.name?.trim()) {
      newErrors['student.name'] = 'Student name is required';
    }
    if (!formData.student.email?.trim()) {
      newErrors['student.email'] = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.student.email)) {
      newErrors['student.email'] = 'Email is invalid';
    }
    if (!formData.student.phone?.trim()) {
      newErrors['student.phone'] = 'Phone number is required';
    }

    // Course validation
    if (!formData.course) {
      newErrors.course = 'Course selection is required';
    }
    if (!formData.trainingBranch) {
      newErrors.trainingBranch = 'Training branch is required';
    }
    if (!formData.counsellor) {
      newErrors.counsellor = 'Counsellor assignment is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (admission) {
        // Update existing admission
        await dispatch(updateAdmission({
          admissionId: admission._id,
          admissionData: formData
        }));
      } else {
        // Create new admission
        await dispatch(createAdmission(formData));
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setIsSubmitting(false);
    }
  };

  const getFormTitle = () => {
    if (admission) {
      if (isCounsellor && admission.status === 'rejected') {
        return 'Resubmit Rejected Admission';
      }
      return 'Edit Admission';
    }
    return 'Create New Admission';
  };

  const canEditStatus = !isCounsellor && admission;

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="student.name"
                value={formData.student.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['student.name'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter student's full name"
              />
              {errors['student.name'] && (
                <p className="text-red-500 text-xs mt-1">{errors['student.name']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="student.email"
                value={formData.student.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['student.email'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="student@example.com"
              />
              {errors['student.email'] && (
                <p className="text-red-500 text-xs mt-1">{errors['student.email']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="student.phone"
                value={formData.student.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['student.phone'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+91 9876543210"
              />
              {errors['student.phone'] && (
                <p className="text-red-500 text-xs mt-1">{errors['student.phone']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternate Email
              </label>
              <input
                type="email"
                name="student.alternateEmail"
                value={formData.student.alternateEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="alternate@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternate Phone
              </label>
              <input
                type="tel"
                name="student.alternatePhone"
                value={formData.student.alternatePhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="student.dateOfBirth"
                value={formData.student.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="student.gender"
                value={formData.student.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="student.address"
              value={formData.student.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter complete address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="student.city"
                value={formData.student.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="student.state"
                value={formData.student.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code
              </label>
              <input
                type="text"
                name="student.pincode"
                value={formData.student.pincode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="PIN Code"
              />
            </div>
          </div>
        </div>

        {/* Course Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course *
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.course ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              {errors.course && (
                <p className="text-red-500 text-xs mt-1">{errors.course}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Training Branch *
              </label>
              <select
                name="trainingBranch"
                value={formData.trainingBranch}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.trainingBranch ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
              {errors.trainingBranch && (
                <p className="text-red-500 text-xs mt-1">{errors.trainingBranch}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Applied Batch
              </label>
              <select
                name="appliedBatch"
                value={formData.appliedBatch}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Batch</option>
                {batches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admission Date
              </label>
              <input
                type="date"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Admission Details Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Admission Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Counsellor *
              </label>
              <select
                name="counsellor"
                value={formData.counsellor}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.counsellor ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Counsellor</option>
                {counsellors.map(counsellor => (
                  <option key={counsellor} value={counsellor}>{counsellor}</option>
                ))}
              </select>
              {errors.counsellor && (
                <p className="text-red-500 text-xs mt-1">{errors.counsellor}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="walkin">Walk-in</option>
                <option value="social_media">Social Media</option>
                <option value="advertisement">Advertisement</option>
              </select>
            </div>

            {/* Admin-only fields */}
            {canEditStatus && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="waiting_list">Waiting List</option>
                </select>
              </div>
            )}

            {canEditStatus && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="emailVerified"
                  checked={formData.emailVerified}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Email Verified
                </label>
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes & Comments
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional notes or comments about this admission..."
            />
          </div>
        </div>

        {/* Documents Section (Read-only for display) */}
        {admission && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">ID Proof:</span>
                <span className="ml-2 text-gray-600">
                  {admission.idProofPhoto ? '✅ Uploaded' : '❌ Not uploaded'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Student Photo:</span>
                <span className="ml-2 text-gray-600">
                  {admission.studentPhoto ? '✅ Uploaded' : '❌ Not uploaded'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Signature:</span>
                <span className="ml-2 text-gray-600">
                  {admission.studentSignature ? '✅ Uploaded' : '❌ Not uploaded'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Payment Receipt:</span>
                <span className="ml-2 text-gray-600">
                  {admission.paymentReceipt ? '✅ Uploaded' : '❌ Not uploaded'}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Document management available in document upload section
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
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