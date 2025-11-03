const Payment = require('../models/Payment');
const EnrolledStudent = require('../models/EnrolledStudent');

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const paymentData = req.body;
    paymentData.date = new Date();
    
    const payment = new Payment(paymentData);
    await payment.save();
    
    // Update enrolled student's payment details
    await updateStudentPayment(paymentData);
    
    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get payments by admission number
exports.getPaymentsByAdmission = async (req, res) => {
  try {
    const payments = await Payment.find({ admissionNo: req.params.admissionNo }).sort({ date: -1 });
    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to update student payment details
async function updateStudentPayment(paymentData) {
  const student = await EnrolledStudent.findOne({ admissionNo: paymentData.admissionNo });
  
  if (student) {
    student.amountReceived = (student.amountReceived || 0) + paymentData.amountReceived;
    student.pendingAmount = student.totalAmount - student.amountReceived;
    student.lastPaidAmount = paymentData.amountReceived;
    student.lastPaidDate = paymentData.date;
    student.lastPaidMode = paymentData.paymentMode;
    student.lastPaidStatus = paymentData.status;
    student.lastAmountReceivedBy = paymentData.receivedBy;
    
    await student.save();
  }
}