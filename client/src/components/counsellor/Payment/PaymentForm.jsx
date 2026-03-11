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
    feeType: 'one-time',
    paymentMode: 'cash',
    paymentBank: '',
    transactionNo: '',
    receivedBranch: user?.branch || '',
    paymentProof: '',
    chequeDetails: {
      chequeNo: '',
      bankName: '',
      chequeDate: '',
    },
    remarks: '',
    installmentNo: ''
  });

  const [errors, setErrors] = useState({});
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  // Fetch enrollments on mount
  useEffect(() => {
    dispatch(fetchEnrollments());
  }, [dispatch]);

  // Close modal on success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  // Clear errors/success on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // Update form when enrollment changes
  useEffect(() => {
    if (formData.enrollment) {
      const enrollment = enrollments.find(e => e._id === formData.enrollment);
      setSelectedEnrollment(enrollment);
      if (enrollment) {
        setFormData(prev => ({
          ...prev,
          feeType: enrollment.feeType || 'one-time',
          receivedBranch: enrollment.trainingBranch || prev.receivedBranch,
          // Auto-fill amount with pending amount for one-time payments
          amountReceived: enrollment.feeType === 'one-time' ? enrollment.pendingAmount : prev.amountReceived
        }));
      }
    } else {
      setSelectedEnrollment(null);
    }
  }, [formData.enrollment, enrollments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleChequeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      chequeDetails: { ...prev.chequeDetails, [field]: value }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.enrollment) newErrors.enrollment = 'Enrollment is required';
    if (!formData.amountReceived || formData.amountReceived <= 0) newErrors.amountReceived = 'Valid amount is required';
    if (!formData.paymentMode) newErrors.paymentMode = 'Payment mode is required';

    if (formData.paymentMode === 'cheque') {
      if (!formData.chequeDetails.chequeNo) newErrors.chequeNo = 'Cheque number is required';
      if (!formData.chequeDetails.bankName) newErrors.bankName = 'Bank name is required';
    }

    if (selectedEnrollment) {
      const pendingAmount = selectedEnrollment.pendingAmount || 0;
      const amount = parseFloat(formData.amountReceived) || 0;

      // ✅ ONE-TIME PAYMENT: Must match pending amount exactly
      if (selectedEnrollment.feeType === 'one-time') {
        if (amount !== pendingAmount) {
          newErrors.amountReceived = `One-time payment must be exactly ${formatCurrency(pendingAmount)}`;
        }
      }

      // ✅ INSTALLMENT PAYMENT: Can be any amount up to pending amount
      if (selectedEnrollment.feeType === 'installment') {
        if (amount > pendingAmount) {
          newErrors.amountReceived = `Amount cannot exceed pending amount of ${formatCurrency(pendingAmount)}`;
        }
        
        if (!formData.installmentNo) {
          newErrors.installmentNo = 'Installment number is required for installment payments';
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
    
    if (!validateForm()) return;

    dispatch(clearError());

    // Prepare data for backend
    const submitData = {
      enrollment: formData.enrollment,
      amountReceived: parseFloat(formData.amountReceived),
      feeType: formData.feeType,
      paymentMode: formData.paymentMode,
      receivedBranch: formData.receivedBranch,
      // Optional fields
      ...(formData.paymentBank && { paymentBank: formData.paymentBank }),
      ...(formData.transactionNo && { transactionNo: formData.transactionNo }),
      ...(formData.paymentProof && { paymentProof: formData.paymentProof }),
      ...(formData.remarks && { remarks: formData.remarks }),
      // Cheque details
      ...(formData.paymentMode === 'cheque' && {
        chequeDetails: {
          chequeNo: formData.chequeDetails.chequeNo,
          bankName: formData.chequeDetails.bankName,
          ...(formData.chequeDetails.chequeDate && { chequeDate: formData.chequeDetails.chequeDate })
        }
      }),
      // Installment number for installment payments
      ...(formData.feeType === 'installment' && formData.installmentNo && { 
        installmentNo: parseInt(formData.installmentNo) 
      })
    };

    console.log('Submitting payment data:', submitData);
    await dispatch(createPayment(submitData));
  };

  // Filter enrollments for counsellor
  const counsellorEnrollments = enrollments.filter(
    enrollment => (enrollment.counsellor?._id === user?._id || enrollment.counsellor === user?._id) 
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
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
                        {selectedEnrollment.feeType === 'one-time' ? 'One Time' : 'Installment'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Total Amount:</span>
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
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Received *
              </label>
              <input
                type="number"
                name="amountReceived"
                value={formData.amountReceived}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.amountReceived ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter amount"
                min="0"
                step="1"
                readOnly={selectedEnrollment?.feeType === 'one-time'} // Make read-only for one-time
              />
              {selectedEnrollment?.feeType === 'one-time' && (
                <p className="text-green-600 text-xs mt-1">
                  Amount auto-filled to pending amount (must pay exactly {formatCurrency(selectedEnrollment.pendingAmount)})
                </p>
              )}
              {errors.amountReceived && <p className="text-red-500 text-xs mt-1">{errors.amountReceived}</p>}
            </div>

            {/* Installment Number - Show only for installment payments */}
            {selectedEnrollment?.feeType === 'installment' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Installment Number *
                </label>
                <select
                  name="installmentNo"
                  value={formData.installmentNo}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.installmentNo ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Installment</option>
                  <option value="1">1st Installment</option>
                  <option value="2">2nd Installment</option>
                  <option value="3">3rd Installment</option>
                  <option value="4">4th Installment</option>
                  <option value="5">5th Installment</option>
                  <option value="6">6th Installment</option>
                </select>
                {errors.installmentNo && <p className="text-red-500 text-xs mt-1">{errors.installmentNo}</p>}
              </div>
            )}

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
                {selectedEnrollment?.feeType === 'one-time' && (
                  <p className="text-yellow-700 text-sm mt-2">
                    <strong>For One-Time Payments:</strong> Amount must be exactly the pending amount. The field is auto-filled and read-only.
                  </p>
                )}
                {selectedEnrollment?.feeType === 'installment' && (
                  <p className="text-yellow-700 text-sm mt-2">
                    <strong>For Installment Payments:</strong> Please select the correct installment number and enter the amount.
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
            className="px-6 py-2 bg-[#890c25] text-white rounded-md hover:bg-[#890c25] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 flex items-center space-x-2"
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