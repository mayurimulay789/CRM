import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPayment, clearError, clearSuccess } from '../../../store/slices/paymentSlice';
import { fetchEnrollments } from '../../../store/slices/enrollmentSlice';
// import { fetchCounsellors } from '../../../store/slices/authSlice';

const PaymentForm = ({ onClose, isCounsellor = false }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { operationLoading, error, success } = useSelector(state => state.payments);
  const { enrollments } = useSelector(state => state.enrollments);
  const { users } = useSelector(state => state.users);
  
  const [formData, setFormData] = useState({
    enrollment: '',
    amountReceived: '',
    feeType: 'tuition',
    paymentMode: 'cash',
    paymentBank: '',
    transactionNo: '',
    receivedBranch: '',
    paymentProof: '',
    chequeDetails: {
      chequeNo: '',
      bankName: '',
      chequeDate: ''
    },
    remarks: '',
    counsellor: '',
    verificationStatus: 'approved', // Admin can directly approve
    verificationNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  useEffect(() => {
    dispatch(fetchEnrollments());
    // dispatch(fetchCounsellors());
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
          receivedBranch: enrollment.trainingBranch || prev.receivedBranch,
          counsellor: enrollment.counsellor?._id || enrollment.counsellor || prev.counsellor
        }));
      }
    }
  }, [formData.enrollment, enrollments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.enrollment) newErrors.enrollment = 'Enrollment is required';
    if (!formData.amountReceived || formData.amountReceived <= 0) newErrors.amountReceived = 'Valid amount is required';
    if (!formData.paymentMode) newErrors.paymentMode = 'Payment mode is required';
    if (!formData.receivedBranch) newErrors.receivedBranch = 'Received branch is required';
    if (!formData.counsellor) newErrors.counsellor = 'Counsellor is required';

    if (formData.paymentMode === 'cheque') {
      if (!formData.chequeDetails.chequeNo) newErrors.chequeNo = 'Cheque number is required';
      if (!formData.chequeDetails.bankName) newErrors.bankName = 'Bank name is required';
    }

    if (selectedEnrollment) {
      const pendingAmount = selectedEnrollment.totalAmount - selectedEnrollment.amountReceived;
      if (parseFloat(formData.amountReceived) > pendingAmount) {
        newErrors.amountReceived = `Amount cannot exceed pending amount of ${pendingAmount}`;
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
      amountReceived: parseFloat(formData.amountReceived),
      // Admin can directly approve payments
      verificationStatus: 'approved',
      verificationNotes: formData.verificationNotes || 'Payment recorded and approved by admin'
    };

    await dispatch(createPayment(submitData));
  };

  // Admin can see all enrollments
  const allEnrollments = enrollments.filter(enrollment => enrollment.status === 'active');

  // Counsellors (filter users with counsellor role)
  const counsellorUsers = users.filter(user => user.role === 'counsellor');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Record Payment - Admin</h2>

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
                {allEnrollments.map(enrollment => (
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
                <h3 className="font-semibold text-blue-800 mb-2">Enrollment Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Student:</span>
                    <div className="font-medium">{selectedEnrollment.student?.name}</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Course:</span>
                    <div className="font-medium">{selectedEnrollment.course?.name}</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Total Fee:</span>
                    <div className="font-medium">{formatCurrency(selectedEnrollment.totalAmount)}</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Pending:</span>
                    <div className="font-medium text-red-600">
                      {formatCurrency(selectedEnrollment.pendingAmount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-600">Counsellor:</span>
                    <div className="font-medium">{selectedEnrollment.counsellor?.name || selectedEnrollment.counsellor}</div>
                  </div>
                  <div>
                    <span className="text-blue-600">Branch:</span>
                    <div className="font-medium">{selectedEnrollment.trainingBranch}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Counsellor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Counsellor *
              </label>
              <select
                name="counsellor"
                value={formData.counsellor}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.counsellor ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Counsellor</option>
                {counsellorUsers.map(counsellor => (
                  <option key={counsellor._id} value={counsellor._id}>
                    {counsellor.name} - {counsellor.email}
                  </option>
                ))}
              </select>
              {errors.counsellor && <p className="text-red-500 text-xs mt-1">{errors.counsellor}</p>}
            </div>

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
              />
              {errors.amountReceived && <p className="text-red-500 text-xs mt-1">{errors.amountReceived}</p>}
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

          {/* Admin Verification Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Notes (Optional)
            </label>
            <textarea
              name="verificationNotes"
              value={formData.verificationNotes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any notes about this payment verification..."
            />
          </div>

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

          {/* Admin Note */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-green-600 text-lg">✅</span>
              <div>
                <h4 className="font-semibold text-green-800">Admin Note</h4>
                <p className="text-green-700 text-sm mt-1">
                  This payment will be automatically approved since it's recorded by an administrator.
                  The amount will be immediately reflected in the enrollment.
                </p>
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
              <span>Record & Approve Payment</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;