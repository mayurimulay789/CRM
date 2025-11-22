import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPayment, clearError, clearSuccess } from '../../../store/slices/paymentSlice';
import { fetchEnrollments } from '../../../store/slices/enrollmentSlice';

const PaymentForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { operationLoading, error, success } = useSelector(state => state.payments);
  const { enrollments } = useSelector(state => state.enrollments);
  
  const [formData, setFormData] = useState({
    enrollment: '',
    amountReceived: '',
    feeType: 'tuition',
    paymentMode: 'cash',
    paymentBank: '',
    transactionNo: '',
    receivedBranch: user?.branch || '',
    paymentProof: '',
    chequeDetails: {
      chequeNo: '',
      bankName: '',
      chequeDate: ''
    },
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [isAmountAutoSet, setIsAmountAutoSet] = useState(false);

  useEffect(() => {
    dispatch(fetchEnrollments());
  }, [dispatch]);

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

  useEffect(() => {
    // Set received branch from selected enrollment
    if (formData.enrollment) {
      const enrollment = enrollments.find(e => e._id === formData.enrollment);
      setSelectedEnrollment(enrollment);
      if (enrollment) {
        setFormData(prev => ({
          ...prev,
          receivedBranch: enrollment.trainingBranch || prev.receivedBranch
        }));

        // Auto-set amount for installment payments
        if (enrollment.feeType === 'installment' && enrollment.nextEMI?.amount) {
          setFormData(prev => ({
            ...prev,
            amountReceived: enrollment.nextEMI.amount.toString()
          }));
          setIsAmountAutoSet(true);
        } else {
          setIsAmountAutoSet(false);
        }
      }
    } else {
      setSelectedEnrollment(null);
      setIsAmountAutoSet(false);
    }
  }, [formData.enrollment, enrollments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If amount is manually changed, mark it as not auto-set
    if (name === 'amountReceived' && isAmountAutoSet) {
      setIsAmountAutoSet(false);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleChequeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      chequeDetails: {
        ...prev.chequeDetails,
        [field]: value
      }
    }));
  };

  // Safe EMI data accessor function
  const getNextEMI = (enrollment) => {
    return enrollment.nextEMI || { amount: 0, date: null, status: 'pending' };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.enrollment) newErrors.enrollment = 'Enrollment is required';
    if (!formData.amountReceived || formData.amountReceived <= 0) newErrors.amountReceived = 'Valid amount is required';
    if (!formData.paymentMode) newErrors.paymentMode = 'Payment mode is required';
    if (!formData.receivedBranch) newErrors.receivedBranch = 'Received branch is required';

    if (formData.paymentMode === 'cheque') {
      if (!formData.chequeDetails.chequeNo) newErrors.chequeNo = 'Cheque number is required';
      if (!formData.chequeDetails.bankName) newErrors.bankName = 'Bank name is required';
    }

    if (selectedEnrollment) {
      const pendingAmount = selectedEnrollment.totalAmount - selectedEnrollment.amountReceived;
      if (parseFloat(formData.amountReceived) > pendingAmount) {
        newErrors.amountReceived = `Amount cannot exceed pending amount of ${formatCurrency(pendingAmount)}`;
      }

      // For installment payments, validate against next EMI amount
      if (selectedEnrollment.feeType === 'Installment') {
        const nextEMI = getNextEMI(selectedEnrollment);
        if (parseFloat(formData.amountReceived) !== nextEMI.amount && !isAmountAutoSet) {
          newErrors.amountReceived = `For installment payments, amount should match the next EMI amount of ${formatCurrency(nextEMI.amount)}`;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    dispatch(clearError());

    const submitData = {
      ...formData,
      amountReceived: parseFloat(formData.amountReceived)
    };

    await dispatch(createPayment(submitData));
  };

  // Counsellor can only see their own active enrollments
  const counsellorEnrollments = enrollments.filter(
    enrollment => (enrollment.counsellor?._id === user?._id || enrollment.counsellor === user?._id) && enrollment.status === 'active'
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Record New Payment</h2>
            <button 
              type="button" 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
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
            {/* Enrollment Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enrollment *
              </label>
              <select
                name="enrollment"
                value={formData.enrollment}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.enrollment ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Enrollment</option>
                {counsellorEnrollments.map(enrollment => (
                  <option key={enrollment._id} value={enrollment._id}>
                    {enrollment.enrollmentNo} - {enrollment.student?.name} - {enrollment.course?.name}
                    {enrollment.pendingAmount > 0 && ` (Pending: ${formatCurrency(enrollment.pendingAmount)})`}
                  </option>
                ))}
              </select>
              {errors.enrollment && <p className="text-red-500 text-xs mt-1">{errors.enrollment}</p>}
            </div>

            {selectedEnrollment && (
              <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">Enrollment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">Student:</span>
                    <div className="font-semibold mt-1">{selectedEnrollment.student?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Course:</span>
                    <div className="font-semibold mt-1">{selectedEnrollment.course?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Fee Type:</span>
                    <div className="font-semibold mt-1 capitalize">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedEnrollment.feeType === 'one-time' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {selectedEnrollment.feeType}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Total Fee:</span>
                    <div className="font-semibold mt-1">{formatCurrency(selectedEnrollment.totalAmount)}</div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Amount Received:</span>
                    <div className="font-semibold mt-1 text-green-600">
                      {formatCurrency(selectedEnrollment.amountReceived)}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Pending Amount:</span>
                    <div className="font-semibold mt-1 text-red-600">
                      {formatCurrency(selectedEnrollment.pendingAmount)}
                    </div>
                  </div>
                  
                  {/* Next EMI Details for Installment Payments */}
                  {selectedEnrollment.feeType === 'Installment' && (
                    <>
                      <div>
                        <span className="text-blue-600 font-medium">Next EMI Amount:</span>
                        <div className="font-semibold mt-1">
                          {formatCurrency(getNextEMI(selectedEnrollment).amount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Next EMI Due Date:</span>
                        <div className="font-semibold mt-1">
                          {formatDate(getNextEMI(selectedEnrollment).date)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Received *
                {isAmountAutoSet && (
                  <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Auto-set from Next EMI
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="amountReceived"
                  value={formData.amountReceived}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.amountReceived ? 'border-red-500' : 'border-gray-300'
                  } ${isAmountAutoSet ? 'bg-green-50 border-green-200' : ''}`}
                  placeholder="Enter amount"
                  min="0"
                  step="1"
                />
                {isAmountAutoSet && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-green-500 text-sm">💡</span>
                  </div>
                )}
              </div>
              {errors.amountReceived && <p className="text-red-500 text-xs mt-1">{errors.amountReceived}</p>}
              {selectedEnrollment?.feeType === 'Installment' && !isAmountAutoSet && (
                <p className="text-yellow-600 text-xs mt-1">
                  💡 For installment payments, the amount should match the next EMI amount
                </p>
              )}
            </div>

            {/* Fee Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee Type *
              </label>
              <select
                name="feeType"
                value={formData.feeType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="registration">Registration Fee</option>
                <option value="tuition">Tuition Fee</option>
                <option value="exam">Exam Fee</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Mode *
              </label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.paymentMode ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
                <option value="cheque">Cheque</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
              </select>
              {errors.paymentMode && <p className="text-red-500 text-xs mt-1">{errors.paymentMode}</p>}
            </div>

            {/* Received Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Received Branch *
              </label>
              <input
                type="text"
                name="receivedBranch"
                value={formData.receivedBranch}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.receivedBranch ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter branch"
              />
              {errors.receivedBranch && <p className="text-red-500 text-xs mt-1">{errors.receivedBranch}</p>}
            </div>

            {/* Payment Bank (for card/online/transfer) */}
            {(formData.paymentMode === 'card' || formData.paymentMode === 'online' || formData.paymentMode === 'bank_transfer') && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="paymentBank"
                  value={formData.paymentBank}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter bank name"
                />
              </div>
            )}

            {/* Transaction No (for non-cash payments) */}
            {formData.paymentMode !== 'cash' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.paymentMode === 'cheque' ? 'Cheque No' : 'Transaction/Reference No'}
                  {formData.paymentMode !== 'cheque' && ' *'}
                </label>
                <input
                  type="text"
                  name="transactionNo"
                  value={formData.transactionNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${formData.paymentMode === 'cheque' ? 'cheque' : 'transaction'} number`}
                />
              </div>
            )}
          </div>

          {/* Cheque Details - Show only for cheque payments */}
          {formData.paymentMode === 'cheque' && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cheque Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cheque No *
                  </label>
                  <input
                    type="text"
                    value={formData.chequeDetails.chequeNo}
                    onChange={(e) => handleChequeChange('chequeNo', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.chequeNo ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Cheque number"
                  />
                  {errors.chequeNo && <p className="text-red-500 text-xs mt-1">{errors.chequeNo}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.chequeDetails.bankName}
                    onChange={(e) => handleChequeChange('bankName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.bankName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Bank name"
                  />
                  {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cheque Date
                  </label>
                  <input
                    type="date"
                    value={formData.chequeDetails.chequeDate}
                    onChange={(e) => handleChequeChange('chequeDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional remarks or notes about this payment..."
            />
          </div>

          {/* Important Note */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-600 text-lg">⚠️</span>
              <div>
                <h4 className="font-semibold text-yellow-800">Important Note</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  All payments recorded will be pending admin approval. The amount will be reflected in the enrollment 
                  only after admin approval. Please ensure all details are accurate.
                </p>
                {selectedEnrollment?.feeType === 'Installment' && (
                  <p className="text-yellow-700 text-sm mt-2">
                    <strong>For Installment Payments:</strong> The amount is automatically set to match the next EMI amount. 
                    If you change this amount, it must match the next EMI amount exactly.
                  </p>
                )}
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
            disabled={operationLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 flex items-center space-x-2"
          >
            {operationLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Recording Payment...</span>
              </>
            ) : (
              <span>Record Payment</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;