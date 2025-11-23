
// const nodemailer = require("nodemailer");
// const path = require("path");
// const dotenv = require("dotenv"); // ✅ import dotenv

// // Load environment variables
// dotenv.config({
//   path: path.resolve(__dirname, "../.env"),
//   override: true,
//   processEnv: process.env, // ⚠️ forces EMAIL_USER and EMAIL_PASS into process.env
// });

// console.log("Resolved .env path:", path.resolve(__dirname, "../.env"));


// // Load credentials
// const user = process.env.EMAIL_USER;
// const pass = process.env.EMAIL_PASS;
// const defaultBcc = process.env.EMAIL_BCC;

// if (!user || !pass) {
//   console.error("❌ Missing EMAIL_USER or EMAIL_PASS in .env file!");
// } else {
//   console.log("✅ Email credentials loaded successfully:", user);
// }

// // Create Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true, // SSL
//   auth: {
//     user,
//     pass, // must be Gmail App Password if 2FA is enabled
//   },
// });

// // Verify transporter
// transporter.verify((err, success) => {
//   if (err) {
//     console.error("❌ Transporter verification failed:", err);
//   } else {
//     console.log("✅ Mail server is ready to send messages");
//   }
// });

// /**
//  * Send email function
//  * @param {string|string[]} to - recipient email(s)
//  * @param {string} subject - email subject
//  * @param {string} message - email HTML content
//  * @param {string|string[]} bcc - optional BCC recipients
//  */
// const sendMail = async (to, subject, message, bcc = defaultBcc) => {
//   try {
//     const mailOptions = {
//       from: `"Student Support" <${user}>`,
//       to,
//       subject,
//       html: message,
//     };

//     if (bcc) mailOptions.bcc = bcc;

//     const info = await transporter.sendMail(mailOptions);
//     console.log(`✅ Mail sent to: ${to}${bcc ? ` (BCC: ${bcc})` : ""}`);
//     return info;
//   } catch (error) {
//     console.error("❌ Email sending failed:", error);
//     if (error.response) console.error("Gmail response:", error.response);
//   }
// };

// module.exports = sendMail;











// // utils/email.js
// const nodemailer = require("nodemailer");

// const user = process.env.EMAIL_USER;
// const pass = process.env.EMAIL_PASS;
// const bcc = process.env.BCC_EMAIL;

// if (!user || !pass) {
//   console.error("❌ Missing EMAIL_USER or EMAIL_PASS in environment variables!");
// }

// const transporter = nodemailer.createTransport({
//   service: "gmail", // using Gmail service
//   auth: {
//     user,
//     pass,
//   },
// });

// /**
//  * Send email with optional BCC (admin)
//  * @param {string} to - recipient email
//  * @param {string} subject - email subject
//  * @param {string} html - email body
//  */
// async function sendMail(to, subject, html) {
//   const mailOptions = {
//     from: user,
//     to,
//     bcc, // 👈 always sends hidden copy to admin
//     subject,
//     html,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Email sent to ${to} (BCC: ${bcc})`);
//   } catch (error) {
//     console.error("❌ Email sending failed:", error.message);
//   }
// }

// module.exports = sendMail;






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
