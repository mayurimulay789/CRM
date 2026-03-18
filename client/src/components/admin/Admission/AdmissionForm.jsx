import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createAdmission,
  updateAdmission,
  clearError,
  clearSuccess
} from '../../../store/slices/admissionSlice';
import { fetchStudents } from '../../../store/slices/studentSlice';
import { fetchCourses } from '../../../store/slices/courseSlice';
import { getBatches } from '../../../store/slices/batchSlice';
import { getAllCounsellors } from '../../../store/slices/authSlice';

const AdmissionForm = ({ admission, onClose, isCounsellor = false }) => {
  const dispatch = useDispatch();
  const { operationLoading, error, operationSuccess } = useSelector((state) => state.admissions);
  const { students } = useSelector((state) => state.students);
  const { courses } = useSelector((state) => state.courses);
  const { batches } = useSelector((state) => state.batch);
  const { counsellors } = useSelector((state) => state.auth); // Assume { list: [] }

  const [formData, setFormData] = useState({
    student: '',
    course: '',
    trainingBranch: '',
    counsellor: '',
    termsCondition: false,
    appliedBatch: '',
    source: 'website',
    notes: '',
    status: 'pending',
    emailVerified: false,
    admissionDate: ''
  });

  const [files, setFiles] = useState({
    admissionFrontPage: null,
    admissionBackPage: null,
    studentStatement: null,
    confidentialForm: null
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Store initial values for reset
  const initialFormDataRef = useRef(null);

  // Fetch required data
  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchCourses());
    dispatch(getBatches());
    dispatch(getAllCounsellors());
  }, [dispatch]);

  // Populate form for editing or set default admissionDate for new
  useEffect(() => {
    if (admission) {
      const loadedData = {
        student: admission.student?._id || admission.student || '',
        course: admission.course?._id || admission.course || '',
        trainingBranch: admission.trainingBranch || '',
        counsellor: admission.counsellor || '', // expects counsellor ID
        termsCondition: admission.termsCondition || false,
        appliedBatch: admission.appliedBatch || '', // expects batch ID
        source: admission.source || 'website',
        notes: admission.notes || '',
        status: admission.status || 'pending',
        emailVerified: admission.emailVerified || false,
        admissionDate: admission.admissionDate || ''
      };
      setFormData(loadedData);
      initialFormDataRef.current = loadedData;
    } else {
      const today = new Date().toISOString().split('T')[0];
      const defaultData = {
        student: '',
        course: '',
        trainingBranch: '',
        counsellor: '',
        termsCondition: false,
        appliedBatch: '',
        source: 'website',
        notes: '',
        status: 'pending',
        emailVerified: false,
        admissionDate: today
      };
      setFormData(defaultData);
      initialFormDataRef.current = defaultData;
    }
  }, [admission]);

  // Auto-close after success
  useEffect(() => {
    if (operationSuccess && (operationSuccess.includes('created') || operationSuccess.includes('updated'))) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [operationSuccess, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // ------------------ Validation ------------------
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'student':
        if (!value) newErrors.student = 'Student is required';
        else delete newErrors.student;
        break;
      case 'course':
        if (!value) newErrors.course = 'Course is required';
        else delete newErrors.course;
        break;
      case 'trainingBranch':
        if (!value.trim()) newErrors.trainingBranch = 'Training branch is required';
        else delete newErrors.trainingBranch;
        break;
      case 'counsellor':
        if (!value.trim()) newErrors.counsellor = 'Counsellor is required';
        else delete newErrors.counsellor;
        break;
      case 'termsCondition':
        if (!value) newErrors.termsCondition = 'You must accept terms and conditions';
        else delete newErrors.termsCondition;
        break;
      case 'notes':
        if (value && value.length > 500) newErrors.notes = 'Notes must be less than 500 characters';
        else delete newErrors.notes;
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.student) newErrors.student = 'Student is required';
    if (!formData.course) newErrors.course = 'Course is required';
    if (!formData.trainingBranch.trim()) newErrors.trainingBranch = 'Training branch is required';
    if (!formData.counsellor.trim()) newErrors.counsellor = 'Counsellor is required';
    if (!formData.termsCondition) newErrors.termsCondition = 'You must accept terms and conditions';
    if (formData.notes && formData.notes.length > 500) newErrors.notes = 'Notes must be less than 500 characters';

    setErrors(newErrors);
    setTouched({
      student: true,
      course: true,
      trainingBranch: true,
      counsellor: true,
      termsCondition: true,
      notes: true
    });

    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      formData.student &&
      formData.course &&
      formData.trainingBranch.trim() &&
      formData.counsellor.trim() &&
      formData.termsCondition &&
      Object.keys(errors).length === 0
    );
  };

  // ------------------ Handlers ------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    if (touched[name]) validateField(name, fieldValue);
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles((prev) => ({ ...prev, [name]: fileList[0] }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitFormData = new FormData();
    submitFormData.append('student', formData.student);
    submitFormData.append('course', formData.course);
    submitFormData.append('trainingBranch', formData.trainingBranch.trim());
    submitFormData.append('counsellor', formData.counsellor.trim()); // counsellor ID
    submitFormData.append('termsCondition', formData.termsCondition);
    if (formData.appliedBatch) {
      submitFormData.append('appliedBatch', formData.appliedBatch); // batch ID
    }
    submitFormData.append('source', formData.source);
    submitFormData.append('notes', formData.notes.trim());
    submitFormData.append('admissionDate', formData.admissionDate);

    // Admin-only fields (not for counsellors)
    if (!isCounsellor) {
      submitFormData.append('status', formData.status);
      submitFormData.append('emailVerified', formData.emailVerified);
    }

    // Append files if any
    if (files.admissionFrontPage) submitFormData.append('admissionFrontPage', files.admissionFrontPage);
    if (files.admissionBackPage) submitFormData.append('admissionBackPage', files.admissionBackPage);
    if (files.studentStatement) submitFormData.append('studentStatement', files.studentStatement);
    if (files.confidentialForm) submitFormData.append('confidentialForm', files.confidentialForm);

    dispatch(clearError());
    try {
      if (admission) {
        await dispatch(updateAdmission({ admissionId: admission._id, admissionData: submitFormData }));
      } else {
        await dispatch(createAdmission(submitFormData));
      }
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  const handleReset = () => {
    if (initialFormDataRef.current) {
      setFormData(initialFormDataRef.current);
    }
    setFiles({
      admissionFrontPage: null,
      admissionBackPage: null,
      studentStatement: null,
      confidentialForm: null
    });
    setErrors({});
    setTouched({});
    dispatch(clearError());
  };

  const getFileName = (file) => (file ? file.name : 'No file chosen');
  const notesCount = formData.notes.length;

  const branches = ['Main Campus', 'Downtown Branch', 'Westside Center', 'Online'];
  const activeCourses = courses.filter((course) => course.isActive);

  const getFormTitle = () => {
    if (admission) {
      if (isCounsellor && admission.status === 'rejected') return 'Resubmit Rejected Admission';
      return 'Edit Admission';
    }
    return 'Create New Admission';
  };

  const isDisabled = operationLoading;

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{getFormTitle()}</h2>
          <button
            onClick={onClose}
            disabled={isDisabled}
            className={`text-gray-400 hover:text-gray-600 text-2xl ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ×
          </button>
        </div>

        {/* Success / Error messages (unchanged) */}
        {operationSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>{operationSuccess}</span>
            </div>
            <button onClick={onClose} className="text-green-700 hover:text-green-900">×</button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
            <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
          {/* Student and Course */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student */}
            <div>
              <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-2">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                id="student"
                name="student"
                value={formData.student}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.student ? 'border-red-300' : 'border-gray-300'}`}
                disabled={isDisabled}
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.studentId})
                  </option>
                ))}
              </select>
              {errors.student && touched.student && (
                <p className="mt-1 text-sm text-red-600">{errors.student}</p>
              )}
            </div>

            {/* Course */}
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.course ? 'border-red-300' : 'border-gray-300'}`}
                disabled={isDisabled}
              >
                <option value="">Select a course</option>
                {activeCourses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} - ₹{course.fee?.toLocaleString()}
                  </option>
                ))}
              </select>
              {errors.course && touched.course && (
                <p className="mt-1 text-sm text-red-600">{errors.course}</p>
              )}
            </div>
          </div>

          {/* Training Branch and Counsellor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Training Branch */}
            <div>
              <label htmlFor="trainingBranch" className="block text-sm font-medium text-gray-700 mb-2">
                Training Branch <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                id="trainingBranch"
                name="trainingBranch"
                value={formData.trainingBranch}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.trainingBranch ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Enter training branch location"
                disabled={isDisabled}
              />

              {errors.trainingBranch && touched.trainingBranch && (
                <p className="mt-1 text-sm text-red-600">{errors.trainingBranch}</p>
              )}
            </div>

            {/* Counsellor */}
            <div>
              <label htmlFor="counsellor" className="block text-sm font-medium text-gray-700 mb-2">
                Counsellor <span className="text-red-500">*</span>
              </label>
              <select
                id="counsellor"
                name="counsellor"
                value={formData.counsellor}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.counsellor ? 'border-red-300' : 'border-gray-300'}`}
                disabled={isDisabled}
              >
                <option value="">Select counsellor</option>
                {counsellors?.list?.map((counsellor) => (
                  <option key={counsellor._id} value={counsellor._id}>
                    {counsellor.FullName}
                  </option>
                ))}
              </select>
              {errors.counsellor && touched.counsellor && (
                <p className="mt-1 text-sm text-red-600">{errors.counsellor}</p>
              )}
            </div>
          </div>

          {/* Source and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isDisabled}
              >
                <option value="website">Website</option>
                <option value="walkin">Walk-in</option>
                <option value="referral">Referral</option>
                <option value="counsellor">Counsellor</option>
                <option value="social_media">Social Media</option>
              </select>
            </div>

            {/* Status - disabled for counsellors */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isDisabled || isCounsellor} // Counsellors cannot edit status
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="waiting_list">Waiting List</option>
              </select>
            </div>
          </div>

          {/* Applied Batch and Admission Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Applied Batch - use batch._id as value */}
            <div>
              <label htmlFor="appliedBatch" className="block text-sm font-medium text-gray-700 mb-2">
                Applied Batch
              </label>
              <select
                id="appliedBatch"
                name="appliedBatch"
                value={formData.appliedBatch}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isDisabled}
              >
                <option value="">Select batch</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Admission Date */}
            <div>
              <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700 mb-2">
                Admission Date
              </label>
              <input
                type="date"
                id="admissionDate"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isDisabled}
              />
            </div>
          </div>

          {/* Admin-only fields */}
          {!isCounsellor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailVerified"
                  name="emailVerified"
                  checked={formData.emailVerified}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isDisabled}
                />
                <label htmlFor="emailVerified" className="ml-2 block text-sm text-gray-700">
                  Email Verified
                </label>
              </div>
            </div>
          )}

          {/* Document Uploads (unchanged) */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Upload Documents (Images or PDFs)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'admissionFrontPage', label: 'Admission Front Page' },
                { name: 'admissionBackPage', label: 'Admission Back Page' },
                { name: 'studentStatement', label: 'Student Statement' },
                { name: 'confidentialForm', label: 'Confidential Form' }
              ].map(({ name, label }) => (
                <div key={name}>
                  <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <input
                    type="file"
                    id={name}
                    name={name}
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isDisabled}
                  />
                  <p className="mt-1 text-sm text-gray-500">{getFileName(files[name])}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Supported formats: JPG, PNG, GIF, PDF (Max 10MB per file)
            </p>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
              <span className="text-gray-400 text-xs ml-2">{notesCount}/500 characters</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={500}
              value={formData.notes}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.notes ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Additional notes or comments..."
              disabled={isDisabled}
            />
            {errors.notes && touched.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="termsCondition"
              name="termsCondition"
              checked={formData.termsCondition}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${errors.termsCondition ? 'border-red-300' : ''}`}
              disabled={isDisabled}
            />
            <div className="flex-1">
              <label htmlFor="termsCondition" className="block text-sm font-medium text-gray-700">
                Terms and Conditions <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                I confirm that all information provided is accurate and I accept the terms and conditions of admission.
              </p>
              {errors.termsCondition && touched.termsCondition && (
                <p className="mt-1 text-sm text-red-600">{errors.termsCondition}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              disabled={isDisabled}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isDisabled}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDisabled || !isFormValid()}
              className="px-6 py-2 bg-[#890c25] text-white rounded-lg hover:bg-[#890c25] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
    </div>
  );
};

export default AdmissionForm;