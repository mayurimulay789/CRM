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

  // Validation rules configuration
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s&(),.-]+$/,
      message: {
        required: 'Course name is required',
        minLength: 'Course name must be at least 2 characters long',
        maxLength: 'Course name cannot exceed 100 characters',
        pattern: 'Course name can only contain letters, numbers, spaces, and basic punctuation (&, (), ,, ., -)'
      }
    },
    fee: {
      required: true,
      min: 0,
      max: 1000000, // 10 lakhs
      step: 1,
      message: {
        required: 'Course fee is required',
        invalid: 'Course fee must be a valid positive number',
        min: 'Course fee must be greater than 0',
        max: 'Course fee cannot exceed ₹10,00,000',
        decimal: 'Course fee must be a whole number (no decimals)'
      }
    },
    duration: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9\s-]+$/,
      message: {
        required: 'Duration is required',
        minLength: 'Duration must be at least 2 characters long',
        maxLength: 'Duration cannot exceed 50 characters',
        pattern: 'Duration can only contain letters, numbers, spaces, and hyphens'
      }
    },
    description: {
      required: false,
      maxLength: 500,
      message: {
        maxLength: 'Description must be less than 500 characters'
      }
    }
  };

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
    const rule = validationRules[name];
    const newErrors = { ...errors };

    if (!rule) {
      delete newErrors[name];
      setErrors(newErrors);
      return true;
    }

    // Clear error if field is empty and not required
    if (!value.toString().trim() && !rule.required) {
      delete newErrors[name];
      setErrors(newErrors);
      return true;
    }

    // Required validation
    if (rule.required && !value.toString().trim()) {
      newErrors[name] = rule.message.required;
    }
    // Pattern validation
    else if (rule.pattern && value.toString().trim() && !rule.pattern.test(value.toString().trim())) {
      newErrors[name] = rule.message.pattern;
    }
    // Min length validation
    else if (rule.minLength && value.toString().trim().length < rule.minLength) {
      newErrors[name] = rule.message.minLength;
    }
    // Max length validation
    else if (rule.maxLength && value.toString().trim().length > rule.maxLength) {
      newErrors[name] = rule.message.maxLength;
    }
    // Number validation for fee
    else if (name === 'fee' && value.toString().trim()) {
      const feeValue = parseFloat(value);
      
      if (isNaN(feeValue)) {
        newErrors.fee = rule.message.invalid;
      } else if (feeValue < rule.min) {
        newErrors.fee = rule.message.min;
      } else if (feeValue > rule.max) {
        newErrors.fee = rule.message.max;
      } else if (!Number.isInteger(feeValue)) {
        newErrors.fee = rule.message.decimal;
      } else {
        delete newErrors.fee;
      }
    }
    // If no errors, remove from errors object
    else {
      delete newErrors[name];
    }

    setErrors(newErrors);
    return !newErrors[name];
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate all fields
    Object.keys(validationRules).forEach(field => {
      const value = formData[field];
      const rule = validationRules[field];
      
      if (rule.required && !value.toString().trim()) {
        newErrors[field] = rule.message.required;
      } else if (value.toString().trim()) {
        if (rule.pattern && !rule.pattern.test(value.toString().trim())) {
          newErrors[field] = rule.message.pattern;
        } else if (rule.minLength && value.toString().trim().length < rule.minLength) {
          newErrors[field] = rule.message.minLength;
        } else if (rule.maxLength && value.toString().trim().length > rule.maxLength) {
          newErrors[field] = rule.message.maxLength;
        } else if (field === 'fee') {
          const feeValue = parseFloat(value);
          if (isNaN(feeValue)) {
            newErrors.fee = rule.message.invalid;
          } else if (feeValue < rule.min) {
            newErrors.fee = rule.message.min;
          } else if (feeValue > rule.max) {
            newErrors.fee = rule.message.max;
          } else if (!Number.isInteger(feeValue)) {
            newErrors.fee = rule.message.decimal;
          }
        }
      }
    });

    // Mark all fields as touched for error display
    const allTouched = {};
    Object.keys(validationRules).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    // Special handling for fee field - only allow numbers
    if (name === 'fee') {
      // Remove any non-digit characters except decimal (we'll handle decimal restriction separately)
      const numericValue = value.replace(/[^\d.]/g, '');
      
      // Prevent multiple decimal points
      const decimalCount = numericValue.split('.').length - 1;
      if (decimalCount > 1) {
        return; // Don't update if multiple decimals
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: fieldValue
      }));
    }

    // Validate field in real-time if it's been touched
    if (touched[name]) {
      validateField(name, name === 'fee' ? value : fieldValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // For fee field, format the value on blur
    if (name === 'fee' && value.trim()) {
      const feeValue = parseFloat(value);
      if (!isNaN(feeValue) && feeValue >= 0) {
        // Remove decimals and format
        const formattedFee = Math.floor(feeValue).toString();
        setFormData(prev => ({
          ...prev,
          fee: formattedFee
        }));
        validateField(name, formattedFee);
        return;
      }
    }
    
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('[class*="border-red-300"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    console.log('Submitting form...');

    const submitData = {
      ...formData,
      fee: parseInt(formData.fee, 10), // Convert to integer
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
    const requiredFields = ['name', 'fee', 'duration'];
    const hasRequiredFields = requiredFields.every(field => {
      const value = formData[field];
      return value !== null && value !== undefined && value.toString().trim() !== '';
    });
    
    const hasFieldErrors = Object.keys(errors).length > 0;
    
    return hasRequiredFields && !hasFieldErrors;
  };

  const characterCount = formData.description.length;
  const isDescriptionValid = characterCount <= 500;

  const getFieldError = (fieldName) => {
    return touched[fieldName] ? errors[fieldName] : '';
  };

  const formatFeeDisplay = (fee) => {
    if (!fee) return '';
    const num = parseInt(fee, 10);
    return isNaN(num) ? fee : num.toLocaleString('en-IN');
  };

  return (
    <div className="max-w-2xl mx-auto">
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
              getFieldError('name') ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter course name (e.g., Full Stack Web Development)"
            disabled={operationLoading}
            maxLength={100}
          />
          {getFieldError('name') && (
            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
              <span>⚠️</span>
              <span>{getFieldError('name')}</span>
            </p>
          )}
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">
              {formData.name.length}/100 characters
            </span>
            <span className="text-xs text-gray-500">
              Letters, numbers, spaces, & basic punctuation allowed
            </span>
          </div>
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
                type="text"
                id="fee"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('fee') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0"
                disabled={operationLoading}
                inputMode="numeric"
              />
            </div>
            {getFieldError('fee') && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{getFieldError('fee')}</span>
              </p>
            )}
            {formData.fee && !getFieldError('fee') && (
              <p className="mt-1 text-sm text-green-600">
                Fee: ₹{formatFeeDisplay(formData.fee)}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Whole numbers only • Max: ₹10,00,000
            </p>
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
                getFieldError('duration') ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., 6 months, 12 weeks, 1 year"
              disabled={operationLoading}
              maxLength={50}
            />
            {getFieldError('duration') && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{getFieldError('duration')}</span>
              </p>
            )}
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                {formData.duration.length}/50 characters
              </span>
              <span className="text-xs text-gray-500">
                Letters, numbers, spaces, hyphens
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
            <span className={`text-xs ml-2 ${
              characterCount > 500 ? 'text-red-600' : 'text-gray-400'
            }`}>
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
              getFieldError('description') ? 'border-red-300 bg-red-50' : 'border-gray-300'
            } ${!isDescriptionValid ? 'border-red-300' : ''}`}
            placeholder="Describe the course content, objectives, and what students will learn..."
            disabled={operationLoading}
            maxLength={500}
          />
          {getFieldError('description') && (
            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
              <span>⚠️</span>
              <span>{getFieldError('description')}</span>
            </p>
          )}
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${
              characterCount > 500 ? 'text-red-600 font-medium' : 'text-gray-500'
            }`}>
              {500 - characterCount} characters remaining
            </span>
            {characterCount > 450 && (
              <span className="text-xs text-orange-600">
                {characterCount > 490 ? '⚠️ Approaching limit' : '↟ Getting long'}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={operationLoading}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
              Active Course
            </label>
            <p className="text-sm text-gray-600 mt-1">
              {formData.isActive 
                ? '✅ This course is currently active and available for admissions' 
                : '❌ This course is inactive and hidden from admission forms'
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              You can change this status anytime after creation
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            disabled={operationLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            disabled={operationLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </form>
    </div>
  );
};

export default CourseForm;