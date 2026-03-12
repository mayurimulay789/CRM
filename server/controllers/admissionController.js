const Admission = require('../models/Admission');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const sendMail = require('../utils/email').sendMail;
const path = require('path');

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert Cloudinary URL to iframe-friendly format
 */
const makeViewableUrl = (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return url;

  console.log(`📄 Processing document URL for iframe viewing: ${url}`);
  try {
    if (url.includes('/raw/upload/')) {
      const baseUrl = url.split('/raw/upload/')[0];
      let resourcePath = url.split('/raw/upload/')[1];
      resourcePath = resourcePath.replace(/^v\d+\//, '');
      if (!resourcePath.endsWith('.pdf')) resourcePath += '.pdf';
      const viewableUrl = `${baseUrl}/raw/upload/f_pdf,fl_immutable_cache,q_auto/${resourcePath}`;
      console.log(`✅ Generated iframe-optimized PDF URL: ${viewableUrl}`);
      return viewableUrl;
    } else if (url.includes('/image/upload/')) {
      const viewableUrl = url.replace('/image/upload/', '/image/upload/f_pdf,fl_immutable_cache,q_auto/');
      console.log(`✅ Processed image upload URL for iframe PDF viewing: ${viewableUrl}`);
      return viewableUrl;
    }
    return url;
  } catch (error) {
    console.error('❌ Error processing URL for iframe viewing:', error);
    return url;
  }
};

/**
 * Process admission document URLs for frontend viewing
 */
const processAdmissionDocuments = (admission) => {
  if (!admission) return admission;
  const processed = admission.toObject ? admission.toObject() : { ...admission };
  ['admissionFrontPage', 'admissionBackPage', 'studentStatement', 'confidentialForm'].forEach(field => {
    if (processed[field]) processed[field] = makeViewableUrl(processed[field]);
  });
  return processed;
};

/**
 * Create download URL with proper filename and PDF format
 */
const makeDownloadUrl = (url, filename) => {
  if (!url) return url;
  console.log(`🔗 Processing URL for PDF download: ${url}`);
  if (url.includes('res.cloudinary.com')) {
    try {
      if (url.includes('/raw/upload/')) {
        const baseUrl = url.split('/raw/upload/')[0];
        let resourcePath = url.split('/raw/upload/')[1];
        resourcePath = resourcePath.replace(/^v\d+\//, '');
        if (!resourcePath.endsWith('.pdf')) resourcePath += '.pdf';
        const downloadUrl = `${baseUrl}/raw/upload/fl_attachment:${filename}/f_pdf/${resourcePath}`;
        console.log(`📎 Generated PDF download URL: ${downloadUrl}`);
        return downloadUrl;
      } else if (url.includes('/upload/')) {
        return url.replace('/upload/', `/upload/fl_attachment:${filename}/f_pdf/`);
      }
    } catch (error) {
      console.error('❌ Error processing PDF URL:', error);
    }
  }
  return url.endsWith('.pdf') ? url : `${url}.pdf`;
};

/**
 * Build attachments array from document URLs
 */
const buildAttachments = (frontPage, backPage, statement, confidential) => {
  const attachments = [];
  if (frontPage) attachments.push({ type: 'Admission Front Page', url: makeDownloadUrl(frontPage, 'Admission_Front_Page.pdf'), originalUrl: frontPage });
  if (backPage) attachments.push({ type: 'Admission Back Page', url: makeDownloadUrl(backPage, 'Admission_Back_Page.pdf'), originalUrl: backPage });
  if (statement) attachments.push({ type: 'Student Statement', url: makeDownloadUrl(statement, 'Student_Statement.pdf'), originalUrl: statement });
  if (confidential) attachments.push({ type: 'Confidential Form', url: makeDownloadUrl(confidential, 'Confidential_Form.pdf'), originalUrl: confidential });
  return attachments;
};

// ==================== CONTROLLER FUNCTIONS ====================

/**
 * GET /api/admissions
 * Get all admissions with filtering, pagination, and population
 */
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

    const filter = {};
    if (search) {
      filter.$or = [
        { admissionNo: { $regex: search, $options: 'i' } },
        { counsellor: { $regex: search, $options: 'i' } },
        { trainingBranch: { $regex: search, $options: 'i' } },
        { appliedBatch: { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'all') filter.status = status;
    if (counsellor) filter.counsellor = { $regex: counsellor, $options: 'i' };
    if (trainingBranch) filter.trainingBranch = { $regex: trainingBranch, $options: 'i' };

    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const admissions = await Admission.find(filter)
      .populate('student', 'studentId name email phone alternateEmail alternatePhone dateOfBirth gender')
      .populate('course', 'name code fee duration')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Admission.countDocuments(filter);
    const processedAdmissions = admissions.map(processAdmissionDocuments);

    res.status(200).json({
      success: true,
      count: processedAdmissions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: processedAdmissions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admissions', error: error.message });
  }
};

/**
 * GET /api/admissions/:id
 * Get single admission by ID
 */
const getAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id)
      .populate('student')
      .populate('course')
      .select('-__v');

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    res.status(200).json({ success: true, data: processAdmissionDocuments(admission) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admission', error: error.message });
  }
};

/**
 * GET /api/admissions/number/:admissionNo
 * Get admission by admission number
 */
const getAdmissionByAdmissionNo = async (req, res) => {
  try {
    const admission = await Admission.findOne({ admissionNo: req.params.admissionNo })
      .populate('student')
      .populate('course')
      .select('-__v');

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    res.status(200).json({ success: true, data: processAdmissionDocuments(admission) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admission', error: error.message });
  }
};

/**
 * GET /api/admissions/student/:studentId
 * Get all admissions for a specific student
 */
const getAdmissionsByStudent = async (req, res) => {
  try {
    const admissions = await Admission.find({ student: req.params.studentId })
      .populate('course', 'name code fee duration')
      .sort({ admissionDate: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: admissions.length,
      data: admissions.map(processAdmissionDocuments)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching student admissions', error: error.message });
  }
};

/**
 * GET /api/admissions/course/:courseId
 * Get all admissions for a specific course
 */
const getAdmissionsByCourse = async (req, res) => {
  try {
    const admissions = await Admission.find({ course: req.params.courseId })
      .populate('student', 'studentId name email phone')
      .sort({ admissionDate: -1 })
      .select('-__v');

    res.status(200).json({ success: true, count: admissions.length, data: admissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching course admissions', error: error.message });
  }
};

/**
 * POST /api/admissions
 * Create a new admission with file uploads
 */
const createAdmission = async (req, res) => {
  console.log('=== ADMISSION CREATION STARTED ===');
  try {
    const {
      student,
      course,
      trainingBranch,
      termsCondition,
      appliedBatch,
      source,
      notes
    } = req.body;

    // Upload files to Cloudinary
    let admissionFrontPageUrl = '', admissionBackPageUrl = '', studentStatementUrl = '', confidentialFormUrl = '';
    if (req.files) {
      try {
        if (req.files.admissionFrontPage?.[0]) {
          const file = req.files.admissionFrontPage[0];
          console.log('📄 Uploading admission front page:', file.originalname);
          admissionFrontPageUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/front-pages', file.originalname);
        }
        if (req.files.admissionBackPage?.[0]) {
          const file = req.files.admissionBackPage[0];
          console.log('📄 Uploading admission back page:', file.originalname);
          admissionBackPageUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/back-pages', file.originalname);
        }
        if (req.files.studentStatement?.[0]) {
          const file = req.files.studentStatement[0];
          console.log('📄 Uploading student statement:', file.originalname);
          studentStatementUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/statements', file.originalname);
        }
        if (req.files.confidentialForm?.[0]) {
          const file = req.files.confidentialForm[0];
          console.log('📄 Uploading confidential form:', file.originalname);
          confidentialFormUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/confidential-forms', file.originalname);
        }
      } catch (uploadError) {
        return res.status(500).json({ success: false, message: `File upload failed: ${uploadError.message}` });
      }
    }

    // Validate student and course
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check for existing active admission
    const existingAdmission = await Admission.findOne({
      student,
      course,
      status: { $in: ['pending', 'approved'] }
    });
    if (existingAdmission) {
      return res.status(400).json({ success: false, message: 'Student already has an active admission for this course' });
    }

    // Generate admission number
    const generateAdmissionNo = async () => {
      const year = new Date().getFullYear();
      const lastAdmission = await Admission.findOne(
        { admissionNo: new RegExp(`^ADM${year}\\d{4}$`) },
        { admissionNo: 1 },
        { sort: { admissionNo: -1 } }
      );
      if (lastAdmission?.admissionNo) {
        const lastNumber = parseInt(lastAdmission.admissionNo.slice(-4));
        if (!isNaN(lastNumber)) return `ADM${year}${(lastNumber + 1).toString().padStart(4, '0')}`;
      }
      const count = await Admission.countDocuments({
        admissionNo: new RegExp(`^ADM${year}`),
        createdAt: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) }
      });
      return `ADM${year}${(count + 1).toString().padStart(4, '0')}`;
    };
    const admissionNo = await generateAdmissionNo();

    // Build attachments
    const attachments = buildAttachments(
      admissionFrontPageUrl,
      admissionBackPageUrl,
      studentStatementUrl,
      confidentialFormUrl
    );

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
      appliedBatch,
      source: source || 'website',
      notes,
      admissionDate: new Date(),
      attachments
    };

    const admission = new Admission(admissionData);
    const savedAdmission = await admission.save();
    await savedAdmission.populate('student', 'studentId name email phone');
    await savedAdmission.populate('course', 'name code fee duration');

    const admissionResponse = savedAdmission.toObject();
    delete admissionResponse.__v;

    // 🔁 FIXED: Send response
    res.status(201).json({
      success: true,
      message: 'Admission created successfully',
      data: admissionResponse
    });
  } catch (error) {
    console.error('❌ Create admission error:', error);
    res.status(500).json({ success: false, message: 'Error creating admission', error: error.message });
  }
};

/**
 * PUT /api/admissions/:id
 * Update an existing admission (including file updates)
 */
const updateAdmission = async (req, res) => {
  try {
    const { trainingBranch, termsCondition, status, appliedBatch, source, notes } = req.body;

    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    // Handle file uploads for updates
    let fileUpdateData = {};
    if (req.files) {
      try {
        if (req.files.admissionFrontPage?.[0]) {
          const file = req.files.admissionFrontPage[0];
          fileUpdateData.admissionFrontPage = await uploadToCloudinary(file.buffer, 'lms/admissions/front-pages', file.originalname);
          if (admission.admissionFrontPage) await deleteFromCloudinary(admission.admissionFrontPage);
        }
        if (req.files.admissionBackPage?.[0]) {
          const file = req.files.admissionBackPage[0];
          fileUpdateData.admissionBackPage = await uploadToCloudinary(file.buffer, 'lms/admissions/back-pages', file.originalname);
          if (admission.admissionBackPage) await deleteFromCloudinary(admission.admissionBackPage);
        }
        if (req.files.studentStatement?.[0]) {
          const file = req.files.studentStatement[0];
          fileUpdateData.studentStatement = await uploadToCloudinary(file.buffer, 'lms/admissions/statements', file.originalname);
          if (admission.studentStatement) await deleteFromCloudinary(admission.studentStatement);
        }
        if (req.files.confidentialForm?.[0]) {
          const file = req.files.confidentialForm[0];
          fileUpdateData.confidentialForm = await uploadToCloudinary(file.buffer, 'lms/admissions/confidential-forms', file.originalname);
          if (admission.confidentialForm) await deleteFromCloudinary(admission.confidentialForm);
        }
      } catch (uploadError) {
        return res.status(500).json({ success: false, message: `File upload failed: ${uploadError.message}` });
      }
    }

    // Update fields
    const updateData = {
      trainingBranch: trainingBranch || admission.trainingBranch,
      counsellor: req.user.FullName,
      termsCondition: termsCondition !== undefined ? termsCondition : admission.termsCondition,
      status: status || admission.status,
      appliedBatch: appliedBatch !== undefined ? appliedBatch : admission.appliedBatch,
      source: source || admission.source,
      notes: notes !== undefined ? notes : admission.notes,
      ...fileUpdateData
    };

    // Rebuild attachments if any file was updated
    if (Object.keys(fileUpdateData).length > 0) {
      updateData.attachments = buildAttachments(
        updateData.admissionFrontPage || admission.admissionFrontPage,
        updateData.admissionBackPage || admission.admissionBackPage,
        updateData.studentStatement || admission.studentStatement,
        updateData.confidentialForm || admission.confidentialForm
      );
    }

    const updatedAdmission = await Admission.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('student', 'studentId name email phone')
      .populate('course', 'name code fee duration')
      .select('-__v');

    res.status(200).json({
      success: true,
      message: 'Admission updated successfully',
      data: processAdmissionDocuments(updatedAdmission)
    });
  } catch (error) {
    console.error('❌ Update error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Error updating admission', error: error.message });
  }
};

/**
 * PATCH /api/admissions/:id/status
 * Update only the status of an admission
 */
const updateAdmissionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const admission = await Admission.findById(req.params.id)
      .populate('student', 'studentId name email phone')
      .populate('course', 'name code fee duration');

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'waiting_list'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updateData = { status, notes: notes !== undefined ? notes : admission.notes };

    const updatedAdmission = await Admission.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('student', 'studentId name email phone')
      .populate('course', 'name code fee duration')
      .select('-__v');

    // Send email if status changed to approved
    if (status === 'approved' && admission.status !== 'approved') {
      console.log(`📧 Sending admission confirmation email to: ${updatedAdmission.student?.email}`);
      try {
        await sendAdmissionConfirmationEmail(updatedAdmission);
      } catch (emailError) {
        console.error('❌ Failed to send admission confirmation email:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: `Admission ${status} successfully`,
      data: processAdmissionDocuments(updatedAdmission)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating admission status', error: error.message });
  }
};

/**
 * Internal function: Send admission confirmation email
 */
async function sendAdmissionConfirmationEmail(admission) {
  console.log(`📧 Starting admission confirmation email for: ${admission.admissionNo}`);
  const { student, course } = admission;

  if (!student?.email) throw new Error(`Student email missing for admission ${admission.admissionNo}`);
  if (!course) throw new Error(`Course missing for admission ${admission.admissionNo}`);

  const subject = `🎓 Welcome to RYMA ACADEMY | Your Admission is Officially Confirmed`;

  // FIXED: Removed broken image reference, used a simple header
  const html = `
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RYMA ACADEMY – Admission (header image)</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f3e5e5;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .email-container {
            max-width: 1200px;
            margin: auto;
            background-color: #ffffff;
            overflow: hidden;
            box-shadow: 0 12px 28px rgba(150, 30, 30, 0.2);
        }

        /* header image area */
        .header-image {
            width: 100%;
            background-color: #b31b1b;
            text-align: center;
            padding: 0;
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

        .congrats-big {
            font-size: 30px;
            font-weight: 800;
            color: #aa2d2d;
            margin: 5px 0 10px;
            text-transform: uppercase;
            line-height: 1.2;
        }

        .message {
            font-size: 16px;
            color: #3a2a2a;
            line-height: 1.5;
            margin: 15px 0 10px;
        }

        .family-block {
            background: #fef0f0;
            padding: 16px 20px;
            border-radius: 30px 10px 30px 10px;
            margin: 20px 0;
            border-left: 6px solid #b13e3e;
            color: #572626;
            font-weight: 500;
        }

        .director-quote {
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

        .director-quote p {
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

        .admission-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 6px 18px rgba(150, 40, 40, 0.1);
            border: 1px solid #e9c1c1;
        }

        .admission-table td {
            padding: 14px 20px;
            border-bottom: 1px solid #f2d6d6;
            font-size: 16px;
        }

        .admission-table tr:last-child td {
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

        .footnote {
            background: #ffebeb;
            padding: 18px 24px;
            border-radius: 60px 10px 60px 10px;
            margin: 28px 0 20px;
            color: #792e2e;
            font-size: 15px;
            text-align: center;
            border: 1px solid #e2acac;
        }

        hr {
            border: none;
            height: 2px;
            background: linear-gradient(to right, #efc2c2, #c96666, #efc2c2);
            margin: 28px 0;
        }

        .footer-red {
            background-color: #8f2626;
            padding: 18px 28px;
            text-align: center;
            color: #ffd7d7;
            font-size: 14px;
            border-top: 3px solid #b33a3a;
        }

        .footer-red a {
            color: #ffe0e0;
            text-decoration: underline;
        }

        .note-placeholder {
            font-size: 13px;
            color: #777;
            background: #faf0f0;
            padding: 6px 10px;
            border-radius: 50px;
            margin-top: 8px;
            text-align: center;
        }

        .imgformate {
            width: 1200px;
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

        /* Attachment box style */
        .attachment-box {
            background: #ffefef;
            padding: 18px 25px;
            border-radius: 30px;
            color: #792e2e;
            font-size: 16px;
            margin: 25px 0 20px;
            text-align: center;
            border: 2px dashed #b44848;
            box-shadow: 0 4px 12px rgba(170, 60, 60, 0.1);
        }

        .attachment-box a {
            color: #b33838;
            font-weight: 700;
            text-decoration: underline;
            word-break: break-all;
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

            .attachment-box {
                padding: 15px;
                font-size: 14px;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <!-- Header image area: replace src with your logo/banner -->
        <img src="${server / assets / header.png}" alt="" class="imgformate">
        <div class="header-image">
            <div class="img-placeholder" style="display: none;">RYMA ACADEMY</div>
        </div>
        <div class="content">
            <!-- Dear student name -->
            <div class="greeting">Dear <strong>${student.name}</strong>,</div>
            <!-- Congratulations!! -->
            <div class="congrats-big">Congratulations!!</div>

            <!-- first paragraph -->
            <div class="message">
                This single word carries the weight of every late night, every effort, and every dream you have invested
                in your future. Today, that effort has been acknowledged.
            </div>

            <!-- On behalf of family block -->
            <div class="family-block">
                <strong>On behalf of the entire RYMA ACADEMY family</strong> — it is our immense honour and privilege to
                officially confirm your admission. You are no longer just an applicant. You are now a part of an
                institution that has been built on one singular promise:
            </div>

            <!-- Director quote box -->
            <div class="director-quote">
                <span class="quote-mark">“</span>
                <p>We do not just build careers. We build people who change the world.</p>
                <div class="director-name">— Mr. Parveen Jain (Director), RYMA ACADEMY</div>
            </div>

            <hr>

            <!-- OFFICIAL ADMISSION RECORD title -->
            <div class="section-title">RYMA ACADEMY — OFFICIAL ADMISSION RECORD</div>

            <!-- Admission details table (exact fields) -->
            <table class="admission-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Student Name</td>
                    <td class="value-cell"><strong>${student.name}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Student ID</td>
                    <td class="value-cell"><strong>${student.studentId}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Applied Program</td>
                    <td class="value-cell"><strong>${course.name}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Program Duration</td>
                    <td class="value-cell"><strong>${course.duration}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Program Fee</td>
                    <td class="value-cell"><strong>₹${course.fee}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Training Campus</td>
                    <td class="value-cell"><strong>${admission.trainingBranch}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Admission Date</td>
                    <td class="value-cell"><strong>${new
      Date(admission.admissionDate).toLocaleDateString('en-IN')}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Processed By</td>
                    <td class="value-cell"><strong>${admission.counsellor}</strong></td>
                </tr>
            </table>

            <!-- verification notice -->
            <div class="footnote">
                <span style="font-size: 1.2em;">⏳</span> <strong>Please verify all details above.</strong><br>
                Any discrepancy must be reported to your Education Counsellor within 48 hours of receiving this record.
            </div>

            <!-- welcome line with student name -->
            <p style="font-size: 18px; color: #7e3939; text-align: center; margin: 30px 0 10px; font-weight: 500;">
                Welcome to a legacy of excellence, <strong style="color: #b33838;">${student.name}</strong>.<br>
                Your story begins today. <em>Make it extraordinary.</em>
            </p>

            <!-- signature -->
            <div style="margin: 30px 0 20px; color: #592525;">
                With the highest regards & warmest welcome,<br>
                <strong>Team of Admissions & Student Services</strong><br>
                RYMA ACADEMY
            </div>

            <!-- contact info (as in original screenshots) -->
            <div class="contact-footer">
                +91-9873336133
                <a href="mailto:services@rymaacademy.com">services@rymaacademy.com</a>
                <a href="#">www.rymaacademy.com</a>
                📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085
            </div>


            <!-- ========== ATTACHMENTS SECTION (column‑wise) ========== -->
            <div style="margin: 32px 0 16px;">
                <!-- Section heading -->
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                    <span style="font-size: 20px; font-weight: 700; color: #b13e3e;">📎 Attachments</span>
                    <hr
                        style="flex: 1; border: none; height: 2px; background: linear-gradient(to right, #b13e3e, #fae1e1);">
                </div>

                <!-- Column‑wise attachment list -->
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    ${attachments.map(att => `
                    <tr>
                        <td style="padding-bottom: 16px;">
                            <!-- Card container -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="border-collapse: collapse; background-color: #f1f3f4; border-radius: 12px; border: 1px solid #d0d0d0; border-left: 6px solid #b13e3e;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <!-- PDF badge and file type -->
                                        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 12px;">
                                            <span
                                                style="background-color: #d32f2f; border-radius: 8px; padding: 6px 14px; font-size: 16px; font-weight: 700; color: white; letter-spacing: 0.5px;">📄
                                                PDF</span>
                                            <span
                                                style="font-weight: 600; color: #4a2a2a; font-size: 18px;">${att.type}</span>
                                            <a href="${att.url}" download="${att.type.replace(/\s+/g, '_')}.pdf"
                                                target="_blank"
                                                style="color: #b13e3e; font-weight: 600; text-decoration: underline; margin-left: auto;">
                                                ⬇️ Download
                                            </a>
                                        </div>
                                        <!-- Alternative link if exists -->
                                        ${att.originalUrl && att.originalUrl !== att.url ? `
                                        <div style="margin-top: 10px; font-size: 14px;">
                                            <span style="color: #6d3131;">Alternative link: </span>
                                            <a href="${att.originalUrl}" download="${att.type.replace(/\s+/g, '_')}.pdf"
                                                target="_blank" style="color: #28a745; text-decoration: none;">
                                                🔗 View alternative PDF
                                            </a>
                                        </div>
                                        ` : ''}
                                        <!-- File size if provided -->
                                        ${att.size ? `
                                        <div style="margin-top: 8px; font-size: 13px; color: #5f6368;">
                                            File size: ${att.size}
                                        </div>
                                        ` : ''}
                                        <!-- Helper text -->
                                        <div style="margin-top: 8px; font-size: 12px; color: #9b6b6b;">
                                            Right‑click and "Save As" if download doesn't start automatically.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    `).join('')}
                </table>
            </div>
            <!-- ========== END ATTACHMENTS SECTION ========== -->
            <!-- ========== END POLICY PDF ATTACHMENT ========== -->

            <!-- small note about image placeholder (can be removed) -->
            <div class="note-placeholder">
                ⚡ Header image placeholder: replace the 'src' in the img tag with your actual logo.
            </div>
        </div>

        <!-- footer (red) with disclaimer line -->
        <div class="footer-red">
            This is an electronically generated communication · No signature or stamp required<br>
            <span style="opacity: 0.8;">© RYMA ACADEMY – Admission record</span>
        </div>
    </div>
</body>

</html>
  `;

  await sendMail(student.email, subject, html, true);
  console.log(`✅ Admission confirmation email sent to ${student.email}`);
}

/**
 * DELETE /api/admissions/:id
 * Delete an admission (only pending)
 */
const deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }
    if (admission.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending admissions can be deleted' });
    }

    // Delete files from Cloudinary
    try {
      if (admission.admissionFrontPage) await deleteFromCloudinary(admission.admissionFrontPage);
      if (admission.admissionBackPage) await deleteFromCloudinary(admission.admissionBackPage);
      if (admission.studentStatement) await deleteFromCloudinary(admission.studentStatement);
      if (admission.confidentialForm) await deleteFromCloudinary(admission.confidentialForm);
    } catch (deleteError) {
      console.error('Error deleting files from Cloudinary:', deleteError);
    }

    await Admission.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Admission deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting admission', error: error.message });
  }
};

/**
 * PATCH /api/admissions/:id/verify-email
 * Mark admission email as verified
 */
const verifyAdmissionEmail = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }
    admission.emailVerified = true;
    await admission.save();
    await admission.populate('student', 'studentId name email phone');
    await admission.populate('course', 'name code fee duration');

    res.status(200).json({ success: true, message: 'Email verified successfully', data: admission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying email', error: error.message });
  }
};

/**
 * GET /api/admissions/stats
 * Get admission statistics
 */
const getAdmissionStats = async (req, res) => {
  try {
    const statusStats = await Admission.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const counsellorStats = await Admission.aggregate([{ $group: { _id: '$counsellor', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]);
    const branchStats = await Admission.aggregate([{ $group: { _id: '$trainingBranch', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyStats = await Admission.aggregate([
      { $match: { admissionDate: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$admissionDate' }, month: { $month: '$admissionDate' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

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
    res.status(500).json({ success: false, message: 'Error fetching admission statistics', error: error.message });
  }
};

/**
 * GET /api/admissions/search-approved-students
 * Search approved students by name (for dropdowns)
 */
const searchApprovedStudents = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || name.length < 1) {
      return res.status(200).json({ success: true, data: [] });
    }

    const approvedAdmissions = await Admission.find({ status: 'approved' })
      .populate('student', 'studentId name email phone')
      .select('student');

    const students = [];
    const seenStudentIds = new Set();

    approvedAdmissions.forEach(admission => {
      if (admission.student &&
        admission.student.name.toLowerCase().includes(name.toLowerCase()) &&
        !seenStudentIds.has(admission.student._id.toString())) {
        students.push({
          studentId: admission.student.studentId,
          studentName: admission.student.name,
          email: admission.student.email,
          phone: admission.student.phone
        });
        seenStudentIds.add(admission.student._id.toString());
      }
    });

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching approved students', error: error.message });
  }
};

// ==================== EXPORTS ====================
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
  getAdmissionStats,
  searchApprovedStudents
};