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

const EnrollmentForm = ({ enrollment, onClose, counsellorId = null }) => {
  const dispatch = useDispatch();
  const { operationLoading, error, success } = useSelector(state => state.enrollments);
  const { admissions } = useSelector(state => state.admissions);
  const { batches } = useSelector(state => state.batch);

  const [formData, setFormData] = useState({
    admission: '',
    batch: '',
    mode: 'Offline',
    totalAmount: '',
    feeType: 'one-time',
    dueDate: '',
    installments: [],
    leadDate: new Date().toISOString().split('T')[0],
    leadSource: 'website',
    call: '',
    admissionRegistrationPayment: 0
  });

  const [errors, setErrors] = useState({});
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    dispatch(fetchAdmissions());
    dispatch(getBatches());
  }, [dispatch]);

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Load enrollment data for editing
  useEffect(() => {
    if (enrollment) {
      setFormData({
        admission: enrollment.admission?._id || enrollment.admission || '',
        batch: enrollment.batch?._id || enrollment.batch || '',
        mode: enrollment.mode || 'Offline',
        totalAmount: enrollment.totalAmount || '',
        feeType: enrollment.feeType || 'one-time',
        dueDate: formatDateForInput(enrollment.dueDate) || '',
        installments: enrollment.installments || [],
        leadDate: formatDateForInput(enrollment.leadDate) || new Date().toISOString().split('T')[0],
        leadSource: enrollment.leadSource || 'website',
        call: enrollment.call || '',
        admissionRegistrationPayment: enrollment.admissionRegistrationPayment || 0
      });
    }
  }, [enrollment]);

  // Auto-close on success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(onClose, 1000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  // Cleanup
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // Update selected admission
  useEffect(() => {
    if (formData.admission) {
      const admission = admissions.find(a => a._id === formData.admission);
      setSelectedAdmission(admission);
    }
  }, [formData.admission, admissions]);

  // Handle installment changes
  const handleInstallmentChange = (index, field, value) => {
    const updatedInstallments = [...formData.installments];
    updatedInstallments[index] = {
      ...updatedInstallments[index],
      [field]: field === 'amount' ? parseFloat(value) || 0 : value
    };

    setFormData(prev => ({
      ...prev,
      installments: updatedInstallments
    }));

    // Validate totals
    if (touched.totalAmount) {
      validateInstallmentsTotal(updatedInstallments);
    }
  };

  // Add new installment
  const addInstallment = () => {
    const newInstallment = {
      installmentNumber: formData.installments.length + 1,
      amount: 0,
      dueDate: ''
    };

    setFormData(prev => ({
      ...prev,
      installments: [...prev.installments, newInstallment]
    }));
  };

  // Remove installment
  const removeInstallment = (index) => {
    const updatedInstallments = formData.installments.filter((_, i) => i !== index);

    // Re-number installments
    const renumberedInstallments = updatedInstallments.map((inst, idx) => ({
      ...inst,
      installmentNumber: idx + 1
    }));

    setFormData(prev => ({
      ...prev,
      installments: renumberedInstallments
    }));
  };

  // Validate installments total
  const validateInstallmentsTotal = (installments = formData.installments) => {
    const totalInstallmentAmount = installments.reduce((sum, inst) => sum + (inst.amount || 0), 0);
    const expectedTotal = (parseFloat(formData.totalAmount) || 0) - (parseFloat(formData.admissionRegistrationPayment) || 0);

    if (Math.abs(totalInstallmentAmount - expectedTotal) > 0.01) {
      setErrors(prev => ({
        ...prev,
        installments: `Total installments (₹${totalInstallmentAmount}) must equal course fee (₹${expectedTotal})`
      }));
    } else {
      const { installments, ...rest } = errors;
      setErrors(rest);
    }
  };

  // Validate field
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'admission':
        if (!value) newErrors.admission = 'Admission is required';
        else delete newErrors.admission;
        break;

      case 'batch':
        if (!value) newErrors.batch = 'Batch is required';
        else delete newErrors.batch;
        break;

      case 'totalAmount':
        if (!value) newErrors.totalAmount = 'Total amount is required';
        else if (parseFloat(value) <= 0) newErrors.totalAmount = 'Amount must be greater than 0';
        else if (parseFloat(value) > 1000000) newErrors.totalAmount = 'Amount cannot exceed ₹10,00,000';
        else {
          delete newErrors.totalAmount;
          if (formData.feeType === 'installment') {
            validateInstallmentsTotal();
          }
        }
        break;

      case 'dueDate':
        if (formData.feeType === 'installment' && !value) {
          newErrors.dueDate = 'Due date is required for installment';
        } else if (value) {
          const dueDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (dueDate < today) newErrors.dueDate = 'Due date cannot be in the past';
          else delete newErrors.dueDate;
        } else {
          delete newErrors.dueDate;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) validateField(name, value);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.admission) newErrors.admission = 'Admission is required';
    if (!formData.batch) newErrors.batch = 'Batch is required';

    if (!formData.totalAmount) {
      newErrors.totalAmount = 'Total amount is required';
    } else if (parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Amount must be greater than 0';
    }

    if (formData.feeType === 'installment') {
      if (!formData.dueDate) {
        newErrors.dueDate = 'Due date is required for installment';
      } else {
        const dueDate = new Date(formData.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dueDate < today) newErrors.dueDate = 'Due date cannot be in the past';
      }

      if (formData.installments.length === 0) {
        newErrors.installments = 'At least one installment is required';
      } else {
        const totalInstallmentAmount = formData.installments.reduce((sum, inst) => sum + (inst.amount || 0), 0);
        const expectedTotal = parseFloat(formData.totalAmount) - (parseFloat(formData.admissionRegistrationPayment) || 0);

        if (Math.abs(totalInstallmentAmount - expectedTotal) > 0.01) {
          newErrors.installments = `Installments total (₹${totalInstallmentAmount}) must equal ₹${expectedTotal}`;
        }

        // Validate each installment
        formData.installments.forEach((inst, idx) => {
          if (!inst.amount || inst.amount <= 0) {
            newErrors[`installment_${idx}_amount`] = 'Amount required';
          }
          if (!inst.dueDate) {
            newErrors[`installment_${idx}_date`] = 'Due date required';
          }
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareSubmitData = () => {
    const submitData = {
      admission: formData.admission,
      batch: formData.batch,
      mode: formData.mode,
      totalAmount: parseFloat(formData.totalAmount),
      feeType: formData.feeType,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      leadDate: formData.leadDate ? new Date(formData.leadDate) : new Date(),
      leadSource: formData.leadSource,
      call: formData.call,
      admissionRegistrationPayment: parseFloat(formData.admissionRegistrationPayment) || 0
    };

    // Add installments only for installment type
    if (formData.feeType === 'installment') {
      submitData.installments = formData.installments.map(inst => ({
        installmentNumber: inst.installmentNumber,
        amount: parseFloat(inst.amount) || 0,
        dueDate: new Date(inst.dueDate)
      }));
    }

    // Add counsellor for new enrollments
    if (!enrollment && counsellorId) {
      submitData.counsellor = counsellorId;
    }

    return submitData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

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

  // Get approved admissions
  const approvedAdmissions = admissions.filter(a => a.status === 'approved');

  // Get active batches
  const activeBatches = batches.filter(b =>
    b.status === 'Running' || b.status === 'Upcoming'
  );

  const RequiredStar = () => <span className="text-red-500 ml-1">*</span>;

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-lg border p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              {enrollment ? `Edit Enrollment - ${enrollment.enrollmentNo}` : 'New Enrollment'}
            </h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
              ❌ {error}
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Admission */}
            <div>
              <label className="block text-sm font-medium mb-1">Admission <RequiredStar /></label>
              <select
                name="admission"
                value={formData.admission}
                onChange={handleChange}
                onBlur={() => handleBlur('admission')}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.admission ? 'border-red-500' : 'border-gray-300'}`}
                disabled={!!enrollment}
              >
                <option value="">Select Admission</option>
                {approvedAdmissions.map(ad => (
                  <option key={ad._id} value={ad._id}>
                    {ad.admissionNo} - {ad.student?.name} - {ad.course?.name}
                  </option>
                ))}
              </select>
              {errors.admission && <p className="text-red-500 text-xs mt-1">{errors.admission}</p>}

              {selectedAdmission && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                  <div><strong>Student:</strong> {selectedAdmission.student?.name}</div>
                  <div><strong>Course:</strong> {selectedAdmission.course?.name}</div>
                  <div><strong>Course Fee:</strong> ₹{selectedAdmission.course?.fee}</div>
                </div>
              )}
            </div>

            {/* Batch */}
            <div>
              <label className="block text-sm font-medium mb-1">Batch <RequiredStar /></label>
              <select
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                onBlur={() => handleBlur('batch')}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.batch ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Batch</option>
                {activeBatches.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.name} - {b.timing} ({b.status})
                  </option>
                ))}
              </select>
              {errors.batch && <p className="text-red-500 text-xs mt-1">{errors.batch}</p>}
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-medium mb-1">Training Mode</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium mb-1">Total Amount <RequiredStar /></label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                onBlur={() => handleBlur('totalAmount')}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.totalAmount ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter total amount"
                min="0"
              />
              {errors.totalAmount && <p className="text-red-500 text-xs mt-1">{errors.totalAmount}</p>}
            </div>

            {/* Fee Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Fee Type</label>
              <select
                name="feeType"
                value={formData.feeType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="one-time">One Time Payment</option>
                <option value="installment">Installment</option>
              </select>
            </div>

            {/* Admission Registration Payment */}
            <div>
              <label className="block text-sm font-medium mb-1">Registration Payment</label>
              <input
                type="number"
                name="admissionRegistrationPayment"
                value={formData.admissionRegistrationPayment}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Amount paid at registration"
                min="0"
              />
            </div>

            {/* Due Date - for installment */}
            {formData.feeType === 'installment' && (
              <div>
                <label className="block text-sm font-medium mb-1">Due Date <RequiredStar /></label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  onBlur={() => handleBlur('dueDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
              </div>
            )}
          </div>

          {/* Installments Section */}
          {formData.feeType === 'installment' && (
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Installment Details</h3>
                <button
                  type="button"
                  onClick={addInstallment}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  + Add Installment
                </button>
              </div>

              {errors.installments && (
                <p className="text-red-500 text-xs mb-2">{errors.installments}</p>
              )}

              {/* Installment Table */}
              {formData.installments.length > 0 ? (
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Amount (₹)</th>
                        <th className="px-3 py-2 text-left">Due Date</th>
                        <th className="px-3 py-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {formData.installments.map((inst, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={inst.amount}
                              onChange={(e) => handleInstallmentChange(idx, 'amount', e.target.value)}
                              className="w-24 px-2 py-1 border rounded text-sm"
                              min="0"
                              placeholder="Amount"
                            />
                            {errors[`installment_${idx}_amount`] && (
                              <p className="text-red-500 text-xs">{errors[`installment_${idx}_amount`]}</p>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="date"
                              value={formatDateForInput(inst.dueDate)}
                              onChange={(e) => handleInstallmentChange(idx, 'dueDate', e.target.value)}
                              className="px-2 py-1 border rounded text-sm"
                              min={new Date().toISOString().split('T')[0]}
                            />
                            {errors[`installment_${idx}_date`] && (
                              <p className="text-red-500 text-xs">{errors[`installment_${idx}_date`]}</p>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeInstallment(idx)}
                              className="text-red-600 hover:text-red-800 text-xs"
                              disabled={formData.installments.length === 1}
                            >
                              ✖ Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="4" className="px-3 py-2 text-sm">
                          <strong>Total: </strong>
                          ₹{formData.installments.reduce((sum, i) => sum + (i.amount || 0), 0)}
                          {' '}/ ₹{(parseFloat(formData.totalAmount) - (parseFloat(formData.admissionRegistrationPayment) || 0)) || 0}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No installments added. Click "Add Installment" to add.</p>
              )}
            </div>
          )}

          {/* Additional Information */}
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-3">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Lead Source</label>
                <select
                  name="leadSource"
                  value={formData.leadSource}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                <label className="block text-sm font-medium mb-1">Lead Date</label>
                <input
                  type="date"
                  name="leadDate"
                  value={formData.leadDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}  // ✅ Today max date
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Call/Contact Notes</label>
                <textarea
                  name="call"
                  value={formData.call}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Any notes from calls or contact with the student..."
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {(formData.totalAmount || formData.admissionRegistrationPayment) && (
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
              <strong>Payment Summary:</strong><br />
              Total Amount: ₹{parseFloat(formData.totalAmount || 0)}<br />
              Registration Paid: ₹{parseFloat(formData.admissionRegistrationPayment || 0)}<br />
              <strong>Balance to Pay: ₹{parseFloat(formData.totalAmount || 0) - parseFloat(formData.admissionRegistrationPayment || 0)}</strong>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={operationLoading}
              className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={operationLoading || Object.keys(errors).length > 0}
              className="px-4 py-2 bg-[#890c25] text-white rounded text-sm hover:bg-[#6a091d] disabled:opacity-50 flex items-center gap-2"
            >
              {operationLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>{enrollment ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{enrollment ? 'Update Enrollment' : 'Create Enrollment'}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EnrollmentForm;