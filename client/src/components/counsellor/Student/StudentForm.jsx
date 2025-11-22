import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStudent, updateStudent, clearError, clearSuccess } from '../../../store/slices/studentSlice';

const StudentForm = ({ student, onClose }) => {
  const dispatch = useDispatch();
  const { operationLoading, error, success } = useSelector(state => state.students);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    alternateEmail: '',
    alternatePhone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    idProof: {
      type: '',
      number: '',
      photo: ''
    },
    studentPhoto: '',
    studentSignature: ''
  });

  // File states
  const [files, setFiles] = useState({
    studentPhoto: null,
    studentSignature: null,
    idProofPhoto: null
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [fileErrors, setFileErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        alternateEmail: student.alternateEmail || '',
        alternatePhone: student.alternatePhone || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
        gender: student.gender || '',
        address: student.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        },
        idProof: student.idProof || {
          type: '',
          number: '',
          photo: ''
        },
        studentPhoto: student.studentPhoto || '',
        studentSignature: student.studentSignature || ''
      });
    }
  }, [student]);

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

  // Validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s.'-]+$/,
      message: {
        required: 'Student name is required',
        minLength: 'Name must be at least 2 characters long',
        maxLength: 'Name cannot exceed 100 characters',
        pattern: 'Name can only contain letters, spaces, apostrophes, hyphens, and periods'
      }
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 255,
      message: {
        required: 'Email is required',
        pattern: 'Please enter a valid email address',
        maxLength: 'Email cannot exceed 255 characters'
      }
    },
    phone: {
      required: true,
      pattern: /^\d{10}$/,
      message: {
        required: 'Phone number is required',
        pattern: 'Please enter a valid 10-digit phone number'
      }
    },
    alternateEmail: {
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: {
        pattern: 'Please enter a valid alternate email address'
      }
    },
    alternatePhone: {
      required: false,
      pattern: /^\d{10}$/,
      message: {
        pattern: 'Please enter a valid 10-digit alternate phone number'
      }
    },
    dateOfBirth: {
      required: false,
      validate: (value) => {
        if (!value) return true;
        const dob = new Date(value);
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 100); // 100 years ago
        
        if (dob > today) return 'Date of birth cannot be in the future';
        if (dob < minDate) return 'Date of birth cannot be more than 100 years ago';
        if (today.getFullYear() - dob.getFullYear() < 5) return 'Student must be at least 5 years old';
        
        return true;
      }
    },
    gender: {
      required: false
    },
    'address.street': {
      required: false,
      maxLength: 255,
      message: {
        maxLength: 'Street address cannot exceed 255 characters'
      }
    },
    'address.city': {
      required: false,
      maxLength: 100,
      pattern: /^[a-zA-Z\s.-]+$/,
      message: {
        maxLength: 'City name cannot exceed 100 characters',
        pattern: 'City name can only contain letters, spaces, hyphens, and periods'
      }
    },
    'address.state': {
      required: false,
      maxLength: 100,
      pattern: /^[a-zA-Z\s.-]+$/,
      message: {
        maxLength: 'State name cannot exceed 100 characters',
        pattern: 'State name can only contain letters, spaces, hyphens, and periods'
      }
    },
    'address.zipCode': {
      required: false,
      pattern: /^\d{6}$/,
      message: {
        pattern: 'ZIP code must be exactly 6 digits'
      }
    },
    'address.country': {
      required: false,
      maxLength: 100,
      message: {
        maxLength: 'Country name cannot exceed 100 characters'
      }
    },
    'idProof.type': {
      required: false
    },
    'idProof.number': {
      required: false,
      validate: (value, formData) => {
        if (!value) return true;
        
        const idType = formData.idProof.type;
        const idNumber = value.trim();
        
        const idPatterns = {
          aadhaar: /^\d{12}$/,
          pan_card: /^[A-Z]{5}\d{4}[A-Z]{1}$/,
          passport: /^[A-PR-WY][1-9]\d\s?\d{4}[1-9]$/,
          driving_license: /^[A-Z]{2}\d{13}$/,
          voter_id: /^[A-Z]{3}\d{7}$/
        };
        
        if (idType && idPatterns[idType]) {
          if (!idPatterns[idType].test(idNumber)) {
            return `Please enter a valid ${idType.replace('_', ' ')} number`;
          }
        }
        
        return true;
      }
    }
  };

  const fileValidationRules = {
    studentPhoto: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
      message: {
        type: 'Student photo must be a JPEG, PNG, or GIF image',
        size: 'Student photo must be less than 5MB'
      }
    },
    studentSignature: {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
      message: {
        type: 'Signature must be a JPEG, PNG, or GIF image',
        size: 'Signature must be less than 2MB'
      }
    },
    idProofPhoto: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
      message: {
        type: 'ID proof must be an image (JPEG, PNG) or PDF',
        size: 'ID proof must be less than 10MB'
      }
    }
  };

  const validateField = (name, value) => {
    const rule = validationRules[name];
    const newErrors = { ...errors };

    if (!rule) {
      delete newErrors[name];
      setErrors(newErrors);
      return true;
    }

    // Clear error if field is empty and not required
    if (!value.trim() && !rule.required) {
      delete newErrors[name];
      setErrors(newErrors);
      return true;
    }

    // Required validation
    if (rule.required && !value.trim()) {
      newErrors[name] = rule.message.required;
    }
    // Pattern validation
    else if (rule.pattern && value.trim() && !rule.pattern.test(value.trim())) {
      newErrors[name] = rule.message.pattern;
    }
    // Min length validation
    else if (rule.minLength && value.trim().length < rule.minLength) {
      newErrors[name] = rule.message.minLength;
    }
    // Max length validation
    else if (rule.maxLength && value.trim().length > rule.maxLength) {
      newErrors[name] = rule.message.maxLength;
    }
    // Custom validation function
    else if (rule.validate) {
      const validationResult = rule.validate(value, formData);
      if (validationResult !== true) {
        newErrors[name] = validationResult;
      } else {
        delete newErrors[name];
      }
    }
    // If no errors, remove from errors object
    else {
      delete newErrors[name];
    }

    setErrors(newErrors);
    return !newErrors[name];
  };

  const validateFile = (name, file) => {
    const rule = fileValidationRules[name];
    const newFileErrors = { ...fileErrors };

    if (!file) {
      delete newFileErrors[name];
      setFileErrors(newFileErrors);
      return true;
    }

    if (!rule.allowedTypes.includes(file.type)) {
      newFileErrors[name] = rule.message.type;
    } else if (file.size > rule.maxSize) {
      newFileErrors[name] = rule.message.size;
    } else {
      delete newFileErrors[name];
    }

    setFileErrors(newFileErrors);
    return !newFileErrors[name];
  };

  const validateForm = () => {
    const newErrors = {};
    const newFileErrors = { ...fileErrors };

    // Validate all fields
    Object.keys(validationRules).forEach(field => {
      let value;
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        value = formData[parent]?.[child] || '';
      } else {
        value = formData[field] || '';
      }
      
      const rule = validationRules[field];
      
      if (rule.required && !value.trim()) {
        newErrors[field] = rule.message.required;
      } else if (value.trim()) {
        if (rule.pattern && !rule.pattern.test(value.trim())) {
          newErrors[field] = rule.message.pattern;
        } else if (rule.minLength && value.trim().length < rule.minLength) {
          newErrors[field] = rule.message.minLength;
        } else if (rule.maxLength && value.trim().length > rule.maxLength) {
          newErrors[field] = rule.message.maxLength;
        } else if (rule.validate) {
          const validationResult = rule.validate(value, formData);
          if (validationResult !== true) {
            newErrors[field] = validationResult;
          }
        }
      }
    });

    // Validate files
    Object.keys(files).forEach(fileField => {
      const file = files[fileField];
      if (file) {
        validateFile(fileField, file);
      }
    });

    // Mark all fields as touched for error display
    const allTouched = {};
    Object.keys(validationRules).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newFileErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
      
      // Validate nested address field
      if (touched[name]) {
        validateField(name, value);
      }
    } else if (name.startsWith('idProof.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        idProof: {
          ...prev.idProof,
          [field]: value
        }
      }));
      
      // Validate nested idProof field
      if (touched[name]) {
        validateField(name, value);
      }
      
      // Special case: if idProof type changes, validate the number
      if (field === 'type' && touched['idProof.number']) {
        validateField('idProof.number', formData.idProof.number);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));

      // Validate field in real-time if it's been touched
      if (touched[name]) {
        validateField(name, value);
      }
    }
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      const file = fileList[0];
      setFiles(prev => ({
        ...prev,
        [name]: file
      }));
      validateFile(name, file);
    } else {
      setFiles(prev => ({
        ...prev,
        [name]: null
      }));
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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
      // Scroll to first error
      const firstErrorField = document.querySelector('[class*="border-red-300"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }


    // Create FormData object for file upload
    const submitFormData = new FormData();

    // Append all form fields
    submitFormData.append('name', formData.name.trim());
    submitFormData.append('email', formData.email.trim().toLowerCase());
    submitFormData.append('phone', formData.phone.trim());
    
    if (formData.alternateEmail.trim()) {
      submitFormData.append('alternateEmail', formData.alternateEmail.trim());
    }
    
    if (formData.alternatePhone.trim()) {
      submitFormData.append('alternatePhone', formData.alternatePhone.trim());
    }
    
    if (formData.dateOfBirth) {
      submitFormData.append('dateOfBirth', formData.dateOfBirth);
    }
    
    if (formData.gender) {
      submitFormData.append('gender', formData.gender);
    }

    // Append address fields
    if (formData.address.street) {
      submitFormData.append('address[street]', formData.address.street);
    }
    if (formData.address.city) {
      submitFormData.append('address[city]', formData.address.city);
    }
    if (formData.address.state) {
      submitFormData.append('address[state]', formData.address.state);
    }
    if (formData.address.zipCode) {
      submitFormData.append('address[zipCode]', formData.address.zipCode);
    }
    if (formData.address.country) {
      submitFormData.append('address[country]', formData.address.country);
    }

    // Append idProof fields as JSON string
    if (formData.idProof.type || formData.idProof.number) {
      submitFormData.append('idProof', JSON.stringify({
        type: formData.idProof.type,
        number: formData.idProof.number
      }));
    }

    // Append files
    if (files.studentPhoto) {
      submitFormData.append('studentPhoto', files.studentPhoto);
    }
    if (files.studentSignature) {
      submitFormData.append('studentSignature', files.studentSignature);
    }
    if (files.idProofPhoto) {
      submitFormData.append('idProofPhoto', files.idProofPhoto);
    }

    // Clear any previous errors
    dispatch(clearError());

    if (student) {
      await dispatch(updateStudent({ 
        studentId: student._id, 
        studentData: submitFormData 
      }));
    } else {
      await dispatch(createStudent(submitFormData));
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      alternateEmail: '',
      alternatePhone: '',
      dateOfBirth: '',
      gender: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      },
      idProof: {
        type: '',
        number: '',
        photo: ''
      },
      studentPhoto: '',
      studentSignature: ''
    });
    setFiles({
      studentPhoto: null,
      studentSignature: null,
      idProofPhoto: null
    });
    setErrors({});
    setTouched({});
    setFileErrors({});
    dispatch(clearError());
  };

  const handleCancel = () => {
    onClose();
  };

  const isFormValid = () => {
    const requiredFields = ['name', 'email', 'phone'];
    const hasRequiredFields = requiredFields.every(field => 
      formData[field] && formData[field].trim()
    );
    
    const hasFieldErrors = Object.keys(errors).length > 0;
    const hasFileErrors = Object.keys(fileErrors).length > 0;
    
    return hasRequiredFields && !hasFieldErrors && !hasFileErrors;
  };

  const calculateAge = () => {
    if (!formData.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(formData.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getFileName = (file) => {
    return file ? file.name : 'No file chosen';
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] ? errors[fieldName] : '';
  };

  const getFileError = (fileName) => {
    return fileErrors[fileName];
  };

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
        {/* Personal Information Section */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('name') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
                disabled={operationLoading}
                maxLength={100}
              />
              {getFieldError('name') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('email') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
                disabled={operationLoading}
                maxLength={255}
              />
              {getFieldError('email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('phone') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter 10-digit phone number"
                disabled={operationLoading}
                maxLength={10}
                pattern="[0-9]{10}"
              />
              {getFieldError('phone') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('dateOfBirth') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={operationLoading}
                max={new Date().toISOString().split('T')[0]}
              />
              {getFieldError('dateOfBirth') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('dateOfBirth')}</p>
              )}
              {formData.dateOfBirth && !getFieldError('dateOfBirth') && (
                <p className="mt-1 text-sm text-gray-500">Age: {calculateAge()} years</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={operationLoading}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alternate Contact Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alternate Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Alternate Email */}
            <div>
              <label htmlFor="alternateEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Alternate Email
              </label>
              <input
                type="email"
                id="alternateEmail"
                name="alternateEmail"
                value={formData.alternateEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('alternateEmail') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter alternate email"
                disabled={operationLoading}
                maxLength={255}
              />
              {getFieldError('alternateEmail') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('alternateEmail')}</p>
              )}
            </div>

            {/* Alternate Phone */}
            <div>
              <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700 mb-2">
                Alternate Phone
              </label>
              <input
                type="tel"
                id="alternatePhone"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('alternatePhone') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter alternate phone number"
                disabled={operationLoading}
                maxLength={10}
                pattern="[0-9]{10}"
              />
              {getFieldError('alternatePhone') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('alternatePhone')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Street */}
            <div className="md:col-span-2">
              <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('address.street') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter street address"
                disabled={operationLoading}
                maxLength={255}
              />
              {getFieldError('address.street') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('address.street')}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('address.city') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter city"
                disabled={operationLoading}
                maxLength={100}
              />
              {getFieldError('address.city') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('address.city')}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('address.state') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter state"
                disabled={operationLoading}
                maxLength={100}
              />
              {getFieldError('address.state') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('address.state')}</p>
              )}
            </div>

            {/* Zip Code */}
            <div>
              <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                id="address.zipCode"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('address.zipCode') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter 6-digit ZIP code"
                disabled={operationLoading}
                maxLength={6}
                pattern="[0-9]{6}"
              />
              {getFieldError('address.zipCode') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('address.zipCode')}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('address.country') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter country"
                disabled={operationLoading}
                maxLength={100}
              />
              {getFieldError('address.country') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('address.country')}</p>
              )}
            </div>
          </div>
        </div>

        {/* ID Proof Information */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">ID Proof Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID Proof Type */}
            <div>
              <label htmlFor="idProof.type" className="block text-sm font-medium text-gray-700 mb-2">
                ID Proof Type
              </label>
              <select
                id="idProof.type"
                name="idProof.type"
                value={formData.idProof.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={operationLoading}
              >
                <option value="">Select ID Type</option>
                <option value="aadhaar">Aadhaar Card</option>
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
                <option value="voter_id">Voter ID</option>
                <option value="pan_card">PAN Card</option>
              </select>
            </div>

            {/* ID Proof Number */}
            <div>
              <label htmlFor="idProof.number" className="block text-sm font-medium text-gray-700 mb-2">
                ID Proof Number
              </label>
              <input
                type="text"
                id="idProof.number"
                name="idProof.number"
                value={formData.idProof.number}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFieldError('idProof.number') ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter ID number"
                disabled={operationLoading}
              />
              {getFieldError('idProof.number') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('idProof.number')}</p>
              )}
              {formData.idProof.type && !getFieldError('idProof.number') && (
                <p className="mt-1 text-sm text-gray-500 text-xs">
                  {formData.idProof.type === 'aadhaar' && 'Format: 12 digits (e.g., 123456789012)'}
                  {formData.idProof.type === 'pan_card' && 'Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)'}
                  {formData.idProof.type === 'passport' && 'Format: 1 letter, 7 digits (e.g., A1234567)'}
                  {formData.idProof.type === 'driving_license' && 'Format: 2 letters, 13 digits (e.g., DL1234567890123)'}
                  {formData.idProof.type === 'voter_id' && 'Format: 3 letters, 7 digits (e.g., ABC1234567)'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">Upload Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Photo */}
            <div>
              <label htmlFor="studentPhoto" className="block text-sm font-medium text-gray-700 mb-2">
                Student Photo
              </label>
              <input
                type="file"
                id="studentPhoto"
                name="studentPhoto"
                onChange={handleFileChange}
                accept="image/jpeg, image/jpg, image/png, image/gif"
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFileError('studentPhoto') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={operationLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                {getFileName(files.studentPhoto)}
              </p>
              {getFileError('studentPhoto') && (
                <p className="mt-1 text-sm text-red-600">{getFileError('studentPhoto')}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Accepted: JPEG, PNG, GIF | Max: 5MB
              </p>
            </div>

            {/* Student Signature */}
            <div>
              <label htmlFor="studentSignature" className="block text-sm font-medium text-gray-700 mb-2">
                Student Signature
              </label>
              <input
                type="file"
                id="studentSignature"
                name="studentSignature"
                onChange={handleFileChange}
                accept="image/jpeg, image/jpg, image/png, image/gif"
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFileError('studentSignature') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={operationLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                {getFileName(files.studentSignature)}
              </p>
              {getFileError('studentSignature') && (
                <p className="mt-1 text-sm text-red-600">{getFileError('studentSignature')}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Accepted: JPEG, PNG, GIF | Max: 2MB
              </p>
            </div>

            {/* ID Proof Photo */}
            <div className="md:col-span-2">
              <label htmlFor="idProofPhoto" className="block text-sm font-medium text-gray-700 mb-2">
                ID Proof Document (Image or PDF)
              </label>
              <input
                type="file"
                id="idProofPhoto"
                name="idProofPhoto"
                onChange={handleFileChange}
                accept="image/jpeg, image/jpg, image/png, application/pdf"
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getFileError('idProofPhoto') ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={operationLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                {getFileName(files.idProofPhoto)}
              </p>
              {getFileError('idProofPhoto') && (
                <p className="mt-1 text-sm text-red-600">{getFileError('idProofPhoto')}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Accepted: JPEG, PNG, PDF | Max: 10MB
              </p>
            </div>
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
                <span>{student ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{student ? 'Update Student' : 'Create Student'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;