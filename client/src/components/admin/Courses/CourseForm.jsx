import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse, updateCourse, clearError, clearSuccess } from '../../../store/slices/courseSlice';

const CourseForm = ({ course, onClose }) => {
  const dispatch = useDispatch();
  const { operationLoading, error, success } = useSelector(state => state.courses);
  
  const [formData, setFormData] = useState({
    name: '',
    fee: '',
    duration: '',
    description: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        fee: course.fee || '',
        duration: course.duration || '',
        description: course.description || '',
        isActive: course.isActive !== undefined ? course.isActive : true
      });
    }
  }, [course]);

  // Handle successful operation and close form
  useEffect(() => {
    if (success && (success.includes('created') || success.includes('updated'))) {
      console.log('Operation successful, closing form in 1 second...');
      
      const timer = setTimeout(() => {
        console.log('Closing form now');
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
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Course name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Course name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      
      case 'fee':
        if (!value) {
          newErrors.fee = 'Course fee is required';
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          newErrors.fee = 'Course fee must be a valid positive number';
        } else {
          delete newErrors.fee;
        }
        break;
      
      case 'duration':
        if (!value.trim()) {
          newErrors.duration = 'Duration is required';
        } else {
          delete newErrors.duration;
        }
        break;
      
      case 'description':
        if (value.trim().length > 500) {
          newErrors.description = 'Description must be less than 500 characters';
        } else {
          delete newErrors.description;
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

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Course name must be at least 2 characters';
    }

    if (!formData.fee) {
      newErrors.fee = 'Course fee is required';
    } else if (isNaN(formData.fee) || parseFloat(formData.fee) <= 0) {
      newErrors.fee = 'Course fee must be a valid positive number';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }

    if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    setTouched({
      name: true,
      fee: true,
      duration: true,
      description: true
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

    console.log('Submitting form...');

    const submitData = {
      ...formData,
      fee: parseFloat(formData.fee),
      name: formData.name.trim(),
      duration: formData.duration.trim(),
      description: formData.description.trim()
    };

    // Clear any previous errors
    dispatch(clearError());

    if (course) {
      console.log('Updating course...');
      await dispatch(updateCourse({ courseId: course._id, courseData: submitData }));
    } else {
      console.log('Creating course...');
      await dispatch(createCourse(submitData));
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      fee: '',
      duration: '',
      description: '',
      isActive: true
    });
    setErrors({});
    setTouched({});
    dispatch(clearError());
  };

  const handleCancel = () => {
    onClose();
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.fee && 
           formData.duration.trim() && 
           Object.keys(errors).length === 0;
  };

  const characterCount = formData.description.length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Debug info - Remove in production */}
      <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
        Debug: success: {success || 'null'}, operationLoading: {operationLoading ? 'true' : 'false'}, error: {error || 'null'}
      </div>

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
        {/* Course Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Course Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter course name (e.g., Full Stack Web Development)"
            disabled={operationLoading}
          />
          {errors.name && touched.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Course Fee and Duration - Inline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course Fee */}
          <div>
            <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-2">
              Course Fee (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                id="fee"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                onBlur={handleBlur}
                min="0"
                step="1"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.fee ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
                disabled={operationLoading}
              />
            </div>
            {errors.fee && touched.fee && (
              <p className="mt-1 text-sm text-red-600">{errors.fee}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Duration <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.duration ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 6 months, 12 weeks"
              disabled={operationLoading}
            />
            {errors.duration && touched.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
            <span className="text-gray-400 text-xs ml-2">
              {characterCount}/500 characters
            </span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe the course content, objectives, and what students will learn..."
            disabled={operationLoading}
          />
          {errors.description && touched.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${
              characterCount > 500 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {500 - characterCount} characters remaining
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={operationLoading}
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active Course
          </label>
        </div>
        <p className="text-xs text-gray-500 -mt-4">
          {formData.isActive 
            ? 'This course is currently active and available for admissions' 
            : 'This course is inactive and hidden from admission forms'
          }
        </p>

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
                <span>{course ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{course ? 'Update Course' : 'Create Course'}</span>
            )}
          </button>
        </div>

        {/* Form Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">💡</span>
            <div>
              <h4 className="text-sm font-medium text-blue-800">Tips for creating effective courses:</h4>
              <ul className="mt-1 text-xs text-blue-700 list-disc list-inside space-y-1">
                <li>Use clear and descriptive course names</li>
                <li>Set realistic pricing based on market standards</li>
                <li>Provide detailed descriptions of course content</li>
                <li>Specify accurate duration including any prerequisites</li>
                <li>Keep courses inactive until they're ready for enrollment</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;