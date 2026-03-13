


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
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complaint Registration Confirmation</title>
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
          .confirmation-message {
            text-align: center;
            margin-bottom: 30px;
          }
          .confirmation-message h2 {
            color: #007bff;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .status-badge {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            text-align: center;
            margin: 20px 0;
            font-weight: 600;
          }
          .complaint-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .section-title {
            color: #495057;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #007bff;
          }
          .detail-content {
            background-color: #ffffff;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #007bff;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
          }
          .next-steps {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding-bottom: 8px;
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
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Complaint Registered</h1>
          </div>
          
          <div class="content">
            <div class="confirmation-message">
              <h2>Complaint Successfully Submitted!</h2>
              <p>Hello ${grievance.studentName}, your complaint has been registered and submitted to the administration for review.</p>
            </div>

            <div class="status-badge">
              ✅ Status: SUBMITTED TO ADMIN
            </div>

            <!-- Complaint Details Section -->
            <div class="complaint-details">
              <div class="section-title">📄 Complaint Reference</div>
              <div class="detail-content">
                <div class="detail-row">
                  <span class="detail-label">Student Name:</span>
                  <span class="detail-value">${grievance.studentName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Student Email:</span>
                  <span class="detail-value">${grievance.studentEmail}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Counsellor:</span>
                  <span class="detail-value">${counsellorName || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Submission Date:</span>
                  <span class="detail-value">${new Date(grievance.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            </div>

            <!-- Subject Section -->
            <div class="complaint-details">
              <div class="section-title">📝 Subject</div>
              <div class="detail-content">
                ${grievance.subject || 'No subject specified'}
              </div>
            </div>

            <!-- Complaint Description Section -->
            <div class="complaint-details">
              <div class="section-title">📋 Your Complaint</div>
              <div class="detail-content">
                ${grievance.complaint || 'No complaint details available'}
              </div>
            </div>

            <div class="next-steps">
              <h4 style="margin-top: 0; color: #007bff;">🕰️ What Happens Next:</h4>
              <ul style="margin: 0;">
                <li>Your complaint is now with the administration for review</li>
                <li>You will receive an email notification once the review is complete</li>
                <li>The administration may contact you for additional information if needed</li>
                <li>Keep this email for your records and reference</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p><strong>Thank you for bringing this matter to our attention.</strong></p>
              <p>We take all student concerns seriously and will review your complaint thoroughly.</p>
            </div>
          </div>

         <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fae1e1; border-radius:30px; margin:20px 0;" bgcolor="#fae1e1">
              <tr>
                <td style="padding:18px 25px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#6d3131; font-size:15px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;">📞 +91-9873336133</td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;"><a href="mailto:services@rymaacademy.com" style="color:#a13030; text-decoration:underline;">services@rymaacademy.com</a></td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;"><a href="https://www.rymaacademy.com" style="color:#a13030; text-decoration:underline;">www.rymaacademy.com</a></td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:8px 0 4px; word-break:break-word;">📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085</td></tr></table>
                </td>
              </tr>
            </table>
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
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Student Complaint Status Update</title>
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
          .status-message {
            text-align: center;
            margin-bottom: 30px;
          }
          .status-message h2 {
            color: #28a745;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .status-badge {
            background-color: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            text-align: center;
            margin: 20px 0;
            font-weight: 600;
          }
          .complaint-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .section-title {
            color: #495057;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #28a745;
          }
          .detail-content {
            background-color: #ffffff;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #28a745;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
          }
          .next-steps {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Complaint Approved</h1>
          </div>
          
          <div class="content">
            <div class="status-message">
              <h2>Great News!</h2>
              <p>Hello ${grievance.studentName}, your complaint has been <strong>approved</strong> by the administration.</p>
            </div>

            <div class="status-badge">
              ✅ Status: APPROVED
            </div>

            <!-- Subject Section -->
            <div class="complaint-details">
              <div class="section-title">📝 Subject</div>
              <div class="detail-content">
                ${grievance.subject || 'No subject specified'}
              </div>
            </div>

            <!-- Original Complaint Section -->
            <div class="complaint-details">
              <div class="section-title">📋 Your Complaint</div>
              <div class="detail-content">
                ${grievance.complaint || 'No complaint details available'}
              </div>
            </div>

            <!-- Admin Response Section -->
            <div class="complaint-details">
              <div class="section-title">💬 Admin Response</div>
              <div class="detail-content">
                ${grievance.adminResponse || 'No specific response provided'}
              </div>
            </div>

            <div class="next-steps">
              <h4 style="margin-top: 0; color: #007bff;">📋 What's Next:</h4>
              <ul style="margin: 0;">
                <li>Your complaint has been resolved in your favor</li>
                <li>The necessary actions will be taken as indicated in the admin response</li>
                <li>If you have any follow-up questions, please contact your counsellor or administration</li>
                <li>Keep this email for your records</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p><strong>Thank you for bringing this matter to our attention.</strong></p>
              <p>Your feedback helps us improve our services for all students.</p>
            </div>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fae1e1; border-radius:30px; margin:20px 0;" bgcolor="#fae1e1">
              <tr>
                <td style="padding:18px 25px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#6d3131; font-size:15px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;">📞 +91-9873336133</td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;"><a href="mailto:services@rymaacademy.com" style="color:#a13030; text-decoration:underline;">services@rymaacademy.com</a></td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;"><a href="https://www.rymaacademy.com" style="color:#a13030; text-decoration:underline;">www.rymaacademy.com</a></td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:8px 0 4px; word-break:break-word;">📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085</td></tr></table>
                </td>
              </tr>
            </table>
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
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Student Complaint Status Update</title>
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
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
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
          .status-message {
            text-align: center;
            margin-bottom: 30px;
          }
          .status-message h2 {
            color: #dc3545;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .status-badge {
            background-color: #dc3545;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            text-align: center;
            margin: 20px 0;
            font-weight: 600;
          }
          .complaint-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .section-title {
            color: #495057;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #dc3545;
          }
          .detail-content {
            background-color: #ffffff;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #dc3545;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
          }
          .next-steps {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Complaint Decision</h1>
          </div>
          
          <div class="content">
            <div class="status-message">
              <h2>Complaint Review Complete</h2>
              <p>Hello ${grievance.studentName}, we have completed the review of your complaint.</p>
            </div>

            <div class="status-badge">
              ❌ Status: REJECTED
            </div>

            <!-- Subject Section -->
            <div class="complaint-details">
              <div class="section-title">📝 Subject</div>
              <div class="detail-content">
                ${grievance.subject || 'No subject specified'}
              </div>
            </div>

            <!-- Original Complaint Section -->
            <div class="complaint-details">
              <div class="section-title">📋 Your Complaint</div>
              <div class="detail-content">
                ${grievance.complaint || 'No complaint details available'}
              </div>
            </div>

            <!-- Admin Response Section -->
            <div class="complaint-details">
              <div class="section-title">💬 Admin Response</div>
              <div class="detail-content">
                ${grievance.adminResponse || 'No specific response provided'}
              </div>
            </div>

            <div class="next-steps">
              <h4 style="margin-top: 0; color: #856404;">📞 What You Can Do Next:</h4>
              <ul style="margin: 0;">
                <li>Review the admin response carefully for more details</li>
                <li>If you have additional evidence or information, you may submit a new complaint</li>
                <li>Contact your counsellor to discuss your concerns further</li>
                <li>Reach out to student services if you need support or guidance</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p><strong>We appreciate you bringing this matter to our attention.</strong></p>
              <p>All student concerns are taken seriously and reviewed thoroughly.</p>
            </div>
          </div>

         <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fae1e1; border-radius:30px; margin:20px 0;" bgcolor="#fae1e1">
              <tr>
                <td style="padding:18px 25px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#6d3131; font-size:15px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;">📞 +91-9873336133</td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;"><a href="mailto:services@rymaacademy.com" style="color:#a13030; text-decoration:underline;">services@rymaacademy.com</a></td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;"><a href="https://www.rymaacademy.com" style="color:#a13030; text-decoration:underline;">www.rymaacademy.com</a></td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:8px 0 4px; word-break:break-word;">📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085</td></tr></table>
                </td>
              </tr>
            </table>
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
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Student Complaint Updated</title>
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
          .status-message {
            text-align: center;
            margin-bottom: 30px;
          }
          .status-message h2 {
            color: #007bff;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .status-badge {
            background-color: #17a2b8;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            text-align: center;
            margin: 20px 0;
            font-weight: 600;
          }
          .complaint-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .section-title {
            color: #495057;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #007bff;
          }
          .detail-content {
            background-color: #ffffff;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #17a2b8;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
          }
          .info-box {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Complaint Updated</h1>
          </div>
          
          <div class="content">
            <div class="status-message">
              <h2>Update Confirmation</h2>
              <p>Hello ${grievance.studentName}, your complaint has been updated successfully.</p>
            </div>

            <div class="status-badge">
              ♻️ Status: UPDATED
            </div>

            <!-- Subject Section -->
            <div class="complaint-details">
              <div class="section-title">📝 Subject</div>
              <div class="detail-content">
                ${grievance.subject || 'No subject specified'}
              </div>
            </div>

            <!-- Updated Complaint Section -->
            <div class="complaint-details">
              <div class="section-title">📋 Updated Complaint</div>
              <div class="detail-content">
                ${grievance.complaint || 'No complaint details available'}
              </div>
            </div>

            <div class="info-box">
              <h4 style="margin-top: 0; color: #007bff;">📌 Important Note:</h4>
              <ul style="margin: 0;">
                <li>Your complaint has been successfully updated in our system</li>
                <li>The updated complaint is now under review by the administration</li>
                <li>You will receive another notification once the review is complete</li>
                <li>If you need to make further changes, please contact your counsellor</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p><strong>Thank you for keeping us informed.</strong></p>
              <p>We will review your updated complaint and respond accordingly.</p>
            </div>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fae1e1; border-radius:30px; margin:20px 0;" bgcolor="#fae1e1">
              <tr>
                <td style="padding:18px 25px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#6d3131; font-size:15px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;">📞 +91-9873336133</td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;"><a href="mailto:services@rymaacademy.com" style="color:#a13030; text-decoration:underline;">services@rymaacademy.com</a></td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;"><a href="https://www.rymaacademy.com" style="color:#a13030; text-decoration:underline;">www.rymaacademy.com</a></td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:8px 0 4px; word-break:break-word;">📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085</td></tr></table>
                </td>
              </tr>
            </table>
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
