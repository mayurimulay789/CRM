<<<<<<< HEAD
import React from 'react';

const AdmissionForm = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">AdmissionForm</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>AdmissionForm content will be displayed here.</p>
        {/* Add your component logic and JSX here */}
      </div>
=======
// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { createAdmission, updateAdmission, clearError, clearSuccess } from '../../../store/slices/admissionSlice';

// const AdmissionForm = ({ admission, onClose }) => {
//   const dispatch = useDispatch();
//   const { operationLoading, operationSuccess, error } = useSelector(state => state.admissions);
  
//   const [formData, setFormData] = useState({
//     // Basic Information
//     admissionNo: '',
//     admissionDate: '',
//     name: '',
    
//     // Contact Information
//     email: '',
//     alternateEmail: '',
//     phoneNo: '',
//     alternateNumber: '',
//     primaryEmail: '',
//     primaryNumber: '',
    
//     // Course Information
//     course: '',
//     courseFee: '',
//     trainingBranch: '',
//     counsellor: '',
    
//     // Document URLs
//     idProofPhoto: '',
//     studentPhoto: '',
//     studentSignature: '',
//     admissionFrontPage: '',
//     admissionBackPage: '',
//     paymentReceipt: '',
//     studentStatement: '',
//     confidentialForm: '',
    
//     // Status & Terms
//     termsCondition: false,
//     emailVerified: false,
//     status: 'pending',
//     operation: ''
//   });

//   const [fileUploads, setFileUploads] = useState({
//     idProofPhoto: null,
//     studentPhoto: null,
//     studentSignature: null,
//     admissionFrontPage: null,
//     admissionBackPage: null,
//     paymentReceipt: null,
//     studentStatement: null,
//     confidentialForm: null
//   });

//   useEffect(() => {
//     if (admission) {
//       // Pre-fill form for edit mode
//       setFormData({
//         admissionNo: admission.admissionNo || '',
//         admissionDate: admission.admissionDate ? new Date(admission.admissionDate).toISOString().split('T')[0] : '',
//         name: admission.name || '',
        
//         email: admission.email || '',
//         alternateEmail: admission.alternateEmail || '',
//         phoneNo: admission.phoneNo || '',
//         alternateNumber: admission.alternateNumber || '',
//         primaryEmail: admission.primaryEmail || '',
//         primaryNumber: admission.primaryNumber || '',
        
//         course: admission.course || '',
//         courseFee: admission.courseFee || '',
//         trainingBranch: admission.trainingBranch || '',
//         counsellor: admission.counsellor || '',
        
//         idProofPhoto: admission.idProofPhoto || '',
//         studentPhoto: admission.studentPhoto || '',
//         studentSignature: admission.studentSignature || '',
//         admissionFrontPage: admission.admissionFrontPage || '',
//         admissionBackPage: admission.admissionBackPage || '',
//         paymentReceipt: admission.paymentReceipt || '',
//         studentStatement: admission.studentStatement || '',
//         confidentialForm: admission.confidentialForm || '',
        
//         termsCondition: admission.termsCondition || false,
//         emailVerified: admission.emailVerified || false,
//         status: admission.status || 'pending',
//         operation: admission.operation || ''
//       });
//     } else {
//       // Generate admission number for new admission
//       const newAdmissionNo = `ADM${Date.now()}`;
//       setFormData(prev => ({ ...prev, admissionNo: newAdmissionNo }));
//     }
//   }, [admission]);

