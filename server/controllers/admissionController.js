const Admission = require('../models/Admission');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const sendMail = require('../utils/email');

const getAllAdmissions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      status,
      counsellor,
      trainingBranch,
      sortBy = 'admissionDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { admissionNo: { $regex: search, $options: 'i' } },
        { counsellor: { $regex: search, $options: 'i' } },
        { trainingBranch: { $regex: search, $options: 'i' } },
        { appliedBatch: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Counsellor filter
    if (counsellor) {
      filter.counsellor = { $regex: counsellor, $options: 'i' };
    }

    // Training branch filter
    if (trainingBranch) {
      filter.trainingBranch = { $regex: trainingBranch, $options: 'i' };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const admissions = await Admission.find(filter)
      .populate('student', 'studentId name email phone alternateEmail alternatePhone dateOfBirth gender')
      .populate('course', 'name code fee duration')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    // Get total count for pagination
    const total = await Admission.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: admissions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: admissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admissions',
      error: error.message
    });
  }
};

const getAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id)
      .populate('student')
      .populate('course')
      .select('-__v');

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admission',
      error: error.message
    });
  }
};

const getAdmissionByAdmissionNo = async (req, res) => {
  try {
    const admission = await Admission.findOne({ admissionNo: req.params.admissionNo })
      .populate('student')
      .populate('course')
      .select('-__v');

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admission',
      error: error.message
    });
  }
};

const getAdmissionsByStudent = async (req, res) => {
  try {
    const admissions = await Admission.find({ student: req.params.studentId })
      .populate('course', 'name code fee duration')
      .sort({ admissionDate: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: admissions.length,
      data: admissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student admissions',
      error: error.message
    });
  }
};

const getAdmissionsByCourse = async (req, res) => {
  try {
    const admissions = await Admission.find({ course: req.params.courseId })
      .populate('student', 'studentId name email phone')
      .sort({ admissionDate: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: admissions.length,
      data: admissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course admissions',
      error: error.message
    });
  }
};

const createAdmission = async (req, res) => {
  console.log('=== ADMISSION CREATION STARTED ===');
  
  try {
    const {
      student,
      course,
      trainingBranch,
      counsellor,
      termsCondition,
      priority,
      appliedBatch,
      source,
      notes
      // Remove file fields from req.body since they'll come from files
    } = req.body;

    console.log('1. Reading request body...');
    console.log('Request body data:', {
      student,
      course,
      trainingBranch,
      counsellor,
      termsCondition,
      priority,
      appliedBatch,
      source
    });

    console.log('2. Checking uploaded files...');
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');

    // Handle file uploads to Cloudinary
    let admissionFrontPageUrl = '';
    let admissionBackPageUrl = '';
    let studentStatementUrl = '';
    let confidentialFormUrl = '';

    if (req.files) {
      try {
        console.log('3. Starting file uploads to Cloudinary...');
        
        if (req.files.admissionFrontPage && req.files.admissionFrontPage[0]) {
          const file = req.files.admissionFrontPage[0];
          console.log('📄 Uploading admission front page:', file.originalname);
          admissionFrontPageUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/front-pages');
          console.log('✅ Admission front page uploaded:', admissionFrontPageUrl);
        }

        if (req.files.admissionBackPage && req.files.admissionBackPage[0]) {
          const file = req.files.admissionBackPage[0];
          console.log('📄 Uploading admission back page:', file.originalname);
          admissionBackPageUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/back-pages');
          console.log('✅ Admission back page uploaded:', admissionBackPageUrl);
        }

        if (req.files.studentStatement && req.files.studentStatement[0]) {
          const file = req.files.studentStatement[0];
          console.log('📄 Uploading student statement:', file.originalname);
          studentStatementUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/statements');
          console.log('✅ Student statement uploaded:', studentStatementUrl);
        }

        if (req.files.confidentialForm && req.files.confidentialForm[0]) {
          const file = req.files.confidentialForm[0];
          console.log('📄 Uploading confidential form:', file.originalname);
          confidentialFormUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/confidential-forms');
          console.log('✅ Confidential form uploaded:', confidentialFormUrl);
        }

        console.log('4. File uploads completed successfully');
      } catch (uploadError) {
        console.error('❌ File upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: `File upload failed: ${uploadError.message}`
        });
      }
    }

    // Check if student exists
    console.log('5. Checking student existence...');
    const studentExists = await Student.findById(student);
    console.log('Student found:', studentExists ? 'Yes' : 'No');
    if (!studentExists) {
      console.log('❌ Student not found with ID:', student);
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if course exists
    console.log('6. Checking course existence...');
    const courseExists = await Course.findById(course);
    console.log('Course found:', courseExists ? 'Yes' : 'No');
    if (!courseExists) {
      console.log('❌ Course not found with ID:', course);
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if student already has a pending admission for this course
    console.log('7. Checking existing admissions...');
    const existingAdmission = await Admission.findOne({
      student,
      course,
      status: { $in: ['pending', 'approved'] }
    });
    console.log('Existing admission found:', existingAdmission ? 'Yes' : 'No');
    
    if (existingAdmission) {
      console.log('❌ Existing admission found:', existingAdmission._id);
      return res.status(400).json({
        success: false,
        message: 'Student already has an active admission for this course'
      });
    }

    // Generate admission number
    console.log('8. Generating admission number...');
    const generateAdmissionNo = async () => {
      const year = new Date().getFullYear();
      
      // Find highest sequential number for current year
      const lastAdmission = await Admission.findOne(
        { admissionNo: new RegExp(`^ADM${year}\\d{4}$`) },
        { admissionNo: 1 },
        { sort: { admissionNo: -1 } }
      );

      if (lastAdmission && lastAdmission.admissionNo) {
        const lastNumber = parseInt(lastAdmission.admissionNo.slice(-4));
        if (!isNaN(lastNumber)) {
          const nextNumber = lastNumber + 1;
          return `ADM${year}${nextNumber.toString().padStart(4, '0')}`;
        }
      }

      // Fallback: count-based
      const count = await Admission.countDocuments({
        admissionNo: new RegExp(`^ADM${year}`),
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      });
      
      return `ADM${year}${(count + 1).toString().padStart(4, '0')}`;
    };

    const admissionNo = await generateAdmissionNo();
    console.log(`9. Final admission number: ${admissionNo}`);

    console.log('10. Preparing admission data...');
    const admissionData = {
      admissionNo,
      student,
      course,
      trainingBranch,
      counsellor: req.user.FullName,
      admissionFrontPage: admissionFrontPageUrl,
      admissionBackPage: admissionBackPageUrl,
      studentStatement: studentStatementUrl,
      confidentialForm: confidentialFormUrl,
      termsCondition: termsCondition || false,
      priority: priority || 'medium',
      appliedBatch,
      source: source || 'website',
      notes,
      admissionDate: new Date()
    };

    console.log('Admission data prepared:', {
      admissionNo,
      student,
      course,
      trainingBranch,
      counsellor: req.user.FullName,
      hasFrontPage: !!admissionFrontPageUrl,
      hasBackPage: !!admissionBackPageUrl,
      hasStatement: !!studentStatementUrl,
      hasConfidentialForm: !!confidentialFormUrl
    });

    console.log('11. Creating admission document...');
    const admission = new Admission(admissionData);
    console.log('Admission document created');

    console.log('12. Saving admission to database...');
    const savedAdmission = await admission.save();
    console.log('✅ Admission saved successfully:', savedAdmission._id);

    // Populate the saved admission
    console.log('13. Populating admission data...');
    await savedAdmission.populate('student', 'studentId name email phone');
    await savedAdmission.populate('course', 'name code fee duration');
    console.log('Population completed');

    // Remove version key from response
    console.log('14. Preparing response...');
    const admissionResponse = savedAdmission.toObject();
    delete admissionResponse.__v;

    console.log('=== ADMISSION CREATION COMPLETED SUCCESSFULLY ===');
    res.status(201).json({
      success: true,
      message: 'Admission created successfully',
      data: admissionResponse
    });

  } catch (error) {
    console.log('=== ERROR OCCURRED ===');
    console.log('Error type:', error.name);
    console.log('Error message:', error.message);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    if (error.code === 11000 && error.keyPattern?.admissionNo) {
      return res.status(400).json({
        success: false,
        message: 'System error: Please try again in a moment'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating admission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const updateAdmission = async (req, res) => {
  try {
    const {
      trainingBranch,
      termsCondition,
      status,
      priority,
      appliedBatch,
      source,
      notes
      // Remove file fields from body
    } = req.body;

    console.log('=== ADMISSION UPDATE STARTED ===');
    console.log('Request body:', req.body);
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');

    // Check if admission exists
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    // Handle file uploads for updates
    let fileUpdateData = {};
    if (req.files) {
      try {
        console.log('Starting file uploads for update...');
        
        if (req.files.admissionFrontPage && req.files.admissionFrontPage[0]) {
          const file = req.files.admissionFrontPage[0];
          console.log('📄 Uploading new admission front page:', file.originalname);
          fileUpdateData.admissionFrontPage = await uploadToCloudinary(file.buffer, 'lms/admissions/front-pages');
          
          // Delete old file if exists
          if (admission.admissionFrontPage) {
            await deleteFromCloudinary(admission.admissionFrontPage);
          }
          console.log('✅ Admission front page updated');
        }

        if (req.files.admissionBackPage && req.files.admissionBackPage[0]) {
          const file = req.files.admissionBackPage[0];
          console.log('📄 Uploading new admission back page:', file.originalname);
          fileUpdateData.admissionBackPage = await uploadToCloudinary(file.buffer, 'lms/admissions/back-pages');
          
          // Delete old file if exists
          if (admission.admissionBackPage) {
            await deleteFromCloudinary(admission.admissionBackPage);
          }
          console.log('✅ Admission back page updated');
        }

        if (req.files.studentStatement && req.files.studentStatement[0]) {
          const file = req.files.studentStatement[0];
          console.log('📄 Uploading new student statement:', file.originalname);
          fileUpdateData.studentStatement = await uploadToCloudinary(file.buffer, 'lms/admissions/statements');
          
          // Delete old file if exists
          if (admission.studentStatement) {
            await deleteFromCloudinary(admission.studentStatement);
          }
          console.log('✅ Student statement updated');
        }

        if (req.files.confidentialForm && req.files.confidentialForm[0]) {
          const file = req.files.confidentialForm[0];
          console.log('📄 Uploading new confidential form:', file.originalname);
          fileUpdateData.confidentialForm = await uploadToCloudinary(file.buffer, 'lms/admissions/confidential-forms');
          
          // Delete old file if exists
          if (admission.confidentialForm) {
            await deleteFromCloudinary(admission.confidentialForm);
          }
          console.log('✅ Confidential form updated');
        }

        console.log('File uploads completed');
      } catch (uploadError) {
        console.error('❌ File upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: `File upload failed: ${uploadError.message}`
        });
      }
    }

    // Update admission fields
    const updateData = {
      trainingBranch: trainingBranch || admission.trainingBranch,
      counsellor: req.user.FullName,
      termsCondition: termsCondition !== undefined ? termsCondition : admission.termsCondition,
      status: status || admission.status,
      priority: priority || admission.priority,
      appliedBatch: appliedBatch !== undefined ? appliedBatch : admission.appliedBatch,
      source: source || admission.source,
      notes: notes !== undefined ? notes : admission.notes,
      ...fileUpdateData
    };

    console.log('Update data prepared:', updateData);

    const updatedAdmission = await Admission.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    )
    .populate('student', 'studentId name email phone')
    .populate('course', 'name code fee duration')
    .select('-__v');

    console.log('✅ Admission updated successfully');

    res.status(200).json({
      success: true,
      message: 'Admission updated successfully',
      data: updatedAdmission
    });
  } catch (error) {
    console.error('❌ Update error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating admission',
      error: error.message
    });
  }
};

// ... rest of the functions remain the same (updateAdmissionStatus, deleteAdmission, verifyAdmissionEmail, getAdmissionStats)

// const updateAdmissionStatus = async (req, res) => {
//   try {
//     const { status, notes } = req.body;

//     // Check if admission exists
//     const admission = await Admission.findById(req.params.id);
//     if (!admission) {
//       return res.status(404).json({
//         success: false,
//         message: 'Admission not found'
//       });
//     }

//     // Validate status
//     const validStatuses = ['pending', 'approved', 'rejected', 'waiting_list'];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid status. Must be one of: pending, approved, rejected, waiting_list'
//       });
//     }

//     const updateData = {
//       status,
//       notes: notes !== undefined ? notes : admission.notes
//     };

//     const updatedAdmission = await Admission.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     )
//     .populate('student', 'studentId name email phone')
//     .populate('course', 'name code fee duration')
//     .select('-__v');

//     res.status(200).json({
//       success: true,
//       message: `Admission ${status} successfully`,
//       data: updatedAdmission
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error updating admission status',
//       error: error.message
//     });
//   }
// };

const updateAdmissionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    // Check if admission exists
    const admission = await Admission.findById(req.params.id)
      .populate('student', 'studentId name email phone')
      .populate('course', 'name code fee duration');

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'waiting_list'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, approved, rejected, waiting_list'
      });
    }

    const updateData = {
      status,
      notes: notes !== undefined ? notes : admission.notes
    };

    const updatedAdmission = await Admission.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('student', 'studentId name email phone')
    .populate('course', 'name code fee duration')
    .select('-__v');

    // Send admission confirmation email if status changed to approved
    if (status === 'approved' && admission.status !== 'approved') {
      await sendAdmissionConfirmationEmail(updatedAdmission);
    }

    res.status(200).json({
      success: true,
      message: `Admission ${status} successfully`,
      data: updatedAdmission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating admission status',
      error: error.message
    });
  }
};

