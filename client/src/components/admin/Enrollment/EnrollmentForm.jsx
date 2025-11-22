import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createEnrollment, 
  updateEnrollment, 
  clearError, 
  clearSuccess 
} from '../../../store/slices/enrollmentSlice';
import { fetchAdmissions } from '../../../store/slices/admissionSlice';
import { getBatches } from '../../../store/slices/batchSlice';
import { getCurrentUser } from '../../../store/slices/authSlice';

const EnrollmentForm = ({ enrollment, onClose, isAdmin = true }) => {
  const dispatch = useDispatch();
  const { operationLoading, error, success } = useSelector(state => state.enrollments);
  const { admissions } = useSelector(state => state.admissions);
  const { batches } = useSelector(state => state.batch);
  const { users } = useSelector(state => state.user);
  
  const [formData, setFormData] = useState({
    admission: '',
    batch: '',
    trainingBranch: '',
    mode: 'Offline',
    totalAmount: '',
    discount: 0,
    feeType: 'one-time',
    firstEMI: { amount: 0, date: '', pending: 0 },
    secondEMI: { amount: 0, date: '', pending: 0 },
    thirdEMI: { amount: 0, date: '', pending: 0 },
    dueDate: '',
    charges: 0,
    leadDate: new Date().toISOString().split('T')[0],
    leadSource: 'website',
    call: '',
    status: 'active',
    counsellor: ''
  });

  const [errors, setErrors] = useState({});
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    console.log('Admin Enrollment Form - Loading data...');
    dispatch(fetchAdmissions());
    dispatch(getBatches());
    dispatch(getUsers()); // Get all users for counsellor selection
  }, [dispatch]);

  // Helper function to format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  useEffect(() => {
    if (enrollment) {
      // Format enrollment data for form with proper date handling
      setFormData({
        admission: enrollment.admission?._id || enrollment.admission || '',
        batch: enrollment.batch?._id || enrollment.batch || '',
        trainingBranch: enrollment.trainingBranch || '',
        mode: enrollment.mode || 'Offline',
        totalAmount: enrollment.totalAmount || '',
        discount: enrollment.discount || 0,
        feeType: enrollment.feeType || 'one-time',
        firstEMI: enrollment.firstEMI || { amount: 0, date: '', pending: 0 },
        secondEMI: enrollment.secondEMI || { amount: 0, date: '', pending: 0 },
        thirdEMI: enrollment.thirdEMI || { amount: 0, date: '', pending: 0 },
        dueDate: formatDateForInput(enrollment.dueDate),
        charges: enrollment.charges || 0,
        leadDate: formatDateForInput(enrollment.leadDate) || new Date().toISOString().split('T')[0],
        leadSource: enrollment.leadSource || 'website',
        call: enrollment.call || '',
        status: enrollment.status || 'active',
        counsellor: enrollment.counsellor?._id || enrollment.counsellor || ''
      });
    }
  }, [enrollment]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // Update selected admission when formData.admission changes
  useEffect(() => {
    if (formData.admission) {
      const admission = admissions.find(a => a._id === formData.admission);
      setSelectedAdmission(admission);
      if (admission && !enrollment) {
        // For new enrollments, auto-populate from admission
        setFormData(prev => ({
          ...prev,
          trainingBranch: admission.trainingBranch || prev.trainingBranch,
          counsellor: admission.counsellor?._id || admission.counsellor || prev.counsellor
        }));
      }
    }
  }, [formData.admission, admissions, enrollment]);

  // Get counsellors (users with counsellor role)
  const counsellors = users.filter(user => 
    user.role === 'Counsellor' || user.role === 'counsellor'
  );

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      validateField(name, value);
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEMIChange = (emiIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      [emiIndex]: {
        ...prev[emiIndex],
        [field]: value,
        ...(field === 'amount' && { pending: parseFloat(value) || 0 })
      }
    }));

    if (touched.totalAmount || touched.feeType) {
      validateEMITotals();
    }
  };

  const handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    const totalAmount = parseFloat(formData.totalAmount) || 0;
    
    if (discount > totalAmount) {
      setErrors(prev => ({ ...prev, discount: 'Discount cannot exceed total amount' }));
      return;
    }

    setErrors(prev => ({ ...prev, discount: '' }));
    setFormData(prev => ({
      ...prev,
      discount: discount
    }));
  };

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'admission':
        if (!value) {
          newErrors.admission = 'Admission is required';
        } else {
          delete newErrors.admission;
        }
        break;

      case 'batch':
        if (!value) {
          newErrors.batch = 'Batch is required';
        } else {
          delete newErrors.batch;
        }
        break;

      case 'trainingBranch':
        if (!value || !value.trim()) {
          newErrors.trainingBranch = 'Training branch is required';
        } else if (value.trim().length < 2) {
          newErrors.trainingBranch = 'Training branch must be at least 2 characters long';
        } else {
          delete newErrors.trainingBranch;
        }
        break;

      case 'totalAmount':
        if (!value || value === '') {
          newErrors.totalAmount = 'Total amount is required';
        } else if (parseFloat(value) <= 0) {
          newErrors.totalAmount = 'Total amount must be greater than 0';
        } else if (parseFloat(value) > 1000000) {
          newErrors.totalAmount = 'Total amount cannot exceed ₹10,00,000';
        } else {
          delete newErrors.totalAmount;
          if (formData.feeType === 'installment') {
            validateEMITotals();
          }
          // Validate discount against new total
          if (formData.discount > parseFloat(value)) {
            newErrors.discount = 'Discount cannot exceed total amount';
          }
        }
        break;

      case 'counsellor':
        if (!value) {
          newErrors.counsellor = 'Counsellor is required';
        } else {
          delete newErrors.counsellor;
        }
        break;

      case 'dueDate':
        if (formData.feeType === 'one-time' && !value) {
          newErrors.dueDate = 'Due date is required for one-time payments';
        } else if (value) {
          const dueDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (dueDate < today) {
            newErrors.dueDate = 'Due date cannot be in the past';
          } else {
            delete newErrors.dueDate;
          }
        } else {
          delete newErrors.dueDate;
        }
        break;

      case 'feeType':
        if (value === 'one-time' && !formData.dueDate) {
          newErrors.dueDate = 'Due date is required for one-time payments';
        } else {
          delete newErrors.dueDate;
        }
        validateEMITotals();
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateEMITotals = () => {
    const newErrors = { ...errors };

    if (formData.feeType === 'installment') {
      const totalEMI = parseFloat(formData.firstEMI.amount || 0) + 
                      parseFloat(formData.secondEMI.amount || 0) + 
                      parseFloat(formData.thirdEMI.amount || 0);
      const totalAmount = parseFloat(formData.totalAmount || 0);
      
      if (totalEMI !== totalAmount) {
        newErrors.emiTotal = `EMI total (₹${totalEMI}) must match total amount (₹${totalAmount})`;
      } else {
        delete newErrors.emiTotal;
      }

      // Validate individual EMI dates and amounts
      const emis = [
        { key: 'firstEMI', data: formData.firstEMI, label: 'First EMI' },
        { key: 'secondEMI', data: formData.secondEMI, label: 'Second EMI' },
        { key: 'thirdEMI', data: formData.thirdEMI, label: 'Third EMI' }
      ];

      emis.forEach(emi => {
        if (emi.data.amount > 0) {
          if (!emi.data.date) {
            newErrors[emi.key] = `${emi.label} date is required when amount is set`;
          } else {
            const emiDate = new Date(emi.data.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (emiDate < today) {
              newErrors[emi.key] = `${emi.label} date cannot be in the past`;
            } else {
              delete newErrors[emi.key];
            }
          }
        } else {
          delete newErrors[emi.key];
        }
      });

      // Validate EMI date sequence
      const emiDates = emis
        .filter(emi => emi.data.amount > 0 && emi.data.date)
        .map(emi => new Date(emi.data.date))
        .sort((a, b) => a - b);

      for (let i = 1; i < emiDates.length; i++) {
        if (emiDates[i] <= emiDates[i - 1]) {
          newErrors.emiSequence = 'EMI dates must be in chronological order';
          break;
        } else {
          delete newErrors.emiSequence;
        }
      }
    } else {
      delete newErrors.emiTotal;
      delete newErrors.emiSequence;
      delete newErrors.firstEMI;
      delete newErrors.secondEMI;
      delete newErrors.thirdEMI;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    // Mark all fields as touched to show all errors
    const allFields = ['admission', 'batch', 'trainingBranch', 'totalAmount', 'counsellor'];
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Validate all fields
    const newErrors = {};

    // Required fields validation
    if (!formData.admission) newErrors.admission = 'Admission is required';
    if (!formData.batch) newErrors.batch = 'Batch is required';
    if (!formData.trainingBranch || !formData.trainingBranch.trim()) {
      newErrors.trainingBranch = 'Training branch is required';
    }
    if (!formData.counsellor) newErrors.counsellor = 'Counsellor is required';
    
    // Amount validation
    if (!formData.totalAmount || formData.totalAmount === '') {
      newErrors.totalAmount = 'Total amount is required';
    } else if (parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Total amount must be greater than 0';
    } else if (parseFloat(formData.totalAmount) > 1000000) {
      newErrors.totalAmount = 'Total amount cannot exceed ₹10,00,000';
    }

    // Discount validation
    if (formData.discount > parseFloat(formData.totalAmount || 0)) {
      newErrors.discount = 'Discount cannot exceed total amount';
    }

    // Fee type specific validations
    if (formData.feeType === 'one-time') {
      if (!formData.dueDate) {
        newErrors.dueDate = 'Due date is required for one-time payments';
      } else {
        const dueDate = new Date(formData.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          newErrors.dueDate = 'Due date cannot be in the past';
        }
      }
    } else if (formData.feeType === 'installment') {
      validateEMITotals();
    }

    // Additional charges validation
    if (formData.charges && parseFloat(formData.charges) < 0) {
      newErrors.charges = 'Additional charges cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareSubmitData = () => {
    const baseData = {
      admission: formData.admission,
      batch: formData.batch,
      trainingBranch: formData.trainingBranch.trim(),
      mode: formData.mode,
      totalAmount: parseFloat(formData.totalAmount),
      discount: parseFloat(formData.discount) || 0,
      feeType: formData.feeType,
      charges: parseFloat(formData.charges) || 0,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      leadDate: formData.leadDate ? new Date(formData.leadDate) : new Date(),
      leadSource: formData.leadSource,
      call: formData.call,
      status: formData.status,
      counsellor: formData.counsellor
    };

    // Add EMI data for installment type
    if (formData.feeType === 'installment') {
      baseData.firstEMI = {
        amount: parseFloat(formData.firstEMI.amount) || 0,
        pending: parseFloat(formData.firstEMI.amount) || 0,
        date: formData.firstEMI.date ? new Date(formData.firstEMI.date) : null,
        status: 'pending'
      };
      
      baseData.secondEMI = {
        amount: parseFloat(formData.secondEMI.amount) || 0,
        pending: parseFloat(formData.secondEMI.amount) || 0,
        date: formData.secondEMI.date ? new Date(formData.secondEMI.date) : null,
        status: 'pending'
      };
      
      baseData.thirdEMI = {
        amount: parseFloat(formData.thirdEMI.amount) || 0,
        pending: parseFloat(formData.thirdEMI.amount) || 0,
        date: formData.thirdEMI.date ? new Date(formData.thirdEMI.date) : null,
        status: 'pending'
      };
    } else {
      baseData.firstEMI = { amount: 0, pending: 0, date: null, status: 'pending' };
      baseData.secondEMI = { amount: 0, pending: 0, date: null, status: 'pending' };
      baseData.thirdEMI = { amount: 0, pending: 0, date: null, status: 'pending' };
    }

    return baseData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    dispatch(clearError());

    const submitData = prepareSubmitData();

    try {
      if (enrollment) {
        await dispatch(updateEnrollment({
          enrollmentId: enrollment._id,
          enrollmentData: submitData
        }));
      } else {
        await dispatch(createEnrollment(submitData));
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const getFormTitle = () => {
    if (enrollment) {
      return `Edit Enrollment - ${enrollment.enrollmentNo}`;
    }
    return 'Create New Enrollment - Admin';
  };

  // Counsellor can only see approved admissions
  const approvedAdmissions = admissions.filter(admission => 
    admission.status === 'approved'
  );

  // Active batches
  const activeBatches = batches.filter(batch => 
    batch.status === 'Running' || batch.status === 'Upcoming'
  );

  const totalEMIAmount = parseFloat(formData.firstEMI.amount || 0) + 
                        parseFloat(formData.secondEMI.amount || 0) + 
                        parseFloat(formData.thirdEMI.amount || 0);

  const finalAmount = (parseFloat(formData.totalAmount) || 0) - (parseFloat(formData.discount) || 0);

  // Helper component for required field indicator
  const RequiredStar = () => <span className="text-red-500 ml-1">*</span>;

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">{getFormTitle()}</h2>
            {enrollment && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {enrollment.enrollmentNo}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              ✖
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center space-x-2">
                <span>❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admission Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission <RequiredStar />
              </label>
              <select
                name="admission"
                value={formData.admission}
                onChange={handleChange}
                onBlur={() => handleBlur('admission')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.admission ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!!enrollment}
              >
                <option value="">Select Admission</option>
                {approvedAdmissions.map(admission => (
                  <option key={admission._id} value={admission._id}>
                    {admission.admissionNo} - {admission.student?.name} - {admission.course?.name}
                  </option>
                ))}
              </select>
              {errors.admission && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.admission}
                </p>
              )}
              
              {selectedAdmission && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <div><strong>Student:</strong> {selectedAdmission.student?.name}</div>
                    <div><strong>Course:</strong> {selectedAdmission.course?.name}</div>
                    <div><strong>Course Fee:</strong> ₹{selectedAdmission.course?.fee}</div>
                    <div><strong>Branch:</strong> {selectedAdmission.trainingBranch}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Batch Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch <RequiredStar />
              </label>
              <select
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                onBlur={() => handleBlur('batch')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.batch ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Batch</option>
                {activeBatches.map(batch => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name} - {batch.timing} ({batch.status})
                  </option>
                ))}
              </select>
              {errors.batch && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.batch}
                </p>
              )}
            </div>

            {/* Training Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Branch <RequiredStar />
              </label>
              <input
                type="text"
                name="trainingBranch"
                value={formData.trainingBranch}
                onChange={handleChange}
                onBlur={() => handleBlur('trainingBranch')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.trainingBranch ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter training branch"
              />
              {errors.trainingBranch && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.trainingBranch}
                </p>
              )}
            </div>

            {/* Counsellor Selection - ADMIN ONLY */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Counsellor <RequiredStar />
              </label>
              <select
                name="counsellor"
                value={formData.counsellor}
                onChange={handleChange}
                onBlur={() => handleBlur('counsellor')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.counsellor ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Counsellor</option>
                {counsellors.map(counsellor => (
                  <option key={counsellor._id} value={counsellor._id}>
                    {counsellor.name} - {counsellor.email}
                  </option>
                ))}
              </select>
              {errors.counsellor && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.counsellor}
                </p>
              )}
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Mode
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="dropout">Dropout</option>
                <option value="cancelled">Cancelled</option>
                <option value="notattending">Not Attending</option>
              </select>
            </div>

            {/* Fee Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount <RequiredStar />
              </label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                onBlur={() => handleBlur('totalAmount')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.totalAmount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter total amount"
                min="0"
                step="1"
              />
              {errors.totalAmount && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.totalAmount}
                </p>
              )}
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleDiscountChange}
                onBlur={() => handleBlur('discount')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.discount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter discount amount"
                min="0"
                step="1"
                max={formData.totalAmount}
              />
              {errors.discount && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.discount}
                </p>
              )}
              {formData.totalAmount && (
                <p className="text-xs text-gray-500 mt-1">
                  Final Amount: ₹{finalAmount}
                </p>
              )}
            </div>

            {/* Fee Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee Type
              </label>
              <select
                name="feeType"
                value={formData.feeType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="one-time">One Time Payment</option>
                <option value="installment">Installment</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date {formData.feeType === 'one-time' && <RequiredStar />}
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                onBlur={() => handleBlur('dueDate')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠</span>
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>

          {/* Additional Charges */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Charges
            </label>
            <input
              type="number"
              name="charges"
              value={formData.charges}
              onChange={handleChange}
              onBlur={() => handleBlur('charges')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.charges ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter additional charges"
              min="0"
              step="1"
            />
            {errors.charges && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <span className="mr-1">⚠</span>
                {errors.charges}
              </p>
            )}
          </div>

          {/* EMI Details - Show only for installment */}
          {formData.feeType === 'installment' && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">EMI Details</h3>
              
              {(errors.emiTotal || errors.emiSequence) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <div className="flex items-center space-x-2">
                    <span>⚠</span>
                    <span>{errors.emiTotal || errors.emiSequence}</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'firstEMI', label: 'First EMI' },
                  { key: 'secondEMI', label: 'Second EMI' },
                  { key: 'thirdEMI', label: 'Third EMI' }
                ].map((emi, index) => (
                  <div key={emi.key} className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-700 mb-3">{emi.label}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Amount {formData[emi.key].amount > 0 && <RequiredStar />}
                        </label>
                        <input
                          type="number"
                          value={formData[emi.key].amount}
                          onChange={(e) => handleEMIChange(emi.key, 'amount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Amount"
                          min="0"
                          step="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Due Date {formData[emi.key].amount > 0 && <RequiredStar />}
                        </label>
                        <input
                          type="date"
                          value={formData[emi.key].date}
                          onChange={(e) => handleEMIChange(emi.key, 'date', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[emi.key] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[emi.key] && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <span className="mr-1">⚠</span>
                            {errors[emi.key]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={`mt-4 p-3 rounded-lg ${
                totalEMIAmount === parseFloat(formData.totalAmount || 0) 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              }`}>
                <div className="text-sm">
                  <strong>EMI Summary:</strong> Total EMI Amount: ₹{totalEMIAmount} | 
                  Course Amount: ₹{formData.totalAmount} | 
                  {totalEMIAmount === parseFloat(formData.totalAmount || 0) ? (
                    <span className="text-green-600"> ✓ Amounts match</span>
                  ) : (
                    <span className="text-yellow-600"> ⚠ Amounts don't match</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Source
                </label>
                <select
                  name="leadSource"
                  value={formData.leadSource}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="website">Website</option>
                  <option value="walkin">Walk-in</option>
                  <option value="referral">Referral</option>
                  <option value="counsellor">Counsellor</option>
                  <option value="social_media">Social Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Date
                </label>
                <input
                  type="date"
                  name="leadDate"
                  value={formData.leadDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call/Contact Notes
                </label>
                <textarea
                  name="call"
                  value={formData.call}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any notes from calls or contact with the student..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
            disabled={operationLoading || Object.keys(errors).length > 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 flex items-center space-x-2"
          >
            {operationLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{enrollment ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{enrollment ? 'Update Enrollment' : 'Create Enrollment'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnrollmentForm;