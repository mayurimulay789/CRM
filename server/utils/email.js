const nodemailer = require("nodemailer");

// Environment variables
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const bcc = process.env.BCC_EMAIL; // optional, for submission notifications

// Validate required credentials at startup
if (!user || !pass) {
  console.error("❌ Missing EMAIL_USER or EMAIL_PASS in environment variables!");
  // Optionally exit if email is critical – but here we just warn.
}

// Create reusable transporter
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT) || 465;
const smtpSecure = smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure, // true for 465, false for other ports
  auth: { user, pass },
  tls: {
    rejectUnauthorized: false, // ⚠️ Only for development! In production use a valid certificate.
  },
});

/**
 * Send email with optional BCC (for submission only)
 * @param {string} email - recipient email address(es)
 * @param {string} subject - email subject
 * @param {string} html - email HTML content
 * @param {boolean} isSubmission - whether this is a submission notification (adds BCC)
 */
async function sendMail(email, subject, html, isSubmission = false) {
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
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email sent to ${email}${isSubmission && bcc ? ` (BCC: ${bcc})` : ""}`
    );
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    // Re-throw if you want the caller to handle the error
    // throw error;
  }
}

module.exports = sendMail; 