/**
 * Send admission confirmation email to student and BCC
 * @param {Object} admission - Admission document with populated student and course
 */
async function sendAdmissionConfirmationEmail(admission) {
  try {
    const { student, course } = admission;
    
    if (!student || !student.email) {
      console.error('❌ Student email not found for admission:', admission.admissionNo);
      return;
    }

    // Email subject
    const subject = `🎉 Admission Confirmed - ${course.name} | ${admission.admissionNo}`;

    // Email HTML content
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admission Confirmation</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          .details {
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
          .next-steps {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .next-steps h3 {
            color: #007bff;
            margin-top: 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
          }
          .contact-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
          }
          .badge {
            display: inline-block;
            padding: 5px 10px;
            background-color: #28a745;
            color: white;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Admission Confirmed</h1>
          </div>
          
          <div class="content">
            <div class="congrats">
              <h2>Congratulations, ${student.name}! 🎉</h2>
              <p>Your admission has been successfully approved. Welcome to our institution!</p>
              <span class="badge">Admission No: ${admission.admissionNo}</span>
            </div>

            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Student Name:</span>
                <span class="detail-value">${student.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Student ID:</span>
                <span class="detail-value">${student.studentId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Course:</span>
                <span class="detail-value">${course.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Course Code:</span>
                <span class="detail-value">${course.code}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${course.duration}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Course Fee:</span>
                <span class="detail-value">₹${course.fee}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Training Branch:</span>
                <span class="detail-value">${admission.trainingBranch}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Applied Batch:</span>
                <span class="detail-value">${admission.appliedBatch || 'To be assigned'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Counsellor:</span>
                <span class="detail-value">${admission.counsellor}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Admission Date:</span>
                <span class="detail-value">${new Date(admission.admissionDate).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div class="next-steps">
              <h3>📋 Next Steps</h3>
              <ul>
                <li>Complete your course registration process</li>
                <li>Pay the course fee as per the payment schedule</li>
                <li>Attend the orientation session (date will be communicated soon)</li>
                <li>Keep your student ID and admission number handy for future reference</li>
              </ul>
            </div>

            <div class="contact-info">
              <h3>📞 Contact Information</h3>
              <p>If you have any questions, please contact your counsellor:</p>
              <p><strong>${admission.counsellor}</strong></p>
              <p>Or reach out to our admission helpdesk.</p>
            </div>

            <p style="text-align: center; color: #6c757d; font-style: italic;">
              We're excited to have you join our learning community! 🚀
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

    // Send email to student with BCC for submission
    await sendMail(student.email, subject, html, true);
    
    console.log(`✅ Admission confirmation email sent to ${student.email} with BCC`);

  } catch (error) {
    console.error('❌ Failed to send admission confirmation email:', error.message);
    // Don't throw error to avoid breaking the main admission update process
  }
}

const deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    // Check if admission can be deleted (only pending admissions can be deleted)
    if (admission.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending admissions can be deleted'
      });
    }

    // Delete files from Cloudinary before deleting admission
    try {
      if (admission.admissionFrontPage) {
        await deleteFromCloudinary(admission.admissionFrontPage);
      }
      if (admission.admissionBackPage) {
        await deleteFromCloudinary(admission.admissionBackPage);
      }
      if (admission.studentStatement) {
        await deleteFromCloudinary(admission.studentStatement);
      }
      if (admission.confidentialForm) {
        await deleteFromCloudinary(admission.confidentialForm);
      }
    } catch (deleteError) {
      console.error('Error deleting files from Cloudinary:', deleteError);
      // Continue with admission deletion even if file deletion fails
    }

    await Admission.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Admission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting admission',
      error: error.message
    });
  }
};

const verifyAdmissionEmail = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    admission.emailVerified = true;
    await admission.save();

    await admission.populate('student', 'studentId name email phone');
    await admission.populate('course', 'name code fee duration');

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: admission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    });
  }
};