//   useEffect(() => {
//     if (operationSuccess) {
//       const timer = setTimeout(() => {
//         onClose();
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [operationSuccess, onClose]);

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleFileChange = (e, fieldName) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFileUploads(prev => ({
//         ...prev,
//         [fieldName]: file
//       }));
      
//       // For demo purposes, create a temporary URL
//       // In real application, you would upload to cloud storage and get URL
//       const tempUrl = URL.createObjectURL(file);
//       setFormData(prev => ({
//         ...prev,
//         [fieldName]: tempUrl
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       const submitData = {
//         ...formData,
//         courseFee: Number(formData.courseFee),
//         admissionDate: new Date(formData.admissionDate).toISOString()
//       };

//       if (admission) {
//         // Update existing admission
//         await dispatch(updateAdmission({ admissionNo: admission.admissionNo, admissionData: submitData }));
//       } else {
//         // Create new admission
//         await dispatch(createAdmission(submitData));
//       }
//     } catch (error) {
//       console.error('Error submitting admission:', error);
//     }
//   };

//   const statusOptions = [
//     { value: 'pending', label: 'Pending' },
//     { value: 'approved', label: 'Approved' },
//     { value: 'rejected', label: 'Rejected' },
//     { value: 'enrolled', label: 'Enrolled' }
//   ];

//   const courseOptions = [
//     'Full Stack Development',
//     'Data Science',
//     'Cyber Security',
//     'Cloud Computing',
//     'Digital Marketing',
//     'UI/UX Design'
//   ];

//   const branchOptions = [
//     'Mumbai',
//     'Delhi',
//     'Bangalore',
//     'Hyderabad',
//     'Chennai',
//     'Pune',
//     'Kolkata'
//   ];

//   const renderFileInput = (fieldName, label, accept = "image/*,.pdf,.doc,.docx") => (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//       <input
//         type="file"
//         accept={accept}
//         onChange={(e) => handleFileChange(e, fieldName)}
//         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//       />
//       {formData[fieldName] && (
//         <div className="mt-1">
//           <span className="text-xs text-green-600">✓ File selected</span>
//           {formData[fieldName].startsWith('blob:') && (
//             <a 
//               href={formData[fieldName]} 
//               target="_blank" 
//               rel="noopener noreferrer"
//               className="ml-2 text-xs text-blue-600 hover:underline"
//             >
//               Preview
//             </a>
//           )}
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="max-h-[80vh] overflow-y-auto">
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Success Message */}
//         {operationSuccess && (
//           <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
//             <div className="flex items-center space-x-2">
//               <span>✅</span>
//               <span>{operationSuccess}</span>
//             </div>
//           </div>
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//             <div className="flex items-center space-x-2">
//               <span>❌</span>
//               <span>{error}</span>
//             </div>
//             <button 
//               type="button"
//               onClick={() => dispatch(clearError())} 
//               className="mt-2 text-red-700 hover:text-red-900 text-sm"
//             >
//               Dismiss
//             </button>
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Basic Information Section */}
//           <div className="col-span-full">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h3>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number *</label>
//             <input
//               type="text"
//               name="admissionNo"
//               value={formData.admissionNo}
//               onChange={handleInputChange}
//               required
//               disabled={!!admission} // Disable editing admission number for existing records
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date *</label>
//             <input
//               type="date"
//               name="admissionDate"
//               value={formData.admissionDate}
//               onChange={handleInputChange}
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleInputChange}
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           {/* Contact Information Section */}
//           <div className="col-span-full mt-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Contact Information</h3>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleInputChange}
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Email</label>
//             <input
//               type="email"
//               name="alternateEmail"
//               value={formData.alternateEmail}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
//             <input
//               type="tel"
//               name="phoneNo"
//               value={formData.phoneNo}
//               onChange={handleInputChange}
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
//             <input
//               type="tel"
//               name="alternateNumber"
//               value={formData.alternateNumber}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Primary Email</label>
//             <input
//               type="email"
//               name="primaryEmail"
//               value={formData.primaryEmail}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone</label>
//             <input
//               type="tel"
//               name="primaryNumber"
//               value={formData.primaryNumber}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           {/* Course Information Section */}
//           <div className="col-span-full mt-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Course Information</h3>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
//             <select
//               name="course"
//               value={formData.course}
//               onChange={handleInputChange}
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="">Select Course</option>
//               {courseOptions.map(course => (
//                 <option key={course} value={course}>{course}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Course Fee (₹) *</label>
//             <input
//               type="number"
//               name="courseFee"
//               value={formData.courseFee}
//               onChange={handleInputChange}
//               required
//               min="0"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Training Branch *</label>
//             <select
//               name="trainingBranch"
//               value={formData.trainingBranch}
//               onChange={handleInputChange}
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="">Select Branch</option>
//               {branchOptions.map(branch => (
//                 <option key={branch} value={branch}>{branch}</option>
//               ))}
//             </select>
//           </div>

//           <div className="col-span-full">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Counsellor *</label>
//             <input
//               type="text"
//               name="counsellor"
//               value={formData.counsellor}
//               onChange={handleInputChange}
//               required
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           {/* Document Uploads Section */}
//           <div className="col-span-full mt-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Document Uploads</h3>
//           </div>

//           <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {renderFileInput('idProofPhoto', 'ID Proof Photo')}
//             {renderFileInput('studentPhoto', 'Student Photo')}
//             {renderFileInput('studentSignature', 'Student Signature')}
//             {renderFileInput('admissionFrontPage', 'Admission Front Page')}
//             {renderFileInput('admissionBackPage', 'Admission Back Page')}
//             {renderFileInput('paymentReceipt', 'Payment Receipt')}
//             {renderFileInput('studentStatement', 'Student Statement')}
//             {renderFileInput('confidentialForm', 'Confidential Form')}
//           </div>

//           {/* Status & Terms Section */}
//           <div className="col-span-full mt-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Status & Terms</h3>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//             <select
//               name="status"
//               value={formData.status}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               {statusOptions.map(option => (
//                 <option key={option.value} value={option.value}>{option.label}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
//             <input
//               type="text"
//               name="operation"
//               value={formData.operation}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           <div className="col-span-full">
//             <div className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 name="termsCondition"
//                 checked={formData.termsCondition}
//                 onChange={handleInputChange}
//                 className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//               />
//               <label className="text-sm font-medium text-gray-700">
//                 Terms & Conditions Accepted
//               </label>
//             </div>
//           </div>

//           {admission && (
//             <div className="col-span-full">
//               <div className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   name="emailVerified"
//                   checked={formData.emailVerified}
//                   onChange={handleInputChange}
//                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                 />
//                 <label className="text-sm font-medium text-gray-700">
//                   Email Verified
//                 </label>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Form Actions */}
//         <div className="flex justify-end space-x-4 pt-6 border-t">
//           <button
//             type="button"
//             onClick={onClose}
//             disabled={operationLoading}
//             className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={operationLoading}
//             className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 flex items-center space-x-2"
//           >
//             {operationLoading ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                 <span>{admission ? 'Updating...' : 'Creating...'}</span>
//               </>
//             ) : (
//               <span>{admission ? 'Update Admission' : 'Create Admission'}</span>
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AdmissionForm;



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
    counsellor: '',
    admissionFrontPage: '',
    admissionBackPage: '',
    studentStatement: '',
    confidentialForm: '',
    termsCondition: false,
    priority: 'medium',
    appliedBatch: '',
    source: 'website',
    notes: ''
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
        counsellor: admission.counsellor || '',
        admissionFrontPage: admission.admissionFrontPage || '',
        admissionBackPage: admission.admissionBackPage || '',
        studentStatement: admission.studentStatement || '',
        confidentialForm: admission.confidentialForm || '',
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
      
      case 'counsellor':
        if (!value.trim()) {
          newErrors.counsellor = 'Counsellor name is required';
        } else {
          delete newErrors.counsellor;
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

    if (!formData.counsellor.trim()) {
      newErrors.counsellor = 'Counsellor name is required';
    }

    if (!formData.termsCondition) {
      newErrors.termsCondition = 'Terms and conditions must be accepted';
    }

    if (formData.studentStatement && formData.studentStatement.length > 1000) {
      newErrors.studentStatement = 'Student statement must be less than 1000 characters';
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes must be less than 500 characters';
    }

    setErrors(newErrors);
    setTouched({
      student: true,
      course: true,
      trainingBranch: true,
      counsellor: true,
      termsCondition: true,
      studentStatement: true,
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

    const submitData = {
      ...formData,
      trainingBranch: formData.trainingBranch.trim(),
      counsellor: formData.counsellor.trim(),
      studentStatement: formData.studentStatement.trim(),
      notes: formData.notes.trim(),
      appliedBatch: formData.appliedBatch.trim()
    };

    // Clear any previous errors
    dispatch(clearError());

    if (admission) {
      await dispatch(updateAdmission({ admissionId: admission._id, admissionData: submitData }));
    } else {
      await dispatch(createAdmission(submitData));
    }
  };

  const handleReset = () => {
    setFormData({
      student: '',
      course: '',
      trainingBranch: '',
      counsellor: '',
      admissionFrontPage: '',
      admissionBackPage: '',
      studentStatement: '',
      confidentialForm: '',
      termsCondition: false,
      priority: 'medium',
      appliedBatch: '',
      source: 'website',
      notes: ''
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
           formData.counsellor.trim() && 
           formData.termsCondition && 
           Object.keys(errors).length === 0;
  };

  const studentStatementCount = formData.studentStatement.length;
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

          {/* Counsellor */}
          <div>
            <label htmlFor="counsellor" className="block text-sm font-medium text-gray-700 mb-2">
              Counsellor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="counsellor"
              name="counsellor"
              value={formData.counsellor}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.counsellor ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter counsellor name"
              disabled={operationLoading}
            />
            {errors.counsellor && touched.counsellor && (
              <p className="mt-1 text-sm text-red-600">{errors.counsellor}</p>
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

        {/* Document Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admission Front Page */}
          <div>
            <label htmlFor="admissionFrontPage" className="block text-sm font-medium text-gray-700 mb-2">
              Admission Front Page URL
            </label>
            <input
              type="url"
              id="admissionFrontPage"
              name="admissionFrontPage"
              value={formData.admissionFrontPage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/front-page.jpg"
              disabled={operationLoading}
            />
          </div>

          {/* Admission Back Page */}
          <div>
            <label htmlFor="admissionBackPage" className="block text-sm font-medium text-gray-700 mb-2">
              Admission Back Page URL
            </label>
            <input
              type="url"
              id="admissionBackPage"
              name="admissionBackPage"
              value={formData.admissionBackPage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/back-page.jpg"
              disabled={operationLoading}
            />
          </div>
        </div>

        {/* Confidential Form */}
        <div>
          <label htmlFor="confidentialForm" className="block text-sm font-medium text-gray-700 mb-2">
            Confidential Form URL
          </label>
          <input
            type="url"
            id="confidentialForm"
            name="confidentialForm"
            value={formData.confidentialForm}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/confidential-form.pdf"
            disabled={operationLoading}
          />
        </div>

        {/* Student Statement */}
        <div>
          <label htmlFor="studentStatement" className="block text-sm font-medium text-gray-700 mb-2">
            Student Statement
            <span className="text-gray-400 text-xs ml-2">
              {studentStatementCount}/1000 characters
            </span>
          </label>
          <textarea
            id="studentStatement"
            name="studentStatement"
            rows={3}
            value={formData.studentStatement}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.studentStatement ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Student's statement about their interest and goals..."
            disabled={operationLoading}
          />
          {errors.studentStatement && touched.studentStatement && (
            <p className="mt-1 text-sm text-red-600">{errors.studentStatement}</p>
          )}
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${
              studentStatementCount > 1000 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {1000 - studentStatementCount} characters remaining
            </span>
          </div>
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

        {/* Form Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">💡</span>
            <div>
              <h4 className="text-sm font-medium text-blue-800">Admission Guidelines:</h4>
              <ul className="mt-1 text-xs text-blue-700 list-disc list-inside space-y-1">
                <li>Ensure student has completed all prerequisite documentation</li>
                <li>Verify course availability and batch timings</li>
                <li>Confirm all required documents are uploaded</li>
                <li>Set appropriate priority based on student requirements</li>
                <li>Always accept terms and conditions before submission</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef
    </div>
  );
};

<<<<<<< HEAD
export default AdmissionForm;
=======
export default AdmissionForm;
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef
