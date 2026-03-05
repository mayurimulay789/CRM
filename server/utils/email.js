const nodemailer = require("nodemailer");

// Environment variables
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const bcc = process.env.BCC_EMAIL; // optional, for submission notifications

// SMTP configuration
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT) || 587;

// Determine if we should use SSL or STARTTLS based on port
const useSSL = smtpPort === 465;

// Validate required credentials at startup
if (!user || !pass) {
  console.error("❌ Missing EMAIL_USER or EMAIL_PASS in environment variables!");
  // Optionally exit if email is critical – but here we just warn.
} else {
  console.log(`📧 Email configuration loaded:`, {
    user: user,
    host: smtpHost,
    port: smtpPort,
    secure: useSSL ? 'SSL' : 'STARTTLS',
    hasBcc: !!bcc
  });
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: useSSL, // true for 465 (SSL), false for 587 (STARTTLS)
  requireTLS: !useSSL, // Force TLS upgrade for STARTTLS
  auth: { 
    user, 
    pass 
  },
  tls: {
    minVersion: 'TLSv1.2'
  },
  // Add connection timeout and socket timeout
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000, // 30 seconds
  socketTimeout: 60000, // 60 seconds
});

/**
 * Send email with optional BCC (for submission only)
 * @param {string} email - recipient email address(es)
 * @param {string} subject - email subject
 * @param {string} html - email HTML content
 * @param {boolean} isSubmission - whether this is a submission notification (adds BCC)
 */
async function sendMail(email, subject, html, isSubmission = false) {
  console.log(`📧 Preparing to send email:`, {
    to: email,
    subject: subject.substring(0, 50),
    isSubmission,
    hasBcc: isSubmission && bcc,
    bccAddress: isSubmission ? bcc : undefined
  });

  // Build mail options
  const mailOptions = {
    from: user,
    to: email,
    subject,
    html,
  };

  // Add BCC only if it's a submission AND bcc environment variable is set
  if (isSubmission && bcc) {
    mailOptions.bcc = bcc;
    console.log(`📋 Adding BCC: ${bcc}`);
  }

  try {
    console.log(`🚀 Attempting to send email via SMTP...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully:`, {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      to: email,
      bcc: isSubmission && bcc ? bcc : 'none'
    });
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", {
      error: error.message,
      code: error.code,
      command: error.command,
      recipient: email,
      subject: subject.substring(0, 50),
      stack: error.stack
    });
    // Re-throw the error so calling functions can handle it
    throw error;
  }
}

/**
 * Test SMTP connection
 */
async function verifyConnection() {
  try {
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', {
      error: error.message,
      code: error.code,
      host: smtpHost,
      port: smtpPort
    });
    return false;
  }
}

module.exports = { sendMail, verifyConnection }; 