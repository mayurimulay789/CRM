

const nodemailer = require("nodemailer");

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const bcc = process.env.BCC_EMAIL;

if (!user || !pass) {
  console.error("❌ Missing EMAIL_USER or EMAIL_PASS in environment variables!");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
});

/**
 * Send email with optional BCC (for submission only)
 * @param {string} to - recipient email(s)
 * @param {string} subject - email subject
 * @param {string} html - email content
 * @param {boolean} isSubmission - whether it's a submission notification
 */
async function sendMail(to, subject, html, isSubmission = false) {
  const mailOptions = {
    from: user,
    to,
    subject,
    html,
    ...(isSubmission && { bcc }), // 👈 only add BCC for submission
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email sent to ${to}${isSubmission ? ` (BCC: ${bcc})` : ""}`
    );
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
}

module.exports = sendMail;
