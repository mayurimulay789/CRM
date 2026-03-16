


// const StudentGrievance = require("../models/StudentGrievance");
// const Admission = require("../models/Admission");
// const sendMail = require("../utils/email");

// // Student submits complaint (via counsellor)
// exports.submitGrievance = async (req, res) => {
//   try {
//     const grievanceData = {
//       ...req.body,
//       counsellorId: req.user._id,
//       status: "submittedToAdmin",
//     };
//     const grievance = await StudentGrievance.create(grievanceData);

//     // Send email to student
//     try {
//       await sendMail(
//         grievance.studentEmail,
//         "Complaint Registered",
//         `Hello ${grievance.studentName}, your complaint has been registered successfully.`
//       );
//     } catch (emailError) {
//       console.error("Email sending failed:", emailError.message);
//     }

//     res.status(201).json({ message: "Complaint submitted successfully", grievance });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Counsellor view their complaints
// exports.getCounsellorGrievances = async (req, res) => {
//   try {
//     const grievances = await StudentGrievance.find({ counsellorId: req.user._id });
//     res.status(200).json(grievances);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Admin view all complaints
// exports.getAllGrievances = async (req, res) => {
//   try {
//     const grievances = await StudentGrievance.find().populate("counsellorId", "email");
//     res.status(200).json(grievances);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get single complaint by ID
// exports.getGrievanceById = async (req, res) => {
//   try {
//     const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "email");
//     if (!grievance) return res.status(404).json({ message: "Complaint not found" });
//     res.status(200).json(grievance);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Approve complaint
// exports.approveGrievance = async (req, res) => {
//   try {
//     const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "email");
//     if (!grievance) return res.status(404).json({ message: "Complaint not found" });

//     grievance.status = "approved";
//     grievance.adminResponse = req.body.adminResponse;
//     grievance.adminId = req.user._id;
//     await grievance.save();

//     const message = `
//       Hello ${grievance.studentName},<br/>
//       Your complaint has been <b>approved</b>.<br/>
//       <b>Admin Response:</b> ${grievance.adminResponse}
//     `;

//     // Send mail to student and counsellor
//     try {
//       await sendMail(grievance.studentEmail, "Complaint Approved", message);

//       if (grievance.counsellorId?.email) {
//         await sendMail(grievance.counsellorId.email, "Complaint Approved", message);
//       }
//     } catch (emailError) {
//       console.error("Email sending failed:", emailError.message);
//     }

//     res.status(200).json({ message: "Complaint approved", grievance });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Reject complaint
// exports.rejectGrievance = async (req, res) => {
//   try {
//     const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "email");
//     if (!grievance) return res.status(404).json({ message: "Complaint not found" });

//     grievance.status = "rejected";
//     grievance.adminResponse = req.body.adminResponse;
//     grievance.adminId = req.user._id;
//     await grievance.save();

//     const message = `
//       Hello ${grievance.studentName},<br/>
//       Your complaint has been <b>rejected</b>.<br/>
//       <b>Admin Response:</b> ${grievance.adminResponse}
//     `;

//     // Send mail to student and counsellor
//     try {
//       await sendMail(grievance.studentEmail, "Complaint Rejected", message);

//       if (grievance.counsellorId?.email) {
//         await sendMail(grievance.counsellorId.email, "Complaint Rejected", message);
//       }
//     } catch (emailError) {
//       console.error("Email sending failed:", emailError.message);
//     }

//     res.status(200).json({ message: "Complaint rejected", grievance });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update complaint
// exports.updateGrievance = async (req, res) => {
//   try {
//     const grievance = await StudentGrievance.findById(req.params.id);
//     if (!grievance) return res.status(404).json({ message: "Complaint not found" });

//     if (["approved", "rejected"].includes(grievance.status)) {
//       return res.status(403).json({ message: "Cannot edit/delete after admin action" });
//     }

//     Object.assign(grievance, req.body);
//     await grievance.save();

//     res.status(200).json({ message: "Complaint updated", grievance });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete complaint
// exports.deleteGrievance = async (req, res) => {
//   try {
//     const grievance = await StudentGrievance.findById(req.params.id);
//     if (!grievance) return res.status(404).json({ message: "Complaint not found" });

//     if (["approved", "rejected"].includes(grievance.status)) {
//       return res.status(403).json({ message: "Cannot delete after admin action" });
//     }

//     await grievance.deleteOne();
//     res.status(200).json({ message: "Complaint deleted" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// // ✅ Search students whose admission is approved by student name
// exports.searchStudentByName = async (req, res) => {
//   try {
//     const { name } = req.query;
//     if (!name) return res.status(400).json({ message: "Name query is required" });

//     // Find admissions that are approved and match the student's name
//     const admissions = await Admission.find({ status: "approved" })
//       .populate({
//         path: "student",
//         match: { name: { $regex: name, $options: "i" } }, // case-insensitive search
//         select: "name email phone studentId",
//       })
//       .populate("course", "name");

//     // Filter out admissions without matched student
//     const filteredAdmissions = admissions.filter(a => a.student);

//     // Map to clean response
//     const students = filteredAdmissions.map(a => ({
//       admissionId: a._id,
//       admissionNo: a.admissionNo,
//       studentId: a.student._id,
//       studentName: a.student.name,
//       email: a.student.email,
//       phone: a.student.phone,
//       course: a.course?.name || "",
//       counsellor: a.counsellor,
//       trainingBranch: a.trainingBranch,
//     }));

//     res.status(200).json(students);
//   } catch (error) {
//     console.error("Search student error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };






















