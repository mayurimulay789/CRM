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

const EnrollmentForm = ({ enrollment, onClose, isCounsellor = true, counsellorId = null }) => {
  const dispatch = useDispatch();
  const { operationLoading, error, success } = useSelector(state => state.enrollments);
  const { admissions } = useSelector(state => state.admissions);
  const { batches } = useSelector(state => state.batch);
  
  const [formData, setFormData] = useState({
    admission: '',
    batch: '',
    mode: 'Offline',
    actualAmount: '',
    totalAmount: '',
    feeType: 'one-time',
    firstEMI: { amount: 0, date: '', pending: 0 },
    secondEMI: { amount: 0, date: '', pending: 0 },
    thirdEMI: { amount: 0, date: '', pending: 0 },
    // charges removed
    leadDate: new Date().toISOString().split('T')[0],
    leadSource: 'website',
    call: '',
    status: 'active',
    admissionRegistrationPayment: 0
  });

  const [errors, setErrors] = useState({});
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    console.log('isCounsellor:', isCounsellor);
    console.log('enrollment:', enrollment);
    dispatch(fetchAdmissions());
    dispatch(getBatches());
  }, [dispatch]);

  // Helper function to format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
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
        mode: enrollment.mode || 'Offline',
        totalAmount: enrollment.totalAmount || '',
        actualAmount: enrollment.actualAmount || enrollment.totalAmount || '',
        feeType: enrollment.feeType || 'one-time',
        firstEMI: enrollment.firstEMI || { amount: 0, date: '', pending: 0 },
        secondEMI: enrollment.secondEMI || { amount: 0, date: '', pending: 0 },
        thirdEMI: enrollment.thirdEMI || { amount: 0, date: '', pending: 0 },
        // charges removed
        leadDate: formatDateForInput(enrollment.leadDate) || new Date().toISOString().split('T')[0],
        leadSource: enrollment.leadSource || 'website',
        call: enrollment.call || '',
        status: enrollment.status || 'active',
        admissionRegistrationPayment: enrollment.admissionRegistrationPayment || 0
      });
              // ...existing code...
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
        // Removed auto-populate trainingBranch
      }
    }
  }, [formData.admission, admissions, enrollment]);

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

    // Validate field immediately after change if it's been touched before
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
        // For amount changes, update pending amount
        ...(field === 'amount' && { pending: parseFloat(value) || 0 })
      }
    }));

    // Validate EMI totals if any EMI field is changed
    if (touched.totalAmount || touched.feeType) {
      validateEMITotals();
    }
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
      case 'totalAmount':
        if (!value || value === '') {
          newErrors.totalAmount = 'Total amount is required';
        } else if (parseFloat(value) <= 0) {
          newErrors.totalAmount = 'Total amount must be greater than 0';
        } else if (parseFloat(value) > 1000000) {
          newErrors.totalAmount = 'Total amount cannot exceed ₹10,00,000';
        } else {
          delete newErrors.totalAmount;
        }
        break;
      case 'dueDate':
        if (formData.feeType === 'installment' && !value) {
          newErrors.dueDate = 'Due date is required for installment payments';
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
        // Revalidate related fields when fee type changes
        if (value === 'installment' && !formData.dueDate) {
          newErrors.dueDate = 'Due date is required for installment payments';
        } else {
          delete newErrors.dueDate;
        }
        // EMI validation removed
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateEMITotals = () => {
    // EMI validation removed
  };

  const validateForm = () => {
    // Mark all fields as touched to show all errors
    const allFields = ['admission', 'batch', 'totalAmount'];
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
    
    // Amount validation
    if (!formData.totalAmount || formData.totalAmount === '') {
      newErrors.totalAmount = 'Total amount is required';
    } else if (parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Total amount must be greater than 0';
    } else if (parseFloat(formData.totalAmount) > 1000000) {
      newErrors.totalAmount = 'Total amount cannot exceed ₹10,00,000';
    }

    // Fee type specific validations
    if (formData.feeType === 'installment') {
      if (!formData.dueDate) {
        newErrors.dueDate = 'Due date is required for installment payments';
      } else {
        const dueDate = new Date(formData.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          newErrors.dueDate = 'Due date cannot be in the past';
        }
      }
    }
    // EMI validation removed for installment

    // charges validation removed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareSubmitData = () => {
    const baseData = {
      admission: formData.admission,
      batch: formData.batch,
      mode: formData.mode,
      totalAmount: parseFloat(formData.totalAmount),
      actualAmount:
        formData.feeType === 'installment'
          ? parseFloat(formData.totalAmount || 0) - parseFloat(formData.admissionRegistrationPayment || 0)
          : formData.actualAmount
            ? parseFloat(formData.actualAmount)
            : parseFloat(formData.totalAmount),
      feeType: formData.feeType,
      // charges removed
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      leadDate: formData.leadDate ? new Date(formData.leadDate) : new Date(),
      leadSource: formData.leadSource,
      call: formData.call,
      status: formData.status,
      admissionRegistrationPayment: parseFloat(formData.admissionRegistrationPayment) || 0
    };

    // Add counsellor for new enrollments
    if (!enrollment && counsellorId) {
      baseData.counsellor = counsellorId;
    }

    // Remove EMI data for installment type
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
    return 'Create New Enrollment';
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

  // Calculate actual total for EMI comparison
  const actualTotalForEMI = parseFloat(formData.totalAmount || 0) -
                           parseFloat(formData.admissionRegistrationPayment || 0);

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

            {/* Removed Training Branch field */}

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

            {/* Status (for editing) */}
            {enrollment && (
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
                </select>
              </div>
            )}

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

            {/* Due Date field for installment payments */}
            {formData.feeType === 'installment' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date <RequiredStar />
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate || ''}
                  onChange={handleChange}
                  onBlur={() => handleBlur('dueDate')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dueDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <span className="mr-1">⚠</span>
                    {errors.dueDate}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Admission Registration Payment */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">

              Admission Registration Payment
            </label>
            <input
              type="number"
              name="admissionRegistrationPayment"
              value={formData.admissionRegistrationPayment}
              onChange={handleChange}
              onBlur={() => handleBlur('admissionRegistrationPayment')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.admissionRegistrationPayment ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter admission registration payment"
              min="0"
              step="1"
            />
            {errors.admissionRegistrationPayment && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <span className="mr-1">⚠</span>
                {errors.admissionRegistrationPayment}
              </p>
            )}
          </div>

          {/* EMI Details - Show only for installment */}
          {/* EMI Details removed for installment fee type */}

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
            className="px-6 py-2 bg-[#890c25] text-white rounded-md hover:bg-[#890c25] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 flex items-center space-x-2"
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