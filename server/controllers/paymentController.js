const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const sendMail = require('../utils/email');

// @desc    Validate payment amount against enrollment fee structure - STRICT VERSION
const validatePaymentAmountStrict = async (enrollment, amountReceived, feeType, emiNumber) => {
  // For one-time fee: STRICTLY require single full payment
  if (enrollment.feeType === 'one-time') {
    const totalPending = enrollment.totalAmount - enrollment.amountReceived;
    
    // If ANY payment already exists, block new payments
    if (enrollment.amountReceived > 0) {
      return 'One-time fee already has payments. Cannot add more payments.';
    }
    
    // Require full amount in single payment
    if (amountReceived !== enrollment.totalAmount) {
      return `One-time fee requires single full payment of ₹${enrollment.totalAmount}`;
    }
    
    return null; // Validation passed
  }

  // For installment fee: Require EXACT EMI amount and tracking
  if (enrollment.feeType === 'installment') {
    if (!emiNumber) {
      return 'EMI number is required for installment payments';
    }

    const emiField = `${emiNumber}EMI`; // firstEMI, secondEMI, thirdEMI
    const emi = enrollment[emiField];
    
    if (!emi) {
      return `Invalid EMI number: ${emiNumber}`;
    }

    // Check if EMI is already paid
    if (emi.pending <= 0) {
      return `EMI ${emiNumber} is already paid`;
    }

    // STRICT: Require exact EMI amount
    if (amountReceived !== emi.amount) {
      return `EMI ${emiNumber} requires exact payment of ₹${emi.amount}`;
    }

    return null; // Validation passed
  }

  return 'Invalid fee type';
};

/**
 * Send payment confirmation email to student and BCC
 */
async function sendPaymentConfirmationEmail(payment) {
  try {
    // Populate payment with necessary data
    await payment.populate([
      { path: 'student', select: 'studentId name email phone' },
      { path: 'enrollment', select: 'enrollmentNo courseName totalAmount amountReceived feeType firstEMI secondEMI thirdEMI' },
      { path: 'receivedBy', select: 'name email' }
    ]);

    const { student, enrollment } = payment;
    
    if (!student || !student.email) {
      console.error('❌ Student email not found for payment:', payment.paymentNo);
      return false;
    }

    let subject, html;

    // Different email templates based on fee type
    if (enrollment.feeType === 'one-time') {
      ({ subject, html } = generateOneTimePaymentEmail(payment, student, enrollment));
    } else if (enrollment.feeType === 'installment') {
      ({ subject, html } = generateInstallmentPaymentEmail(payment, student, enrollment));
    } else {
      ({ subject, html } = generateGenericPaymentEmail(payment, student, enrollment));
    }

    // Send email to student with BCC
    await sendMail(student.email, subject, html, true);
    
    console.log(`✅ Payment confirmation email sent to ${student.email} with BCC`);
    return true;

  } catch (error) {
    console.error('❌ Failed to send payment confirmation email:', error.message);
    return false;
  }
}

/**
 * Generate email for one-time payment
 */