// const StudentGrievance = require("../models/StudentGrievance");
// const Admission = require("../models/Admission");
// const sendMail = require("../utils/email");


// const BCC_EMAIL = process.env.BCC_EMAIL || null; // hidden admin mail

// // Student submits complaint (via counsellor)
// exports.submitGrievance = async (req, res) => {
//   try {
//     const grievanceData = {
//       ...req.body,
//       counsellorId: req.user._id,
//       status: "submittedToAdmin",
//     };

//     const grievance = await StudentGrievance.create(grievanceData);

//     const message = `Hello ${grievance.studentName}, your complaint has been registered successfully.`;

//     try {
//       // Send email to student + BCC to admin
//       await sendMail(grievance.studentEmail, "Complaint Registered", message);

//     } catch (emailError) {
//       console.error("Email sending failed:", emailError.message);
//     }

//     res.status(201).json({ message: "Complaint submitted successfully", grievance });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Counsellor view their complaints
// exports.getCounsellorGrievances = async (req, res) => {
//   try {
//     const grievances = await StudentGrievance.find({ counsellorId: req.user._id });
//     res.status(200).json(grievances);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Admin view all complaints
// exports.getAllGrievances = async (req, res) => {
//   try {
//     const grievances = await StudentGrievance.find().populate("counsellorId", "email");
//     res.status(200).json(grievances);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get single complaint by ID
// exports.getGrievanceById = async (req, res) => {
//   try {
//     const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "email");
//     if (!grievance) return res.status(404).json({ message: "Complaint not found" });
//     res.status(200).json(grievance);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Approve complaint
// exports.approveGrievance = async (req, res) => {
//   try {
//     const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "email");
//     if (!grievance) return res.status(404).json({ message: "Complaint not found" });

//     grievance.status = "approved";
//     grievance.adminResponse = req.body.adminResponse;
//     grievance.adminId = req.user._id;
//     await grievance.save();

//     const message = `Hello ${grievance.studentName},<br/>
//       Your complaint has been <b>approved</b>.<br/>
//       <b>Admin Response:</b> ${grievance.adminResponse}
//     `;

//     try {
//       // Send mail to student + BCC
//       await sendMail(grievance.studentEmail, "Complaint Approved", message, BCC_EMAIL);

//       // Also notify counsellor
//       if (grievance.counsellorId?.email) {
//         await sendMail(grievance.counsellorId.email, "Complaint Approved", message, BCC_EMAIL);
//       }
//     } catch (emailError) {
//       console.error("Email sending failed:", emailError.message);
//     }

//     res.status(200).json({ message: "Complaint approved", grievance });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Reject complaint
// exports.rejectGrievance = async (req, res) => {
//   try {
//     const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "email");
//     if (!grievance) return res.status(404).json({ message: "Complaint not found" });

//     grievance.status = "rejected";
//     grievance.adminResponse = req.body.adminResponse;
//     grievance.adminId = req.user._id;
//     await grievance.save();

//     const message = `Hello ${grievance.studentName},<br/>
//       Your complaint has been <b>rejected</b>.<br/>
//       <b>Admin Response:</b> ${grievance.adminResponse}
//     `;

//     try {
//       // Send mail to student + BCC
//       await sendMail(grievance.studentEmail, "Complaint Rejected", message, BCC_EMAIL);

//       // Also notify counsellor
//       if (grievance.counsellorId?.email) {
//         await sendMail(grievance.counsellorId.email, "Complaint Rejected", message, BCC_EMAIL);
//       }
//     } catch (emailError) {
//       console.error("Email sending failed:", emailError.message);
//     }

//     res.status(200).json({ message: "Complaint rejected", grievance });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update complaint
// exports.updateGrievance = async (req, res) => {
//   try {
//     const grievance = await StudentGrievance.findById(req.params.id);
//     if (!grievance) return res.status(404).json({ message: "Complaint not found" });

//     if (["approved", "rejected"].includes(grievance.status)) {
//       return res.status(403).json({ message: "Cannot edit/delete after admin action" });
//     }

//     Object.assign(grievance, req.body);
//     await grievance.save();

//     const message = `Hello ${grievance.studentName}, your complaint has been updated successfully.`;

//     try {
//       // Send email to student + BCC
//       await sendMail(grievance.studentEmail, "Complaint Updated", message, BCC_EMAIL);
//     } catch (emailError) {
//       console.error("Email sending failed:", emailError.message);
//     }

//     res.status(200).json({ message: "Complaint updated", grievance });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete complaint
// exports.deleteGrievance = async (req, res) => {
//   try {
//     const grievance = await StudentGrievance.findById(req.params.id);
//     if (!grievance) return res.status(404).json({ message: "Complaint not found" });

//     if (["approved", "rejected"].includes(grievance.status)) {
//       return res.status(403).json({ message: "Cannot delete after admin action" });
//     }

//     await grievance.deleteOne();
//     res.status(200).json({ message: "Complaint deleted" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Search students whose admission is approved by student name
// exports.searchStudentByName = async (req, res) => {
//   try {
//     const { name } = req.query;
//     if (!name) return res.status(400).json({ message: "Name query is required" });

//     const admissions = await Admission.find({ status: "approved" })
//       .populate({
//         path: "student",
//         match: { name: { $regex: name, $options: "i" } },
//         select: "name email phone studentId",
//       })
//       .populate("course", "name");

//     const filteredAdmissions = admissions.filter(a => a.student);

//     const students = filteredAdmissions.map(a => ({
//       admissionId: a._id,
//       admissionNo: a.admissionNo,
//       studentId: a.student._id,
//       studentName: a.student.name,
//       email: a.student.email,
//       phone: a.student.phone,
//       course: a.course?.name || "",
//       counsellor: a.counsellor,
//       trainingBranch: a.trainingBranch,
//     }));

//     res.status(200).json(students);
//   } catch (error) {
//     console.error("Search student error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };















const StudentGrievance = require("../models/StudentGrievance");
const Admission = require("../models/Admission");
const { sendMail } = require("../utils/email");

const BCC_EMAIL = process.env.BCC_EMAIL || null; // hidden admin mail

// Student submits complaint (via counsellor)
exports.submitGrievance = async (req, res) => {
  try {
    const grievanceData = {
      ...req.body,
      counsellorId: req.user._id,
      status: "submittedToAdmin",
    };

    const grievance = await StudentGrievance.create(grievanceData);

    const populatedGrievance = await StudentGrievance.findById(grievance._id).populate("counsellorId", "FullName email");
    const counsellorName = populatedGrievance?.counsellorId?.FullName || "Your Counsellor";

    const submissionHtml = `
     <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RYMA ACADEMY – Complaint Registration Confirmation</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f2e5e5;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .enrollment-container {
            max-width: 1200px;
            margin: auto;
            background-color: #ffffff;
            overflow: hidden;
            box-shadow: 0 12px 28px rgba(150, 30, 30, 0.2);
        }

        .content {
            padding: 28px 32px 32px;
        }

        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #3b2323;
            margin-bottom: 8px;
        }

        .greeting strong {
            color: #b13e3e;
        }

        .office-line {
            color: #7e3939;
            font-weight: 600;
            margin: 5px 0 15px;
            font-size: 16px;
        }

        .message {
            font-size: 16px;
            color: #3a2a2a;
            line-height: 1.5;
            margin: 15px 0 10px;
        }

        .highlight {
            background: #fef0f0;
            padding: 16px 20px;
            border-radius: 30px 10px 30px 10px;
            margin: 20px 0;
            border-left: 6px solid #b13e3e;
            color: #572626;
            font-weight: 500;
        }

        .section-title {
            font-size: 22px;
            font-weight: 700;
            color: #aa2929;
            border-bottom: 3px solid #e0adad;
            padding-bottom: 10px;
            margin: 30px 0 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .enroll-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 6px 18px rgba(150, 40, 40, 0.1);
            border: 1px solid #e9c1c1;
            margin-bottom: 25px;
        }

        .enroll-table td, .enroll-table th {
            padding: 14px 20px;
            border-bottom: 1px solid #f2d6d6;
            font-size: 16px;
        }

        .enroll-table tr:last-child td {
            border-bottom: none;
        }

        .label-cell {
            background-color: #fde5e5;
            color: #892b2b;
            font-weight: 700;
            width: 42%;
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

        .warning-note {
            background: #ffebeb;
            padding: 18px 24px;
            border-radius: 60px 10px 60px 10px;
            margin: 28px 0 20px;
            color: #792e2e;
            font-size: 15px;
            text-align: center;
            border: 1px solid #e2acac;
        }

        .help-box {
            background-color: #fadfdf;
            border-radius: 30px;
            padding: 18px 25px;
            margin: 25px 0;
            border: 1px solid #d69494;
            color: #6d3131;
        }

        .help-box a {
            color: #a23131;
            font-weight: 600;
            text-decoration: underline;
        }

        .quote-block {
            background: #fff3f3;
            border-radius: 40px 12px 40px 12px;
            padding: 22px 26px;
            margin: 20px 0 25px;
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
            margin: 8px 0 10px 0;
            font-weight: 500;
        }

        .director-name {
            font-weight: 700;
            color: #862b2b;
            text-align: right;
            font-size: 16px;
        }

        .signature {
            margin: 30px 0 20px;
            color: #592525;
        }

        .contact-footer {
            background: #fae1e1;
            padding: 18px 25px;
            border-radius: 30px;
            color: #6d3131;
            font-size: 15px;
            margin: 20px 0;
            word-break: break-word;
        }

        .contact-footer a {
            color: #a13030;
            text-decoration: underline;
        }

        .footer-red {
            background-color: #8f2626;
            padding: 18px 28px;
            text-align: center;
            color: #ffd7d7;
            font-size: 14px;
            border-top: 3px solid #b33a3a;
        }

        .disclaimer {
            font-size: 12px;
            color: #ffe5e5;
            background-color: #6d2b2b;
            padding: 16px 24px;
            text-align: left;
            line-height: 1.5;
            border-top: 1px solid #b27373;
        }

        .disclaimer a {
            color: #ffd6d6;
        }

        .imgformate {
            width: 1200px;
            display: block;
        }

        @media (max-width: 600px) {
            .imgformate {
                width: 100%;
                height: auto;
            }
            .content {
                padding: 20px;
            }
            .enroll-table td, .enroll-table th {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="enrollment-container">
        <!-- Header Image (same as official template) -->
        <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png" alt="RYMA ACADEMY Banner" class="imgformate">

        <div class="content">
            <div class="greeting">Dear <strong>${grievance.studentName}</strong>,</div>
            <div class="office-line">Greetings from the Office of Academic Affairs, RYMA ACADEMY.</div>

            <div class="message">
                We have successfully received and registered your complaint. It has been forwarded to the administration for review. Please find the details of your submission below.
            </div>

            <!-- Status highlight -->
            <div class="highlight">
                ✅ <strong>Status: SUBMITTED TO ADMIN</strong> — Your complaint is now awaiting review.
            </div>

            <!-- Complaint Reference Section -->
            <div class="section-title">📄 Complaint Reference</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Student Name</td>
                    <td class="value-cell"><strong>${grievance.studentName}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Student Email</td>
                    <td class="value-cell"><strong>${grievance.studentEmail}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Counsellor</td>
                    <td class="value-cell"><strong>${counsellorName || 'N/A'}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Submission Date</td>
                    <td class="value-cell"><strong>${new Date(grievance.createdAt || Date.now()).toLocaleDateString('en-IN')}</strong></td>
                </tr>
            </table>

            <!-- Subject Section -->
            <div class="section-title">📝 Subject</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Subject</td>
                    <td class="value-cell"><strong>${grievance.subject || 'No subject specified'}</strong></td>
                </tr>
            </table>

            <!-- Complaint Description Section -->
            <div class="section-title">📋 Your Complaint</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Description</td>
                    <td class="value-cell">${grievance.complaint || 'No complaint details available'}</td>
                </tr>
            </table>

            <!-- Next Steps / Help Box -->
            <div class="help-box">
                <strong>🕰️ What Happens Next:</strong>
                <ul style="margin: 8px 0 0 20px; padding-left: 0; color: #6d3131;">
                    <li>Your complaint is now with the administration for review.</li>
                    <li>You will receive an email notification once the review is complete.</li>
                    <li>The administration may contact you for additional information if needed.</li>
                    <li>Keep this email for your records and reference.</li>
                </ul>
            </div>

            <!-- Quote Block (adapted for complaint context) -->
            <div class="quote-block">
                <span class="quote-mark">“</span>
                <p>We appreciate you bringing this matter to our attention. Every concern is an opportunity for us to grow and serve you better. Rest assured, your voice matters.</p>
                <div class="director-name">~ Mr. Parveen Jain | Director, RYMA ACADEMY</div>
            </div>

            <!-- Signature -->
            <div class="signature">
                With sincere regards,<br>
                <strong>Student Grievance Cell</strong><br>
                RYMA ACADEMY
            </div>

            <!-- Contact Footer (exactly as original) -->
            <div class="contact-footer">
                📞 +91-9873336133<br>
                📧 <a href="mailto:services@rymaacademy.com">services@rymaacademy.com</a><br>
                🌐 <a href="https://www.rymaacademy.com">www.rymaacademy.com</a><br>
                📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085
            </div>
        </div>

        <!-- Disclaimer and Footer -->
        <div class="disclaimer">
            <strong>Disclaimer:</strong> This is an electronically generated communication. The information contained herein reflects the official record of your complaint submission.
        </div>
        <div class="footer-red">
            © RYMA ACADEMY – Official Correspondence
        </div>
    </div>
</body>
</html>
    `;

    try {
      // Send email to student + BCC to admin (only here)
      await sendMail(grievance.studentEmail, "📋 Complaint Registered - Ryma Academy", submissionHtml, BCC_EMAIL);
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
    }

    res.status(201).json({ message: "Complaint submitted successfully", grievance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Counsellor view their complaints
exports.getCounsellorGrievances = async (req, res) => {
  try {
    const grievances = await StudentGrievance.find({ counsellorId: req.user._id });
    res.status(200).json(grievances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin view all complaints
exports.getAllGrievances = async (req, res) => {
  try {
    const grievances = await StudentGrievance.find().populate("counsellorId", "FullName email role");
    res.status(200).json(grievances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single complaint by ID
exports.getGrievanceById = async (req, res) => {
  try {
    const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "FullName email role");
    if (!grievance) return res.status(404).json({ message: "Complaint not found" });
    res.status(200).json(grievance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve complaint
exports.approveGrievance = async (req, res) => {
  try {
    const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "FullName email role");
    if (!grievance) return res.status(404).json({ message: "Complaint not found" });

    grievance.status = "approved";
    grievance.adminResponse = req.body.adminResponse;
    grievance.adminId = req.user._id;
    await grievance.save();

    const approvalHtml = `
      <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RYMA ACADEMY – Complaint Status Update</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f2e5e5;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .enrollment-container {
            max-width: 1200px;
            margin: auto;
            background-color: #ffffff;
            overflow: hidden;
            box-shadow: 0 12px 28px rgba(150, 30, 30, 0.2);
        }

        .content {
            padding: 28px 32px 32px;
        }

        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #3b2323;
            margin-bottom: 8px;
        }

        .greeting strong {
            color: #b13e3e;
        }

        .office-line {
            color: #7e3939;
            font-weight: 600;
            margin: 5px 0 15px;
            font-size: 16px;
        }

        .message {
            font-size: 16px;
            color: #3a2a2a;
            line-height: 1.5;
            margin: 15px 0 10px;
        }

        .highlight {
            background: #fef0f0;
            padding: 16px 20px;
            border-radius: 30px 10px 30px 10px;
            margin: 20px 0;
            border-left: 6px solid #b13e3e;
            color: #572626;
            font-weight: 500;
        }

        .section-title {
            font-size: 22px;
            font-weight: 700;
            color: #aa2929;
            border-bottom: 3px solid #e0adad;
            padding-bottom: 10px;
            margin: 30px 0 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .enroll-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 6px 18px rgba(150, 40, 40, 0.1);
            border: 1px solid #e9c1c1;
            margin-bottom: 25px;
        }

        .enroll-table td, .enroll-table th {
            padding: 14px 20px;
            border-bottom: 1px solid #f2d6d6;
            font-size: 16px;
        }

        .enroll-table tr:last-child td {
            border-bottom: none;
        }

        .label-cell {
            background-color: #fde5e5;
            color: #892b2b;
            font-weight: 700;
            width: 42%;
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

        .warning-note {
            background: #ffebeb;
            padding: 18px 24px;
            border-radius: 60px 10px 60px 10px;
            margin: 28px 0 20px;
            color: #792e2e;
            font-size: 15px;
            text-align: center;
            border: 1px solid #e2acac;
        }

        .help-box {
            background-color: #fadfdf;
            border-radius: 30px;
            padding: 18px 25px;
            margin: 25px 0;
            border: 1px solid #d69494;
            color: #6d3131;
        }

        .help-box a {
            color: #a23131;
            font-weight: 600;
            text-decoration: underline;
        }

        .quote-block {
            background: #fff3f3;
            border-radius: 40px 12px 40px 12px;
            padding: 22px 26px;
            margin: 20px 0 25px;
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
            margin: 8px 0 10px 0;
            font-weight: 500;
        }

        .director-name {
            font-weight: 700;
            color: #862b2b;
            text-align: right;
            font-size: 16px;
        }

        .signature {
            margin: 30px 0 20px;
            color: #592525;
        }

        .contact-footer {
            background: #fae1e1;
            padding: 18px 25px;
            border-radius: 30px;
            color: #6d3131;
            font-size: 15px;
            margin: 20px 0;
            word-break: break-word;
        }

        .contact-footer a {
            color: #a13030;
            text-decoration: underline;
        }

        .footer-red {
            background-color: #8f2626;
            padding: 18px 28px;
            text-align: center;
            color: #ffd7d7;
            font-size: 14px;
            border-top: 3px solid #b33a3a;
        }

        .disclaimer {
            font-size: 12px;
            color: #ffe5e5;
            background-color: #6d2b2b;
            padding: 16px 24px;
            text-align: left;
            line-height: 1.5;
            border-top: 1px solid #b27373;
        }

        .disclaimer a {
            color: #ffd6d6;
        }

        .imgformate {
            width: 1200px;
            display: block;
        }

        @media (max-width: 600px) {
            .imgformate {
                width: 100%;
                height: auto;
            }
            .content {
                padding: 20px;
            }
            .enroll-table td, .enroll-table th {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="enrollment-container">
        <!-- Header Image (same as official template) -->
        <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png" alt="RYMA ACADEMY Banner" class="imgformate">

        <div class="content">
            <div class="greeting">Dear <strong>${grievance.studentName}</strong>,</div>
            <div class="office-line">Greetings from the Office of Academic Affairs, RYMA ACADEMY.</div>

            <div class="message">
                We are pleased to inform you that your complaint has been reviewed and <strong>approved</strong> by the administration. The details of the resolution are provided below.
            </div>

            <!-- Status highlight (positive message) -->
            <div class="highlight">
                ✅ <strong>Status: APPROVED</strong> — Your complaint has been resolved in your favor.
            </div>

            <!-- Subject Section -->
            <div class="section-title">📝 Subject</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Subject</td>
                    <td class="value-cell"><strong>${grievance.subject || 'No subject specified'}</strong></td>
                </tr>
            </table>

            <!-- Original Complaint Section -->
            <div class="section-title">📋 Your Complaint</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Description</td>
                    <td class="value-cell">${grievance.complaint || 'No complaint details available'}</td>
                </tr>
            </table>

            <!-- Admin Response Section -->
            <div class="section-title">💬 Admin Response</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Response</td>
                    <td class="value-cell">${grievance.adminResponse || 'No specific response provided'}</td>
                </tr>
            </table>

            <!-- Next Steps / Help Box (styled as help-box) -->
            <div class="help-box">
                <strong>📋 What's Next:</strong>
                <ul style="margin: 8px 0 0 20px; padding-left: 0; color: #6d3131;">
                    <li>Your complaint has been resolved in your favor.</li>
                    <li>The necessary actions will be taken as indicated in the admin response.</li>
                    <li>If you have any follow-up questions, please contact your counsellor or administration.</li>
                    <li>Keep this email for your records.</li>
                </ul>
            </div>

            <!-- Quote Block (adapted for approval context) -->
            <div class="quote-block">
                <span class="quote-mark">“</span>
                <p>We thank you for your patience and trust. Your feedback is a gift that helps us grow stronger together.</p>
                <div class="director-name">~ Mr. Parveen Jain | Director, RYMA ACADEMY</div>
            </div>

            <!-- Signature -->
            <div class="signature">
                With sincere regards,<br>
                <strong>Student Grievance Cell</strong><br>
                RYMA ACADEMY
            </div>

            <!-- Contact Footer (exactly as original) -->
            <div class="contact-footer">
                📞 +91-9873336133<br>
                📧 <a href="mailto:services@rymaacademy.com">services@rymaacademy.com</a><br>
                🌐 <a href="https://www.rymaacademy.com">www.rymaacademy.com</a><br>
                📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085
            </div>
        </div>

        <!-- Disclaimer and Footer -->
        <div class="disclaimer">
            <strong>Disclaimer:</strong> This is an electronically generated communication. The information contained herein reflects the official decision of the administration regarding your complaint.
        </div>
        <div class="footer-red">
            © RYMA ACADEMY – Official Correspondence
        </div>
    </div>
</body>
</html>
    `;

    try {
      // Send mail to student (no BCC)
      await sendMail(grievance.studentEmail, "🎉 Student Complaint Approved - Ryma Academy", approvalHtml);

      // Notify counsellor (no BCC) — only if different from student email
      if (grievance.counsellorId?.email && grievance.counsellorId.email !== grievance.studentEmail) {
        await sendMail(grievance.counsellorId.email, "🎉 Student Complaint Approved - Ryma Academy", approvalHtml);
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
    }

    res.status(200).json({ message: "Complaint approved", grievance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject complaint
exports.rejectGrievance = async (req, res) => {
  try {
    const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "FullName email role");
    if (!grievance) return res.status(404).json({ message: "Complaint not found" });

    grievance.status = "rejected";
    grievance.adminResponse = req.body.adminResponse;
    grievance.adminId = req.user._id;
    await grievance.save();

    const rejectionHtml = `
      <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RYMA ACADEMY – Complaint Status Update</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f2e5e5;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .enrollment-container {
            max-width: 1200px;
            margin: auto;
            background-color: #ffffff;
            overflow: hidden;
            box-shadow: 0 12px 28px rgba(150, 30, 30, 0.2);
        }

        .content {
            padding: 28px 32px 32px;
        }

        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #3b2323;
            margin-bottom: 8px;
        }

        .greeting strong {
            color: #b13e3e;
        }

        .office-line {
            color: #7e3939;
            font-weight: 600;
            margin: 5px 0 15px;
            font-size: 16px;
        }

        .message {
            font-size: 16px;
            color: #3a2a2a;
            line-height: 1.5;
            margin: 15px 0 10px;
        }

        .highlight {
            background: #fef0f0;
            padding: 16px 20px;
            border-radius: 30px 10px 30px 10px;
            margin: 20px 0;
            border-left: 6px solid #b13e3e;
            color: #572626;
            font-weight: 500;
        }

        .section-title {
            font-size: 22px;
            font-weight: 700;
            color: #aa2929;
            border-bottom: 3px solid #e0adad;
            padding-bottom: 10px;
            margin: 30px 0 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .enroll-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 6px 18px rgba(150, 40, 40, 0.1);
            border: 1px solid #e9c1c1;
            margin-bottom: 25px;
        }

        .enroll-table td, .enroll-table th {
            padding: 14px 20px;
            border-bottom: 1px solid #f2d6d6;
            font-size: 16px;
        }

        .enroll-table tr:last-child td {
            border-bottom: none;
        }

        .label-cell {
            background-color: #fde5e5;
            color: #892b2b;
            font-weight: 700;
            width: 42%;
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

        .warning-note {
            background: #ffebeb;
            padding: 18px 24px;
            border-radius: 60px 10px 60px 10px;
            margin: 28px 0 20px;
            color: #792e2e;
            font-size: 15px;
            text-align: center;
            border: 1px solid #e2acac;
        }

        .help-box {
            background-color: #fadfdf;
            border-radius: 30px;
            padding: 18px 25px;
            margin: 25px 0;
            border: 1px solid #d69494;
            color: #6d3131;
        }

        .help-box a {
            color: #a23131;
            font-weight: 600;
            text-decoration: underline;
        }

        .quote-block {
            background: #fff3f3;
            border-radius: 40px 12px 40px 12px;
            padding: 22px 26px;
            margin: 20px 0 25px;
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
            margin: 8px 0 10px 0;
            font-weight: 500;
        }

        .director-name {
            font-weight: 700;
            color: #862b2b;
            text-align: right;
            font-size: 16px;
        }

        .signature {
            margin: 30px 0 20px;
            color: #592525;
        }

        .contact-footer {
            background: #fae1e1;
            padding: 18px 25px;
            border-radius: 30px;
            color: #6d3131;
            font-size: 15px;
            margin: 20px 0;
            word-break: break-word;
        }

        .contact-footer a {
            color: #a13030;
            text-decoration: underline;
        }

        .footer-red {
            background-color: #8f2626;
            padding: 18px 28px;
            text-align: center;
            color: #ffd7d7;
            font-size: 14px;
            border-top: 3px solid #b33a3a;
        }

        .disclaimer {
            font-size: 12px;
            color: #ffe5e5;
            background-color: #6d2b2b;
            padding: 16px 24px;
            text-align: left;
            line-height: 1.5;
            border-top: 1px solid #b27373;
        }

        .disclaimer a {
            color: #ffd6d6;
        }

        .imgformate {
            width: 1200px;
            display: block;
        }

        @media (max-width: 600px) {
            .imgformate {
                width: 100%;
                height: auto;
            }
            .content {
                padding: 20px;
            }
            .enroll-table td, .enroll-table th {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="enrollment-container">
        <!-- Header Image (same as official template) -->
        <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png" alt="RYMA ACADEMY Banner" class="imgformate">

        <div class="content">
            <div class="greeting">Dear <strong>${grievance.studentName}</strong>,</div>
            <div class="office-line">Greetings from the Office of Academic Affairs, RYMA ACADEMY.</div>

            <div class="message">
                We have completed the review of your complaint. After careful consideration, we regret to inform you that your complaint has been <strong>rejected</strong>. The details of the decision are provided below.
            </div>

            <!-- Rejection status highlight (warning-note style) -->
            <div class="warning-note">
                ❌ <strong>Status: REJECTED</strong> — Your complaint did not meet the criteria for approval at this time.
            </div>

            <!-- Subject Section -->
            <div class="section-title">📝 Subject</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Subject</td>
                    <td class="value-cell"><strong>${grievance.subject || 'No subject specified'}</strong></td>
                </tr>
            </table>

            <!-- Original Complaint Section -->
            <div class="section-title">📋 Your Complaint</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Description</td>
                    <td class="value-cell">${grievance.complaint || 'No complaint details available'}</td>
                </tr>
            </table>

            <!-- Admin Response Section -->
            <div class="section-title">💬 Admin Response</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Response</td>
                    <td class="value-cell">${grievance.adminResponse || 'No specific response provided'}</td>
                </tr>
            </table>

            <!-- Next Steps / Help Box (styled as help-box) -->
            <div class="help-box">
                <strong>📞 What You Can Do Next:</strong>
                <ul style="margin: 8px 0 0 20px; padding-left: 0; color: #6d3131;">
                    <li>Review the admin response carefully for more details.</li>
                    <li>If you have additional evidence or information, you may submit a new complaint.</li>
                    <li>Contact your counsellor to discuss your concerns further.</li>
                    <li>Reach out to student services if you need support or guidance.</li>
                </ul>
            </div>

            <!-- Quote Block (adapted for rejection context) -->
            <div class="quote-block">
                <span class="quote-mark">“</span>
                <p>We understand that this may be disappointing. Please know that every concern is taken seriously, and we encourage you to continue sharing your feedback. Your voice is important to us.</p>
                <div class="director-name">~ Mr. Parveen Jain | Director, RYMA ACADEMY</div>
            </div>

            <!-- Signature -->
            <div class="signature">
                With sincere regards,<br>
                <strong>Student Grievance Cell</strong><br>
                RYMA ACADEMY
            </div>

            <!-- Contact Footer (exactly as original) -->
            <div class="contact-footer">
                📞 +91-9873336133<br>
                📧 <a href="mailto:services@rymaacademy.com">services@rymaacademy.com</a><br>
                🌐 <a href="https://www.rymaacademy.com">www.rymaacademy.com</a><br>
                📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085
            </div>
        </div>

        <!-- Disclaimer and Footer -->
        <div class="disclaimer">
            <strong>Disclaimer:</strong> This is an electronically generated communication. The information contained herein reflects the official decision of the administration regarding your complaint.
        </div>
        <div class="footer-red">
            © RYMA ACADEMY – Official Correspondence
        </div>
    </div>
</body>
</html>
    `;

    try {
      // Send mail to student (no BCC)
      await sendMail(grievance.studentEmail, "📋 Student Complaint Decision - Ryma Academy", rejectionHtml);

      // Notify counsellor (no BCC) — only if different from student email
      if (grievance.counsellorId?.email && grievance.counsellorId.email !== grievance.studentEmail) {
        await sendMail(grievance.counsellorId.email, "📋 Student Complaint Decision - Ryma Academy", rejectionHtml);
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
    }

    res.status(200).json({ message: "Complaint rejected", grievance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update complaint
exports.updateGrievance = async (req, res) => {
  try {
    const grievance = await StudentGrievance.findById(req.params.id);
    if (!grievance) return res.status(404).json({ message: "Complaint not found" });

    if (["approved", "rejected"].includes(grievance.status)) {
      return res.status(403).json({ message: "Cannot edit/delete after admin action" });
    }

    Object.assign(grievance, req.body);
    await grievance.save();

    const updateHtml = `
      <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RYMA ACADEMY – Complaint Updated</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f2e5e5;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .enrollment-container {
            max-width: 1200px;
            margin: auto;
            background-color: #ffffff;
            overflow: hidden;
            box-shadow: 0 12px 28px rgba(150, 30, 30, 0.2);
        }

        .content {
            padding: 28px 32px 32px;
        }

        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #3b2323;
            margin-bottom: 8px;
        }

        .greeting strong {
            color: #b13e3e;
        }

        .office-line {
            color: #7e3939;
            font-weight: 600;
            margin: 5px 0 15px;
            font-size: 16px;
        }

        .message {
            font-size: 16px;
            color: #3a2a2a;
            line-height: 1.5;
            margin: 15px 0 10px;
        }

        .highlight {
            background: #fef0f0;
            padding: 16px 20px;
            border-radius: 30px 10px 30px 10px;
            margin: 20px 0;
            border-left: 6px solid #b13e3e;
            color: #572626;
            font-weight: 500;
        }

        .section-title {
            font-size: 22px;
            font-weight: 700;
            color: #aa2929;
            border-bottom: 3px solid #e0adad;
            padding-bottom: 10px;
            margin: 30px 0 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .enroll-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 6px 18px rgba(150, 40, 40, 0.1);
            border: 1px solid #e9c1c1;
            margin-bottom: 25px;
        }

        .enroll-table td, .enroll-table th {
            padding: 14px 20px;
            border-bottom: 1px solid #f2d6d6;
            font-size: 16px;
        }

        .enroll-table tr:last-child td {
            border-bottom: none;
        }

        .label-cell {
            background-color: #fde5e5;
            color: #892b2b;
            font-weight: 700;
            width: 42%;
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

        .warning-note {
            background: #ffebeb;
            padding: 18px 24px;
            border-radius: 60px 10px 60px 10px;
            margin: 28px 0 20px;
            color: #792e2e;
            font-size: 15px;
            text-align: center;
            border: 1px solid #e2acac;
        }

        .help-box {
            background-color: #fadfdf;
            border-radius: 30px;
            padding: 18px 25px;
            margin: 25px 0;
            border: 1px solid #d69494;
            color: #6d3131;
        }

        .help-box a {
            color: #a23131;
            font-weight: 600;
            text-decoration: underline;
        }

        .quote-block {
            background: #fff3f3;
            border-radius: 40px 12px 40px 12px;
            padding: 22px 26px;
            margin: 20px 0 25px;
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
            margin: 8px 0 10px 0;
            font-weight: 500;
        }

        .director-name {
            font-weight: 700;
            color: #862b2b;
            text-align: right;
            font-size: 16px;
        }

        .signature {
            margin: 30px 0 20px;
            color: #592525;
        }

        .contact-footer {
            background: #fae1e1;
            padding: 18px 25px;
            border-radius: 30px;
            color: #6d3131;
            font-size: 15px;
            margin: 20px 0;
            word-break: break-word;
        }

        .contact-footer a {
            color: #a13030;
            text-decoration: underline;
        }

        .footer-red {
            background-color: #8f2626;
            padding: 18px 28px;
            text-align: center;
            color: #ffd7d7;
            font-size: 14px;
            border-top: 3px solid #b33a3a;
        }

        .disclaimer {
            font-size: 12px;
            color: #ffe5e5;
            background-color: #6d2b2b;
            padding: 16px 24px;
            text-align: left;
            line-height: 1.5;
            border-top: 1px solid #b27373;
        }

        .disclaimer a {
            color: #ffd6d6;
        }

        .imgformate {
            width: 1200px;
            display: block;
        }

        @media (max-width: 600px) {
            .imgformate {
                width: 100%;
                height: auto;
            }
            .content {
                padding: 20px;
            }
            .enroll-table td, .enroll-table th {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="enrollment-container">
        <!-- Header Image (same as official template) -->
        <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png" alt="RYMA ACADEMY Banner" class="imgformate">

        <div class="content">
            <div class="greeting">Dear <strong>${grievance.studentName}</strong>,</div>
            <div class="office-line">Greetings from the Office of Academic Affairs, RYMA ACADEMY.</div>

            <div class="message">
                We confirm that your complaint has been updated successfully. The revised details have been recorded and will be reviewed by the administration. Please find the updated information below.
            </div>

            <!-- Status highlight (update confirmation) -->
            <div class="highlight">
                ♻️ <strong>Status: UPDATED</strong> — Your complaint has been modified as requested.
            </div>

            <!-- Subject Section -->
            <div class="section-title">📝 Subject</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Subject</td>
                    <td class="value-cell"><strong>${grievance.subject || 'No subject specified'}</strong></td>
                </tr>
            </table>

            <!-- Updated Complaint Section -->
            <div class="section-title">📋 Updated Complaint</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Description</td>
                    <td class="value-cell">${grievance.complaint || 'No complaint details available'}</td>
                </tr>
            </table>

            <!-- Important Note / Next Steps (styled as help-box) -->
            <div class="help-box">
                <strong>📌 Important Note:</strong>
                <ul style="margin: 8px 0 0 20px; padding-left: 0; color: #6d3131;">
                    <li>Your complaint has been successfully updated in our system.</li>
                    <li>The updated complaint is now under review by the administration.</li>
                    <li>You will receive another notification once the review is complete.</li>
                    <li>If you need to make further changes, please contact your counsellor.</li>
                </ul>
            </div>

            <!-- Quote Block (adapted for update context) -->
            <div class="quote-block">
                <span class="quote-mark">“</span>
                <p>Thank you for keeping us informed. Your active participation ensures that we can serve you better. We appreciate your engagement.</p>
                <div class="director-name">~ Mr. Parveen Jain | Director, RYMA ACADEMY</div>
            </div>

            <!-- Signature -->
            <div class="signature">
                With sincere regards,<br>
                <strong>Student Grievance Cell</strong><br>
                RYMA ACADEMY
            </div>

            <!-- Contact Footer (exactly as original) -->
            <div class="contact-footer">
                📞 +91-9873336133<br>
                📧 <a href="mailto:services@rymaacademy.com">services@rymaacademy.com</a><br>
                🌐 <a href="https://www.rymaacademy.com">www.rymaacademy.com</a><br>
                📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085
            </div>
        </div>

        <!-- Disclaimer and Footer -->
        <div class="disclaimer">
            <strong>Disclaimer:</strong> This is an electronically generated communication. The information contained herein reflects the current status of your complaint in our system.
        </div>
        <div class="footer-red">
            © RYMA ACADEMY – Official Correspondence
        </div>
    </div>
</body>
</html>
    `;

    try {
      // Send email to student (no BCC)
      await sendMail(grievance.studentEmail, "📝 Student Complaint Updated - Ryma Academy", updateHtml);
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
    }

    res.status(200).json({ message: "Complaint updated", grievance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete complaint
exports.deleteGrievance = async (req, res) => {
  try {
    const grievance = await StudentGrievance.findById(req.params.id);
    if (!grievance) return res.status(404).json({ message: "Complaint not found" });

    if (["approved", "rejected"].includes(grievance.status)) {
      return res.status(403).json({ message: "Cannot delete after admin action" });
    }

    await grievance.deleteOne();
    res.status(200).json({ message: "Complaint deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search students whose admission is approved by student name
exports.searchStudentByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Name query is required" });

    const admissions = await Admission.find({ status: "approved" })
      .populate({
        path: "student",
        match: { name: { $regex: name, $options: "i" } },
        select: "name email phone studentId",
      })
      .populate("course", "name");

    const filteredAdmissions = admissions.filter(a => a.student);

    const students = filteredAdmissions.map(a => ({
      admissionId: a._id,
      admissionNo: a.admissionNo,
      studentId: a.student._id,
      studentName: a.student.name,
      email: a.student.email,
      phone: a.student.phone,
      course: a.course?.name || "",
      counsellor: a.counsellor,
      trainingBranch: a.trainingBranch,
    }));

    res.status(200).json(students);
  } catch (error) {
    console.error("Search student error:", error);
    res.status(500).json({ message: error.message });
  }
};
