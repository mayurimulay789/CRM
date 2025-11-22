import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAdmission, updateAdmission, clearError, clearSuccess } from '../../../store/slices/admissionSlice';
import { fetchStudents } from '../../../store/slices/studentSlice';
import { fetchCourses } from '../../../store/slices/courseSlice';

const AdmissionForm = ({ admission, onClose }) => {
  const dispatch = useDispatch();
  const { operationLoading, error, success } = useSelector(state => state.admissions);
  const { students } = useSelector(state => state.students);
  const { courses } = useSelector(state => state.courses);
  
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    trainingBranch: '',
    termsCondition: false,
    priority: 'medium',
    appliedBatch: '',
    source: 'website',
    notes: ''
  });

  // File states
  const [files, setFiles] = useState({
    admissionFrontPage: null,
    admissionBackPage: null,
    studentStatement: null,
    confidentialForm: null
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    // Fetch students and courses for dropdowns
    dispatch(fetchStudents());
    dispatch(fetchCourses());
  }, [dispatch]);

  useEffect(() => {
    if (admission) {
      setFormData({
        student: admission.student?._id || admission.student || '',
        course: admission.course?._id || admission.course || '',
        trainingBranch: admission.trainingBranch || '',
        termsCondition: admission.termsCondition || false,
        priority: admission.priority || 'medium',
        appliedBatch: admission.appliedBatch || '',
        source: admission.source || 'website',
        notes: admission.notes || ''
      });
    }
  }, [admission]);

  // Handle successful operation and close form
  useEffect(() => {
    if (success && (success.includes('created') || success.includes('updated'))) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'student':
        if (!value) {
          newErrors.student = 'Student is required';
        } else {
          delete newErrors.student;
        }
        break;
      
      case 'course':
        if (!value) {
          newErrors.course = 'Course is required';
        } else {
          delete newErrors.course;
        }
        break;
      
      case 'trainingBranch':
        if (!value.trim()) {
          newErrors.trainingBranch = 'Training branch is required';
        } else {
          delete newErrors.trainingBranch;
        }
        break;
      
      case 'termsCondition':
        if (!value) {
          newErrors.termsCondition = 'Terms and conditions must be accepted';
        } else {
          delete newErrors.termsCondition;
        }
        break;
      
      case 'studentStatement':
        if (value && value.length > 1000) {
          newErrors.studentStatement = 'Student statement must be less than 1000 characters';
        } else {
          delete newErrors.studentStatement;
        }
        break;
      
      case 'notes':
        if (value && value.length > 500) {
          newErrors.notes = 'Notes must be less than 500 characters';
        } else {
          delete newErrors.notes;
        }
        break;
      
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.student) {
      newErrors.student = 'Student is required';
    }

    if (!formData.course) {
      newErrors.course = 'Course is required';
    }

    if (!formData.trainingBranch.trim()) {
      newErrors.trainingBranch = 'Training branch is required';
    }


    if (!formData.termsCondition) {
      newErrors.termsCondition = 'Terms and conditions must be accepted';
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes must be less than 500 characters';
    }

    setErrors(newErrors);
    setTouched({
      student: true,
      course: true,
      trainingBranch: true,
      termsCondition: true,
      notes: true
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Validate field in real-time if it's been touched
    if (touched[name]) {
      validateField(name, fieldValue);
    }
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: fileList[0]
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Create FormData for file upload
    const submitFormData = new FormData();

    // Append all form fields
    submitFormData.append('student', formData.student);
    submitFormData.append('course', formData.course);
    submitFormData.append('trainingBranch', formData.trainingBranch.trim());
    submitFormData.append('termsCondition', formData.termsCondition);
    submitFormData.append('priority', formData.priority);
    submitFormData.append('appliedBatch', formData.appliedBatch.trim());
    submitFormData.append('source', formData.source);
    submitFormData.append('notes', formData.notes.trim());

    // Append files
    if (files.admissionFrontPage) {
      submitFormData.append('admissionFrontPage', files.admissionFrontPage);
    }
    if (files.admissionBackPage) {
      submitFormData.append('admissionBackPage', files.admissionBackPage);
    }
    if (files.studentStatement) {
      submitFormData.append('studentStatement', files.studentStatement);
    }
    if (files.confidentialForm) {
      submitFormData.append('confidentialForm', files.confidentialForm);
    }

    // Clear any previous errors
    dispatch(clearError());

    if (admission) {
      await dispatch(updateAdmission({ admissionId: admission._id, admissionData: submitFormData }));
    } else {
      await dispatch(createAdmission(submitFormData));
    }
  };

  const handleReset = () => {
    setFormData({
      student: '',
      course: '',
      trainingBranch: '',
      termsCondition: false,
      priority: 'medium',
      appliedBatch: '',
      source: 'website',
      notes: ''
    });
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

  const handleCancel = () => {
    onClose();
  };

  const isFormValid = () => {
    return formData.student && 
           formData.course && 
           formData.trainingBranch.trim() && 
           formData.termsCondition && 
           Object.keys(errors).length === 0;
  };

  const getFileName = (file) => {
    return file ? file.name : 'No file chosen';
  };

  const notesCount = formData.notes.length;

  const activeCourses = courses.filter(course => course.isActive);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      {success && (success.includes('created') || success.includes('updated')) && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>{success}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-green-600">Closing...</span>
            <button onClick={handleCancel} className="text-green-700 hover:text-green-900">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>❌</span>
            <span>{error}</span>
          </div>
          <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900">
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student and Course Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Selection */}
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
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.student ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={operationLoading}
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.studentId})
                </option>
              ))}
            </select>
            {errors.student && touched.student && (
              <p className="mt-1 text-sm text-red-600">{errors.student}</p>
            )}
          </div>

          {/* Course Selection */}
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
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.course ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={operationLoading}
            >
              <option value="">Select a course</option>
              {activeCourses.map(course => (
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
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.trainingBranch ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter training branch location"
              disabled={operationLoading}
            />
            {errors.trainingBranch && touched.trainingBranch && (
              <p className="mt-1 text-sm text-red-600">{errors.trainingBranch}</p>
            )}
          </div>
        </div>

        {/* Priority and Source */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={operationLoading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

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
              disabled={operationLoading}
            >
              <option value="website">Website</option>
              <option value="walkin">Walk-in</option>
              <option value="referral">Referral</option>
              <option value="counsellor">Counsellor</option>
              <option value="social_media">Social Media</option>
            </select>
          </div>
        </div>

        {/* Applied Batch */}
        <div>
          <label htmlFor="appliedBatch" className="block text-sm font-medium text-gray-700 mb-2">
            Applied Batch
          </label>
          <input
            type="text"
            id="appliedBatch"
            name="appliedBatch"
            value={formData.appliedBatch}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Morning Batch, Evening Batch"
            disabled={operationLoading}
          />
        </div>

        {/* Document Uploads */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Upload Documents (Images or PDFs)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Admission Front Page */}
            <div>
              <label htmlFor="admissionFrontPage" className="block text-sm font-medium text-gray-700 mb-2">
                Admission Front Page
              </label>
              <input
                type="file"
                id="admissionFrontPage"
                name="admissionFrontPage"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={operationLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                {getFileName(files.admissionFrontPage)}
              </p>
            </div>

            {/* Admission Back Page */}
            <div>
              <label htmlFor="admissionBackPage" className="block text-sm font-medium text-gray-700 mb-2">
                Admission Back Page
              </label>
              <input
                type="file"
                id="admissionBackPage"
                name="admissionBackPage"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={operationLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                {getFileName(files.admissionBackPage)}
              </p>
            </div>

            {/* Student Statement */}
            <div>
              <label htmlFor="studentStatement" className="block text-sm font-medium text-gray-700 mb-2">
                Student Statement
              </label>
              <input
                type="file"
                id="studentStatement"
                name="studentStatement"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={operationLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                {getFileName(files.studentStatement)}
              </p>
            </div>

            {/* Confidential Form */}
            <div>
              <label htmlFor="confidentialForm" className="block text-sm font-medium text-gray-700 mb-2">
                Confidential Form
              </label>
              <input
                type="file"
                id="confidentialForm"
                name="confidentialForm"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={operationLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                {getFileName(files.confidentialForm)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Supported formats: JPG, PNG, GIF, PDF (Max 10MB per file)
          </p>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes
            <span className="text-gray-400 text-xs ml-2">
              {notesCount}/500 characters
            </span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            value={formData.notes}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.notes ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Additional notes or comments..."
            disabled={operationLoading}
          />
          {errors.notes && touched.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
          )}
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${
              notesCount > 500 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {500 - notesCount} characters remaining
            </span>
          </div>
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
            className={`h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
              errors.termsCondition ? 'border-red-300' : ''
            }`}
            disabled={operationLoading}
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
            disabled={operationLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
          >
            Reset
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            disabled={operationLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={operationLoading || !isFormValid()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
