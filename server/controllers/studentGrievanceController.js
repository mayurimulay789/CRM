


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
const sendMail = require("../utils/email");

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

    const message = `Hello ${grievance.studentName}, your complaint has been registered successfully.`;

    try {
      // Send email to student + BCC to admin (only here)
      await sendMail(grievance.studentEmail, "Complaint Registered", message, BCC_EMAIL);
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
    const grievances = await StudentGrievance.find().populate("counsellorId", "email");
    res.status(200).json(grievances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single complaint by ID
exports.getGrievanceById = async (req, res) => {
  try {
    const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "email");
    if (!grievance) return res.status(404).json({ message: "Complaint not found" });
    res.status(200).json(grievance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve complaint
exports.approveGrievance = async (req, res) => {
  try {
    const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "email");
    if (!grievance) return res.status(404).json({ message: "Complaint not found" });

    grievance.status = "approved";
    grievance.adminResponse = req.body.adminResponse;
    grievance.adminId = req.user._id;
    await grievance.save();

    const message = `Hello ${grievance.studentName},<br/>
      Your complaint has been <b>approved</b>.<br/>
      <b>Admin Response:</b> ${grievance.adminResponse}
    `;

    try {
      // Send mail to student (no BCC)
      await sendMail(grievance.studentEmail, "Complaint Approved", message);

      // Notify counsellor (no BCC)
      if (grievance.counsellorId?.email) {
        await sendMail(grievance.counsellorId.email, "Complaint Approved", message);
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
    const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "email");
    if (!grievance) return res.status(404).json({ message: "Complaint not found" });

    grievance.status = "rejected";
    grievance.adminResponse = req.body.adminResponse;
    grievance.adminId = req.user._id;
    await grievance.save();

    const message = `Hello ${grievance.studentName},<br/>
      Your complaint has been <b>rejected</b>.<br/>
      <b>Admin Response:</b> ${grievance.adminResponse}
    `;

    try {
      // Send mail to student (no BCC)
      await sendMail(grievance.studentEmail, "Complaint Rejected", message);

      // Notify counsellor (no BCC)
      if (grievance.counsellorId?.email) {
        await sendMail(grievance.counsellorId.email, "Complaint Rejected", message);
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

    const message = `Hello ${grievance.studentName}, your complaint has been updated successfully.`;

    try {
      // Send email to student (no BCC)
      await sendMail(grievance.studentEmail, "Complaint Updated", message);
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