function generateOneTimePaymentEmail(payment, student, enrollment) {
  const subject = `🎉 Payment Confirmed - Full Fee Received | ${payment.paymentNo}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .congrats {
          text-align: center;
          margin-bottom: 30px;
        }
        .congrats h2 {
          color: #28a745;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .payment-details {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .detail-label {
          font-weight: 600;
          color: #495057;
        }
        .detail-value {
          color: #212529;
          text-align: right;
        }
        .completion-badge {
          background-color: #28a745;
          color: white;
          padding: 10px 20px;
          border-radius: 20px;
          text-align: center;
          margin: 20px 0;
          font-weight: 600;
        }
        .next-steps {
          background-color: #e7f3ff;
          border-left: 4px solid #007bff;
          padding: 15px 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f8f9fa;
          color: #6c757d;
          font-size: 14px;
        }
        .amount-highlight {
          font-size: 24px;
          font-weight: bold;
          color: #28a745;
          text-align: center;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💳 Payment Confirmed</h1>
        </div>
        
        <div class="content">
          <div class="congrats">
            <h2>Payment Successful! 🎉</h2>
            <p>Dear ${student.name}, your full course fee has been received successfully.</p>
          </div>

          <div class="completion-badge">
            ✅ Full Fee Paid - No Pending Amount
          </div>

          <div class="amount-highlight">
            ₹${payment.amountReceived}
          </div>

          <div class="payment-details">
            <div class="detail-row">
              <span class="detail-label">Student Name:</span>
              <span class="detail-value">${student.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Student ID:</span>
              <span class="detail-value">${student.studentId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment No:</span>
              <span class="detail-value">${payment.paymentNo}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Enrollment No:</span>
              <span class="detail-value">${enrollment.enrollmentNo}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Date:</span>
              <span class="detail-value">${new Date(payment.date).toLocaleDateString('en-IN')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Mode:</span>
              <span class="detail-value">${payment.paymentMode}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transaction No:</span>
              <span class="detail-value">${payment.transactionNo || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Course Fee:</span>
              <span class="detail-value">₹${enrollment.totalAmount}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Received:</span>
              <span class="detail-value">₹${payment.amountReceived}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Pending Amount:</span>
              <span class="detail-value" style="color: #28a745; font-weight: bold;">₹0</span>
            </div>
          </div>

          <div class="next-steps">
            <h3>📋 What's Next?</h3>
            <ul>
              <li>Your admission process is now complete</li>
              <li>You will receive course access details shortly</li>
              <li>Keep your payment receipt for future reference</li>
              <li>Contact your counsellor for any queries</li>
            </ul>
          </div>

          <p style="text-align: center; color: #6c757d; font-style: italic;">
            Thank you for choosing us! We look forward to helping you achieve your goals. 🚀
          </p>
        </div>

        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} Your Institution Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

/**
 * Generate email for installment payment
 */
function generateInstallmentPaymentEmail(payment, student, enrollment) {
  const emiNumberMap = {
    'first': '1st',
    'second': '2nd', 
    'third': '3rd'
  };
  
  const currentEMI = emiNumberMap[payment.emiNumber] || payment.emiNumber;
  const subject = `✅ ${currentEMI} Installment Received | ${payment.paymentNo}`;
  
  // Calculate remaining installments
  const remainingEMIs = calculateRemainingEMIs(enrollment, payment.emiNumber);
  const isFinalEMI = remainingEMIs === 0;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Installment Payment Confirmation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .congrats {
          text-align: center;
          margin-bottom: 30px;
        }
        .congrats h2 {
          color: #ee5a24;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .payment-details {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .detail-label {
          font-weight: 600;
          color: #495057;
        }
        .detail-value {
          color: #212529;
          text-align: right;
        }
        .progress-container {
          background-color: #e9ecef;
          border-radius: 10px;
          height: 20px;
          margin: 20px 0;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          border-radius: 10px;
          transition: width 0.3s ease;
        }
        .emi-status {
          display: flex;
          justify-content: space-between;
          margin: 15px 0;
        }
        .emi-pill {
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .emi-paid {
          background-color: #28a745;
          color: white;
        }
        .emi-pending {
          background-color: #6c757d;
          color: white;
        }
        .amount-highlight {
          font-size: 24px;
          font-weight: bold;
          color: #ee5a24;
          text-align: center;
          margin: 15px 0;
        }
        .completion-message {
          background-color: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 5px;
          text-align: center;
          margin: 20px 0;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f8f9fa;
          color: #6c757d;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Installment Payment</h1>
        </div>
        
        <div class="content">
          <div class="congrats">
            <h2>${currentEMI} Installment Received! ✅</h2>
            <p>Dear ${student.name}, your ${currentEMI.toLowerCase()} installment has been processed successfully.</p>
          </div>

          <div class="amount-highlight">
            ₹${payment.amountReceived}
          </div>

          <div class="payment-details">
            <div class="detail-row">
              <span class="detail-label">Student Name:</span>
              <span class="detail-value">${student.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment No:</span>
              <span class="detail-value">${payment.paymentNo}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Installment:</span>
              <span class="detail-value">${currentEMI} EMI</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Date:</span>
              <span class="detail-value">${new Date(payment.date).toLocaleDateString('en-IN')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Mode:</span>
              <span class="detail-value">${payment.paymentMode}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Course Fee:</span>
              <span class="detail-value">₹${enrollment.totalAmount}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Paid:</span>
              <span class="detail-value">₹${enrollment.amountReceived}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Pending Amount:</span>
              <span class="detail-value">₹${enrollment.pendingAmount}</span>
            </div>
          </div>

          <!-- EMI Progress -->
          <h3 style="text-align: center; margin-bottom: 10px;">Payment Progress</h3>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${(enrollment.amountReceived / enrollment.totalAmount) * 100}%"></div>
          </div>
          
          <div class="emi-status">
            ${generateEMIStatusPills(enrollment)}
          </div>

          ${isFinalEMI ? `
            <div class="completion-message">
              🎉 Congratulations! You have successfully paid all installments. Your course fee is now complete!
            </div>
          ` : `
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h3>📅 Next Installment</h3>
              <p>You have ${remainingEMIs} installment${remainingEMIs > 1 ? 's' : ''} remaining. The next installment is due as per your payment schedule.</p>
            </div>
          `}

          <p style="text-align: center; color: #6c757d; font-style: italic;">
            Thank you for your timely payment! 💫
          </p>
        </div>

        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} Your Institution Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

/**
 * Generate generic payment email (fallback)
 */
function generateGenericPaymentEmail(payment, student, enrollment) {
  const subject = `✅ Payment Received | ${payment.paymentNo}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .congrats {
          text-align: center;
          margin-bottom: 30px;
        }
        .congrats h2 {
          color: #007bff;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .payment-details {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .detail-label {
          font-weight: 600;
          color: #495057;
        }
        .detail-value {
          color: #212529;
          text-align: right;
        }
        .amount-highlight {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          text-align: center;
          margin: 15px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f8f9fa;
          color: #6c757d;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💳 Payment Received</h1>
        </div>
        
        <div class="content">
          <div class="congrats">
            <h2>Payment Processed Successfully</h2>
            <p>Dear ${student.name}, your payment has been received and approved.</p>
          </div>

          <div class="amount-highlight">
            ₹${payment.amountReceived}
          </div>

          <div class="payment-details">
            <div class="detail-row">
              <span class="detail-label">Student Name:</span>
              <span class="detail-value">${student.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment No:</span>
              <span class="detail-value">${payment.paymentNo}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Date:</span>
              <span class="detail-value">${new Date(payment.date).toLocaleDateString('en-IN')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Mode:</span>
              <span class="detail-value">${payment.paymentMode}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Received:</span>
              <span class="detail-value">₹${payment.amountReceived}</span>
            </div>
          </div>

          <p style="text-align: center; color: #6c757d; font-style: italic;">
            Thank you for your payment!
          </p>
        </div>

        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} Your Institution Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

/**
 * Calculate remaining EMIs after current payment
 */
function calculateRemainingEMIs(enrollment, currentEMI) {
  const emiOrder = ['first', 'second', 'third'];
  const currentIndex = emiOrder.indexOf(currentEMI);
  
  if (currentIndex === -1) return 0;
  
  let remaining = 0;
  for (let i = currentIndex + 1; i < emiOrder.length; i++) {
    const emi = enrollment[`${emiOrder[i]}EMI`];
    if (emi && emi.pending > 0) {
      remaining++;
    }
  }
  
  return remaining;
}

/**
 * Generate EMI status pills for display
 */
function generateEMIStatusPills(enrollment) {
  const emis = [
    { name: '1st', key: 'firstEMI' },
    { name: '2nd', key: 'secondEMI' },
    { name: '3rd', key: 'thirdEMI' }
  ];

  return emis.map(emi => {
    const emiData = enrollment[emi.key];
    const isPaid = emiData && emiData.pending === 0;
    const statusClass = isPaid ? 'emi-paid' : 'emi-pending';
    const statusText = isPaid ? 'Paid' : 'Pending';
    
    return `<div class="emi-pill ${statusClass}">${emi.name} EMI: ${statusText}</div>`;
  }).join('');
}

// YOUR EXISTING FUNCTIONS - UPDATED WITH EMAIL INTEGRATION

const recordPayment = async (req, res) => {
  try {
    const {
      enrollment,
      amountReceived,
      feeType,
      paymentMode,
      paymentBank,
      transactionNo,
      receivedBranch,
      paymentProof,
      chequeDetails,
      remarks,
      emiNumber // REQUIRED for installment payments
    } = req.body;

    // Verify enrollment exists and belongs to counsellor
    const enrollmentDoc = await Enrollment.findById(enrollment);
    if (!enrollmentDoc) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if counsellor owns this enrollment
    if (enrollmentDoc.counsellor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to record payment for this enrollment'
      });
    }

    // ✅ STRICT VALIDATION: Check payment amount against enrollment fee structure
    const validationError = await validatePaymentAmountStrict(
      enrollmentDoc, 
      amountReceived, 
      feeType, 
      emiNumber
    );
    
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    // Generate payment number
    const currentYear = new Date().getFullYear();
    
    // Find the latest payment for this year to get the sequence number
    const latestPayment = await Payment.findOne(
      {
        paymentNo: new RegExp(`^PAY${currentYear}`)
      },
      {},
      { sort: { paymentNo: -1 } }
    );

    let sequenceNumber = 1;
    if (latestPayment && latestPayment.paymentNo) {
      const lastSequence = parseInt(latestPayment.paymentNo.slice(-4));
      sequenceNumber = lastSequence + 1;
    }

    const paymentNo = `PAY${currentYear}${sequenceNumber.toString().padStart(4, '0')}`;

    // Create payment with generated payment number
    const payment = new Payment({
      paymentNo,
      enrollment,
      student: enrollmentDoc.student,
      amountReceived,
      feeType,
      paymentMode,
      paymentBank,
      transactionNo,
      emiNumber, // Store which EMI this payment is for
      trainingBranch: enrollmentDoc.trainingBranch,
      trainingMode: enrollmentDoc.mode,
      admissionBranch: enrollmentDoc.trainingBranch,
      receivedBranch: receivedBranch || enrollmentDoc.trainingBranch,
      paymentProof,
      chequeDetails,
      remarks,
      receivedBy: req.user.id,
      counsellor: req.user.id
    });

    await payment.save();

    // Populate payment details
    await payment.populate([
      { path: 'enrollment', select: 'enrollmentNo courseName' },
      { path: 'student', select: 'studentId name email phone' },
      { path: 'receivedBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment recorded successfully. Waiting for admin approval.'
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording payment',
      error: error.message
    });
  }
};

const getPayments = async (req, res) => {
  try {
    const {
      verificationStatus,
      paymentMode,
      trainingBranch,
      counsellor,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // Counsellor can only see their own payments
    if (req.user.role === 'counsellor') {
      query.counsellor = req.user.id;
    }

    // Admin can filter by counsellor
    if (req.user.role === 'admin' && counsellor) {
      query.counsellor = counsellor;
    }

    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (paymentMode) query.paymentMode = paymentMode;
    if (trainingBranch) query.trainingBranch = trainingBranch;

    // Date range filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const payments = await Payment.find(query)
      .populate('enrollment', 'enrollmentNo courseName totalAmount amountReceived feeType')
      .populate('student', 'studentId name email phone')
      .populate('receivedBy', 'FullName email')
      .populate('counsellor', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments',
      error: error.message
    });
  }
};

const getPendingApprovals = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const payments = await Payment.findPendingApprovals();

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pending approvals',
      error: error.message
    });
  }
};

