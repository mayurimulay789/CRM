const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const { sendMail } = require('../utils/email');

// ==================== Email Functions ====================

/**
 * Send payment confirmation email to student and BCC
 */
async function sendPaymentConfirmationEmail(payment) {
  try {
    // Populate payment with necessary data
    await payment.populate([
      { path: 'student', select: 'studentId name email phone' },
      { path: 'enrollment', select: 'enrollmentNo courseName totalAmount amountReceived pendingAmount feeType' },
      { path: 'receivedBy', select: 'name email' }
    ]);
    
    const { student, enrollment } = payment;
    
    if (!student || !student.email) {
      console.error('❌ Student email not found for payment:', payment.paymentNo);
      return false;
    }

    let subject, html;
    
    // Different email templates based on fee type
    if (payment.feeType === 'one-time') {
      ({ subject, html } = generateOneTimePaymentEmail(payment, student, enrollment));
    } else {
      ({ subject, html } = generateInstallmentPaymentEmail(payment, student, enrollment));
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
        .amount-highlight {
          font-size: 24px;
          font-weight: bold;
          color: #28a745;
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
          
          <!-- Payment Details Section -->
          <div class="payment-details">
            <h3 style="color: #495057; margin-bottom: 15px; text-align: center;">📋 Payment Details</h3>
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
              <span class="detail-label">Fee Type:</span>
              <span class="detail-value">One-Time Payment</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Received:</span>
              <span class="detail-value" style="color: #28a745; font-weight: bold;">₹${payment.amountReceived}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Paid:</span>
              <span class="detail-value" style="color: #28a745; font-weight: bold;">₹${enrollment.amountReceived}</span>
            </div>
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
  const subject = `✅ Installment Received | ${payment.paymentNo}`;
  
  const installmentText = payment.installmentNo ? `Installment ${payment.installmentNo}` : 'Installment';
  
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
            <h2>${installmentText} Received! ✅</h2>
            <p>Dear ${student.name}, your installment has been processed successfully.</p>
          </div>

          <div class="amount-highlight">
            ₹${payment.amountReceived}
          </div>
          
          <!-- Payment Details Section -->
          <div class="payment-details">
            <h3 style="color: #495057; margin-bottom: 15px; text-align: center;">📋 Payment Details</h3>
            <div class="detail-row">
              <span class="detail-label">Student Name:</span>
              <span class="detail-value">${student.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment No:</span>
              <span class="detail-value">${payment.paymentNo}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fee Type:</span>
              <span class="detail-value">Installment</span>
            </div>
            ${payment.installmentNo ? `
            <div class="detail-row">
              <span class="detail-label">Installment Number:</span>
              <span class="detail-value">${payment.installmentNo}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Payment Date:</span>
              <span class="detail-value">${new Date(payment.date).toLocaleDateString('en-IN')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Mode:</span>
              <span class="detail-value">${payment.paymentMode}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Paid:</span>
              <span class="detail-value" style="color: #28a745; font-weight: bold;">₹${enrollment.amountReceived}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Pending Amount:</span>
              <span class="detail-value" style="color: ${enrollment.pendingAmount > 0 ? '#dc3545' : '#28a745'}; font-weight: bold;">₹${enrollment.pendingAmount}</span>
            </div>
          </div>

          <!-- Payment Progress -->
          <h3 style="text-align: center; margin-bottom: 10px;">Payment Progress</h3>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${(enrollment.amountReceived / enrollment.totalAmount) * 100}%"></div>
          </div>
          
          ${enrollment.pendingAmount <= 0 ? `
            <div class="completion-message">
              🎉 Congratulations! You have successfully paid all installments. Your course fee is now complete!
            </div>
          ` : `
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h3>📅 Payment Status</h3>
              <p>You have paid ₹${enrollment.amountReceived} out of ₹${enrollment.totalAmount}. Pending amount: ₹${enrollment.pendingAmount}</p>
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
  const { breakdownHtml, actualTotal, actualPending } = generateFeeBreakdown(enrollment);
  const subject = `✅ Payment Received | ${payment.paymentNo}`;
  
  const html = `
   <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RYMA ACADEMY – Payment Confirmation</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f2e5e5;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .email-container {
            max-width: 1200px;
            margin: 25px auto;
            background-color: #ffffff;
            overflow: hidden;
            box-shadow: 0 12px 28px rgba(150, 30, 30, 0.2);
            border: 1px solid #e0b7b7;
        }
        .header-image {
            width: 100%;
            background-color: #b31b1b;
            text-align: center;
            line-height: 0;
        }
        .header-image img {
            width: 100%;
            height: auto;
            display: block;
            max-height: 180px;
            object-fit: cover;
            background-color: #8a1e1e;
        }
        .img-placeholder {
            display: inline-block;
            width: 100%;
            background: linear-gradient(145deg, #b22222, #8b1a1a);
            color: white;
            font-size: 32px;
            font-weight: 800;
            text-align: center;
            padding: 40px 20px;
            box-sizing: border-box;
            letter-spacing: 4px;
            text-transform: uppercase;
            border-bottom: 4px solid #f3c3c3;
        }
        .content {
            padding: 28px 32px 32px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #3b2323;
            margin-bottom: 16px;
        }
        .greeting strong {
            color: #b13e3e;
        }
        .message {
            font-size: 16px;
            color: #3a2a2a;
            line-height: 1.5;
            margin: 15px 0;
        }
        .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #aa2929;
            border-bottom: 2px solid #e0adad;
            padding-bottom: 8px;
            margin: 30px 0 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .payment-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(150, 40, 40, 0.1);
            border: 1px solid #e9c1c1;
            margin-bottom: 20px;
        }
        .payment-table td {
            padding: 14px 18px;
            border-bottom: 1px solid #f2d6d6;
            font-size: 16px;
        }
        .payment-table tr:last-child td {
            border-bottom: none;
        }
        .label-cell {
            background-color: #fde5e5;
            color: #892b2b;
            font-weight: 700;
            width: 40%;
            border-right: 1px solid #e2b2b2;
        }
        .value-cell {
            background-color: #fffbfb;
            color: #2e1c1c;
            font-weight: 500;
        }
        .value-cell strong {
            color: #b33838;
        }
        .quote-block {
            background: #fff3f3;
            border-radius: 40px 12px 40px 12px;
            padding: 22px 26px;
            margin: 25px 0 20px;
            border: 1px solid #e6b2b2;
            box-shadow: 0 6px 14px rgba(170, 60, 60, 0.1);
        }
        .quote-mark {
            font-size: 40px;
            color: #b44848;
            font-family: 'Times New Roman', serif;
            line-height: 0.6;
            margin-right: 4px;
        }
        .quote-block p {
            font-size: 18px;
            font-style: italic;
            color: #592b2b;
            margin: 8px 0 10px;
            font-weight: 500;
        }
        .director-name {
            font-weight: 700;
            color: #862b2b;
            text-align: right;
            font-size: 16px;
        }
        .signature {
            margin: 25px 0 15px;
            color: #592525;
        }
        .contact-footer {
            background: #fae1e1;
            padding: 18px 25px;
            border-radius: 30px;
            color: #6d3131;
            font-size: 15px;
            margin: 20px 0;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: 12px 8px;
            word-break: break-word;
        }
        .contact-footer a {
            color: #a13030;
            text-decoration: underline;
            white-space: nowrap;
        }
        /* Responsive */
        @media only screen and (max-width: 480px) {
            .contact-footer {
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 8px;
            }
            .contact-footer a {
                white-space: normal;
            }
        }
        .social-icons {
            text-align: center;
            margin: 20px 0;
            font-size: 18px;
            letter-spacing: 10px;
            color: #b44848;
        }
        .social-icons span {
            font-weight: 600;
            color: #862b2b;
        }
        .disclaimer {
            font-size: 12px;
            color: #ffe5e5;
            background-color: #6d2b2b;
            padding: 16px 24px;
            text-align: left;
            line-height: 1.5;
        }
        .footer-red {
            background-color: #8f2626;
            padding: 12px 20px;
            text-align: center;
            color: #ffd7d7;
            font-size: 13px;
        }
        hr {
            border: none;
            height: 1px;
            background: linear-gradient(to right, #efc2c2, #c96666, #efc2c2);
            margin: 20px 0;
        }
        .note-placeholder {
            font-size: 13px;
            color: #946060;
            background: #faf0f0;
            padding: 6px 10px;
            border-radius: 50px;
            margin-top: 8px;
            text-align: center;
        }
        .imgformate{
        width:1200px;
    }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header image (replace src with actual image) -->
    
         <img src=${server/assets/header.png} alt="" class="imgformate">
        <div class="content">
            <!-- Dear student -->
            <div class="greeting">Dear <strong>${student.name}</strong>,</div>

            <!-- Thank you message -->
            <div class="message">
                Thank you for choosing RYMA ACADEMY as your preferred learning partner.
            </div>
            <div class="message">
                We are pleased to confirm that your payment has been successfully received and recorded in our system. Your official fee receipt is attached to this email for your reference and records.
            </div>

            <!-- Payment details section -->
            <div class="section-title">PAYMENT DETAILS</div>

            <table class="payment-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Amount Received</td>
                    <td class="value-cell"><strong>₹${payment.amountReceived}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Reference ID</td>
                    <td class="value-cell"><strong>${payment.paymentNo}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Payment Date</td>
                    <td class="value-cell"><strong>${new Date(payment.date).toLocaleDateString('en-IN')}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Payment Mode</td>
                    <td class="value-cell"><strong>${payment.paymentMode}</strong></td>
                </tr>
            </table>

            <div class="message">
                Please quote Reference ID <strong>${payment.paymentNo}</strong> in all future communications with us regarding this payment.
            </div>
            <div class="message">
                We look forward to a long and enriching association with you. Welcome to the <strong>RYMA ACADEMY</strong> family.
            </div>

            <!-- Regards -->
            <div class="signature">
                With the highest regards & warmest welcome,<br>
                <strong>RYMA ACADEMY</strong><br>
                Team of Admissions & Student Services
            </div>

            <!-- Contact block (responsive) -->
            <div class="contact-footer">
                +91 98733 36133
                <a href="mailto:services@rymaacademy.com">services@rymaacademy.com</a>
                <a href="#">www.rymaacademy.com</a>
                📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085
            </div>

            <!-- Quote -->
            <div class="quote-block">
                <span class="quote-mark">“</span>
                <p>We do not just build careers. We build people who change the world.</p>
                <div class="director-name">— Mr. Parveen Jain (Director), RYMA ACADEMY</div>
            </div>
            <!-- Optional note about header (remove in production) -->
            <div class="note-placeholder">
                ⚡ Replace header image source with your actual logo.
            </div>
        </div>

        <!-- Disclaimer -->
        <div class="disclaimer">
            <strong>Disclaimer:</strong> The information contained in this email is confidential to the addressee and may be protected by legal privilege. If you are not the intended recipient, please note that you may not disseminate, retransmit or make any other use of any material in this message. If you have received this email in error, please delete it and notify immediately by telephone or email.
        </div>
        <div class="footer-red">
            © RYMA ACADEMY – Payment Receipt
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

// ==================== Controller Functions ====================

/**
 * @desc    Record a new payment (pending approval)
 * @route   POST /api/payments
 * @access  Private (Counsellor)
 */
const recordPayment = async (req, res) => {
  try {
    const {
      enrollment,
      amountReceived,
      feeType,
      paymentMode,
      paymentBank,
      transactionNo,
      receivedBranch='N/A',
      paymentProof,
      chequeDetails,
      remarks,
      installmentNo
    } = req.body;

    // Verify enrollment exists
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

    // Simple validation based on fee type
    if (feeType === 'one-time') {
      // No validation needed for one-time, just record the payment
      console.log('Recording one-time payment');
    } else if (feeType === 'installment') {
      // For installment, just ensure we have installment number (optional)
      console.log('Recording installment payment');
    }

    // Generate payment number
    const currentYear = new Date().getFullYear();
    
    // Find the latest payment for this year
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

    // Create payment
    const payment = new Payment({
      paymentNo,
      enrollment,
      student: enrollmentDoc.student,
      amountReceived,
      feeType,
      installmentNo: installmentNo || null,
      paymentMode,
      paymentBank,
      transactionNo,
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

/**
 * @desc    Get all payments (with filters)
 * @route   GET /api/payments
 * @access  Private
 */
const getPayments = async (req, res) => {
  try {
    const {
      verificationStatus,
      paymentMode,
      trainingBranch,
      counsellor,
      feeType,
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
    if (feeType) query.feeType = feeType;

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
      .populate('enrollment', 'enrollmentNo courseName totalAmount amountReceived pendingAmount feeType')
      .populate('student', 'studentId name email phone')
      .populate('receivedBy', 'name email')
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

/**
 * @desc    Get pending approvals
 * @route   GET /api/payments/pending-approvals
 * @access  Private (Admin only)
 */
const getPendingApprovals = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const payments = await Payment.find({ verificationStatus: 'pending' })
      .populate('enrollment', 'enrollmentNo courseName totalAmount amountReceived pendingAmount feeType')
      .populate('student', 'studentId name email phone')
      .populate('receivedBy', 'name email')
      .populate('counsellor', 'name email')
      .sort({ date: 1 });

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

/**
 * @desc    Approve a payment and update enrollment
 * @route   PUT /api/payments/:id/approve
 * @access  Private (Admin only)
 */
const approvePayment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { verificationNotes } = req.body;
    const payment = await Payment.findById(req.params.id).populate('enrollment');

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

    const enrollment = payment.enrollment;

    // 🔥 IMPORTANT: Update enrollment amounts
    enrollment.amountReceived = (enrollment.amountReceived || 0) + payment.amountReceived;
    enrollment.pendingAmount = enrollment.totalAmount - enrollment.amountReceived;

    // If pending amount is 0 or less, mark as completed
    if (enrollment.pendingAmount <= 0) {
      enrollment.status = 'completed';
    }

    // Update last payment details
    enrollment.lastTransactionNo = payment.transactionNo || payment.paymentNo;
    enrollment.lastPaidAmount = payment.amountReceived;
    enrollment.lastPaidDate = new Date();
    enrollment.lastPaidMode = payment.paymentMode;
    enrollment.lastAmountReceivedBy = payment.receivedBy;

    // Save enrollment first
    await enrollment.save();

    // Update payment status
    payment.verificationStatus = 'approved';
    payment.verifiedBy = req.user.id;
    payment.verifiedAt = new Date();
    payment.verificationNotes = verificationNotes;
    await payment.save();

    // Add activity to enrollment
    await enrollment.addActivity(
      'payment_approved',
      `Payment of ₹${payment.amountReceived} approved`,
      req.user.id,
      payment._id
    );

    // Send payment confirmation email
    await sendPaymentConfirmationEmail(payment);

    // Populate updated payment
    await payment.populate([
      { path: 'enrollment', select: 'enrollmentNo courseName totalAmount amountReceived pendingAmount status' },
      { path: 'student', select: 'studentId name email phone' },
      { path: 'receivedBy', select: 'name email' },
      { path: 'verifiedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      data: payment,
      message: 'Payment approved and enrollment updated successfully'
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

/**
 * @desc    Reject a payment
 * @route   PUT /api/payments/:id/reject
 * @access  Private (Admin only)
 */
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

    // Update payment status (no enrollment changes needed)
    payment.verificationStatus = 'rejected';
    payment.verifiedBy = req.user.id;
    payment.verifiedAt = new Date();
    payment.verificationNotes = verificationNotes;
    await payment.save();

    // Add activity to enrollment
    const enrollment = await Enrollment.findById(payment.enrollment);
    if (enrollment) {
      await enrollment.addActivity(
        'payment_rejected',
        `Payment of ₹${payment.amountReceived} rejected: ${verificationNotes || 'No reason provided'}`,
        req.user.id,
        payment._id
      );
    }

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

/**
 * @desc    Get payment statistics
 * @route   GET /api/payments/stats
 * @access  Private (Admin only)
 */
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

/**
 * @desc    Get single payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('enrollment', 'enrollmentNo courseName totalAmount amountReceived pendingAmount feeType')
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

/**
 * @desc    Bulk approve multiple payments
 * @route   POST /api/payments/bulk-approve
 * @access  Private (Admin only)
 */
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
        const payment = await Payment.findById(paymentId).populate('enrollment');
        
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

        const enrollment = payment.enrollment;

        // Update enrollment amounts
        enrollment.amountReceived = (enrollment.amountReceived || 0) + payment.amountReceived;
        enrollment.pendingAmount = enrollment.totalAmount - enrollment.amountReceived;

        if (enrollment.pendingAmount <= 0) {
          enrollment.status = 'completed';
        }

        enrollment.lastTransactionNo = payment.transactionNo || payment.paymentNo;
        enrollment.lastPaidAmount = payment.amountReceived;
        enrollment.lastPaidDate = new Date();
        enrollment.lastPaidMode = payment.paymentMode;
        enrollment.lastAmountReceivedBy = payment.receivedBy;

        await enrollment.save();

        // Update payment status
        payment.verificationStatus = 'approved';
        payment.verifiedBy = req.user.id;
        payment.verifiedAt = new Date();
        payment.verificationNotes = verificationNotes;
        await payment.save();

        await enrollment.addActivity(
          'payment_approved',
          `Payment of ₹${payment.amountReceived} approved (bulk)`,
          req.user.id,
          payment._id
        );

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

/**
 * @desc    Get payments by enrollment
 * @route   GET /api/payments/enrollment/:enrollmentId
 * @access  Private
 */
const getPaymentsByEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { status } = req.query;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if counsellor owns this enrollment
    if (req.user.role === 'counsellor' && enrollment.counsellor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this enrollment'
      });
    }

    const payments = await Payment.findByEnrollment(enrollmentId, status);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get payments by enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments',
      error: error.message
    });
  }
};

/**
 * @desc    Get payments by student
 * @route   GET /api/payments/student/:studentId
 * @access  Private
 */
const getPaymentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const payments = await Payment.findByStudent(studentId, status);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get payments by student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments',
      error: error.message
    });
  }
};

/**
 * @desc    Delete all payments (DANGER ZONE - Development only)
 * @route   DELETE /api/payments/delete-all
 * @access  Private (Admin only)
 */
const deleteAllPayments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // This should only be used in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'This operation is not allowed in production'
      });
    }

    await Payment.deleteMany({});

    res.status(200).json({
      success: true,
      message: 'All payments deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting payments',
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
  bulkApprovePayments,
  getPaymentsByEnrollment,
  getPaymentsByStudent
};