const getAdmissionStats = async (req, res) => {
  try {
    // Get total counts by status
    const statusStats = await Admission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get admissions by counsellor
    const counsellorStats = await Admission.aggregate([
      {
        $group: {
          _id: '$counsellor',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get admissions by training branch
    const branchStats = await Admission.aggregate([
      {
        $group: {
          _id: '$trainingBranch',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get monthly admission stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Admission.aggregate([
      {
        $match: {
          admissionDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$admissionDate' },
            month: { $month: '$admissionDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get total counts
    const totalAdmissions = await Admission.countDocuments();
    const pendingAdmissions = await Admission.countDocuments({ status: 'pending' });
    const approvedAdmissions = await Admission.countDocuments({ status: 'approved' });

    res.status(200).json({
      success: true,
      data: {
        total: totalAdmissions,
        pending: pendingAdmissions,
        approved: approvedAdmissions,
        statusDistribution: statusStats,
        counsellorPerformance: counsellorStats,
        branchDistribution: branchStats,
        monthlyTrends: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admission statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllAdmissions,
  getAdmissionById,
  getAdmissionByAdmissionNo,
  getAdmissionsByStudent,
  getAdmissionsByCourse,
  createAdmission,
  updateAdmission,
  updateAdmissionStatus,
  deleteAdmission,
  verifyAdmissionEmail,
  getAdmissionStats
};