const approvePayment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { verificationNotes } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.verificationStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Payment is already approved'
      });
    }

    await payment.approvePayment(req.user.id, verificationNotes);

    // Send payment confirmation email
    await sendPaymentConfirmationEmail(payment);

    // Populate updated payment
    await payment.populate([
      { path: 'enrollment', select: 'enrollmentNo' },
      { path: 'student', select: 'studentId name email phone' },
      { path: 'receivedBy', select: 'name email' },
      { path: 'verifiedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      data: payment,
      message: 'Payment approved successfully'
    });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving payment',
      error: error.message
    });
  }
};

const rejectPayment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { verificationNotes } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.verificationStatus === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Payment is already rejected'
      });
    }

    await payment.rejectPayment(req.user.id, verificationNotes);

    // Populate updated payment
    await payment.populate([
      { path: 'enrollment', select: 'enrollmentNo' },
      { path: 'student', select: 'studentId name email phone' },
      { path: 'receivedBy', select: 'name email' },
      { path: 'verifiedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      data: payment,
      message: 'Payment rejected successfully'
    });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting payment',
      error: error.message
    });
  }
};

const getPaymentStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { startDate, endDate } = req.query;

    // Default to current month if no dates provided
    const defaultStartDate = new Date();
    defaultStartDate.setDate(1);
    defaultStartDate.setHours(0, 0, 0, 0);

    const defaultEndDate = new Date();
    defaultEndDate.setHours(23, 59, 59, 999);

    const stats = await Payment.getStatistics(
      startDate || defaultStartDate,
      endDate || defaultEndDate
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment statistics',
      error: error.message
    });
  }
};

const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('enrollment', 'enrollmentNo courseName totalAmount amountReceived feeType')
      .populate('student', 'studentId name email phone')
      .populate('receivedBy', 'name email phone')
      .populate('counsellor', 'name email phone')
      .populate('verifiedBy', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if counsellor owns this payment
    if (req.user.role === 'counsellor' && payment.counsellor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this payment'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment',
      error: error.message
    });
  }
};

const bulkApprovePayments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { paymentIds, verificationNotes } = req.body;

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment IDs are required'
      });
    }

    const results = {
      approved: 0,
      failed: 0,
      errors: []
    };

    // Process each payment individually
    for (const paymentId of paymentIds) {
      try {
        const payment = await Payment.findById(paymentId);
        
        if (!payment) {
          results.errors.push(`Payment ${paymentId} not found`);
          results.failed++;
          continue;
        }

        if (payment.verificationStatus === 'approved') {
          results.errors.push(`Payment ${payment.paymentNo} already approved`);
          results.failed++;
          continue;
        }

        await payment.approvePayment(req.user.id, verificationNotes);
        
        // Send payment confirmation email for each approved payment
        await sendPaymentConfirmationEmail(payment);
        
        results.approved++;
      } catch (error) {
        results.errors.push(`Payment ${paymentId}: ${error.message}`);
        results.failed++;
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Bulk approval completed: ${results.approved} approved, ${results.failed} failed`
    });
  } catch (error) {
    console.error('Bulk approve payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk approval',
      error: error.message
    });
  }
};

const deleteAllPayments = async (req, res) => {
  try {
    await Payment.deleteMany({});

    res.status(200).json({
      success: true,
      message: 'payment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

module.exports = {
  recordPayment,
  getPayments,
  getPendingApprovals,
  approvePayment,
  rejectPayment,
  getPaymentStats,
  getPayment,
  deleteAllPayments,
  bulkApprovePayments
};