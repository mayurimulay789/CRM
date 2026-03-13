const Admission = require('../models/Admission');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const sendMail = require('../utils/email').sendMail;
const path = require('path');

// ----------------------------------------------------------------------
// Helper: make Cloudinary URLs viewable in iframe (supports all types)
// ----------------------------------------------------------------------
const makeViewableUrl = (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  console.log(`📄 Processing document URL for iframe viewing: ${url}`);
  try {
    if (url.includes('/raw/upload/')) {
      const baseUrl = url.split('/raw/upload/')[0];
      let resourcePath = url.split('/raw/upload/')[1];
      resourcePath = resourcePath.replace(/^v\d+\//, '');
      const viewableUrl = `${baseUrl}/raw/upload/f_pdf,fl_immutable_cache,q_auto/${resourcePath}`;
      console.log(`✅ Generated iframe-optimized PDF URL: ${viewableUrl}`);
      return viewableUrl;
    }
    if (url.includes('/image/upload/')) {
      const viewableUrl = url.replace('/image/upload/', '/image/upload/fl_immutable_cache,q_auto/');
      console.log(`✅ Processed image URL for iframe viewing: ${viewableUrl}`);
      return viewableUrl;
    }
    return url;
  } catch (error) {
    console.error('❌ Error processing URL for iframe viewing:', error);
    return url;
  }
};

// ----------------------------------------------------------------------
// Helper: make Cloudinary URLs downloadable with a friendly filename
// (Preserves original file type – no forced PDF conversion)
// ----------------------------------------------------------------------
function makeDownloadUrl(url, filename) {
  if (!url) return url;
  console.log(`🔗 Processing URL for download: ${url}`);
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  try {
    if (url.includes('/raw/upload/')) {
      const baseUrl = url.split('/raw/upload/')[0];
      let resourcePath = url.split('/raw/upload/')[1];
      resourcePath = resourcePath.replace(/^v\d+\//, '');
      const downloadUrl = `${baseUrl}/raw/upload/fl_attachment:${safeFilename}/${resourcePath}`;
      console.log(`📎 Generated raw download URL: ${downloadUrl}`);
      return downloadUrl;
    } else if (url.includes('/image/upload/')) {
      const downloadUrl = url.replace('/image/upload/', `/image/upload/fl_attachment:${safeFilename}/`);
      console.log(`📎 Generated image download URL: ${downloadUrl}`);
      return downloadUrl;
    }
  } catch (error) {
    console.error('❌ Error processing download URL:', error);
  }
  console.log(`⚠️ Returning original URL (download may not be forced): ${url}`);
  return url;
}

// ----------------------------------------------------------------------
// Helper: process admission document URLs for viewing (iframe)
// ----------------------------------------------------------------------
const processAdmissionDocuments = (admission) => {
  if (!admission) return admission;
  const processed = admission.toObject ? admission.toObject() : { ...admission };
  if (processed.admissionFrontPage) processed.admissionFrontPage = makeViewableUrl(processed.admissionFrontPage);
  if (processed.admissionBackPage) processed.admissionBackPage = makeViewableUrl(processed.admissionBackPage);
  if (processed.studentStatement) processed.studentStatement = makeViewableUrl(processed.studentStatement);
  if (processed.confidentialForm) processed.confidentialForm = makeViewableUrl(processed.confidentialForm);
  return processed;
};

// ----------------------------------------------------------------------
// EMAIL FUNCTION – sends admission email (now only used on approval)
// ----------------------------------------------------------------------
async function sendAdmissionEmail(admission, type = 'approved') {
  console.log(`📧 Sending ${type} admission email for: ${admission.admissionNo}`);
  try {
    const { student, course } = admission;
    if (!student || !student.email) {
      console.error(`❌ Student email missing for admission: ${admission.admissionNo}`);
      return;
    }
    if (!course) {
      console.error(`❌ Course missing for admission: ${admission.admissionNo}`);
      return;
    }

    const documents = [
      { name: 'Admission Front Page', url: admission.admissionFrontPage },
      { name: 'Admission Back Page', url: admission.admissionBackPage },
      { name: 'Student Statement', url: admission.studentStatement },
      { name: 'Confidential Form', url: admission.confidentialForm },
      ...(admission.attachments || []).map(att => ({
        name: att.type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        url: att.url
      }))
    ].filter(doc => doc.url);

    const downloadableDocs = documents.map(doc => ({
      ...doc,
      downloadUrl: makeDownloadUrl(doc.url, doc.name.replace(/\s+/g, '_'))
    }));

    let subject, html;
    const downloadpolicyDocument = makeDownloadUrl('https://res.cloudinary.com/dpyry0mh1/image/upload/v1773289421/RYMA_ACADEMY_PRIVACY_POLICIES_1_1_2_ycygav.pdf', "policydocument")
    subject = '🎓 Welcome to RYMA ACADEMY – Your Admission is Officially Confirmed';
    html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin:0; padding:0; background-color:#f3e5e5; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
          .email-container { max-width:1200px; margin:auto; background-color:#ffffff; overflow:hidden; box-shadow:0 12px 28px rgba(150,30,30,0.2); }
          .header { width:100%; background:linear-gradient(145deg,#b22222,#8b1a1a); color:white; font-size:32px; font-weight:800; text-align:center; padding:40px 20px; box-sizing:border-box; letter-spacing:4px; text-transform:uppercase; border-bottom:4px solid #f3c3c3; }
          .content { padding:28px 32px 32px; }
          .greeting { font-size:18px; font-weight:500; color:#3b2323; margin-bottom:16px; }
          .greeting strong { color:#b13e3e; }
          .congrats-big { font-size:30px; font-weight:800; color:#aa2d2d; margin:5px 0 10px; text-transform:uppercase; line-height:1.2; }
          .message { font-size:16px; color:#3a2a2a; line-height:1.5; margin:15px 0 10px; }
          .family-block { background:#fef0f0; padding:16px 20px; border-radius:30px 10px 30px 10px; margin:20px 0; border-left:6px solid #b13e3e; color:#572626; font-weight:500; }
          .director-quote { background:#fff3f3; border-radius:40px 12px 40px 12px; padding:22px 26px; margin:20px 0 25px; border:1px solid #e6b2b2; box-shadow:0 6px 14px rgba(170,60,60,0.1); }
          .quote-mark { font-size:40px; color:#b44848; font-family:'Times New Roman',serif; line-height:0.6; margin-right:4px; }
          .director-quote p { font-size:18px; font-style:italic; color:#592b2b; margin:8px 0 10px 0; font-weight:500; }
          .director-name { font-weight:700; color:#862b2b; text-align:right; font-size:16px; }
          .section-title { font-size:22px; font-weight:700; color:#aa2929; border-bottom:3px solid #e0adad; padding-bottom:10px; margin:30px 0 20px; text-transform:uppercase; letter-spacing:1px; }
          .admission-table { width:100%; border-collapse:collapse; background:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 6px 18px rgba(150,40,40,0.1); border:1px solid #e9c1c1; }
          .admission-table td { padding:14px 20px; border-bottom:1px solid #f2d6d6; font-size:16px; }
          .admission-table tr:last-child td { border-bottom:none; }
          .label-cell { background-color:#fde5e5; color:#892b2b; font-weight:700; width:42%; border-right:1px solid #e2b2b2; }
          .value-cell { background-color:#fffbfb; color:#2e1c1c; font-weight:500; }
          .value-cell strong { color:#b33838; }
          .documents-section { background:#fef0f0; border-radius:20px; padding:20px; margin:25px 0; border:1px solid #e6b2b2; }
          .documents-section h3 { color:#aa2929; margin-top:0; border-bottom:2px solid #e0adad; padding-bottom:8px; }
          .documents-section ul { list-style:none; padding:0; margin:10px 0 0; }
          .documents-section li { margin:12px 0; padding:10px; background:white; border-radius:8px; border-left:5px solid #b13e3e; }
          .documents-section a { color:#b13e3e; text-decoration:none; font-weight:bold; }
          .footnote { background:#ffebeb; padding:18px 24px; border-radius:60px 10px 60px 10px; margin:28px 0 20px; color:#792e2e; font-size:15px; text-align:center; border:1px solid #e2acac; }
          hr { border:none; height:2px; background:linear-gradient(to right,#efc2c2,#c96666,#efc2c2); margin:28px 0; }
          .contact-footer { background:#fae1e1; padding:18px 25px; border-radius:30px; color:#6d3131; font-size:15px; margin:20px 0; display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:12px 8px; }
          .contact-footer a { color:#a13030; text-decoration:underline; white-space:nowrap; }
          .footer-red { background-color:#8f2626; padding:18px 28px; text-align:center; color:#ffd7d7; font-size:14px; border-top:3px solid #b33a3a; }
          .imgformate { width:1200px; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <img src="https://res.cloudinary.com/dpyry0mh1/image/upload/v1773287825/Screenshot_2026-03-11_141445_ibusnj.png" alt="" class="imgformate">
          <div class="content">
            <div class="greeting">Dear <strong>${student.name}</strong>,</div>
            <div class="congrats-big">Congratulations!!</div>
            <div class="message">
              This single word carries the weight of every late night, every effort, and every dream you have invested in your future. Today, that effort has been acknowledged.
            </div>
            <div class="family-block">
              <strong>On behalf of the entire RYMA ACADEMY family</strong> — it is our immense honour and privilege to officially confirm your admission. You are now a part of an institution that has been built on one singular promise:
            </div>
            <div class="director-quote">
              <span class="quote-mark">“</span>
              <p>We do not just build careers. We build people who change the world.</p>
              <div class="director-name">— Mr. Parveen Jain (Director), RYMA ACADEMY</div>
            </div>
            <hr>
            <div class="section-title">RYMA ACADEMY — OFFICIAL ADMISSION RECORD</div>
            <table class="admission-table" cellpadding="0" cellspacing="0">
              <tr><td class="label-cell">Student Name</td><td class="value-cell"><strong>${student.name}</strong></td></tr>
              <tr><td class="label-cell">Student ID</td><td class="value-cell"><strong>${student.studentId}</strong></td></tr>
              <tr><td class="label-cell">Applied Program</td><td class="value-cell"><strong>${course.name}</strong></td></tr>
              <tr><td class="label-cell">Program Duration</td><td class="value-cell"><strong>${course.duration}</strong></td></tr>
              <tr><td class="label-cell">Program Fee</td><td class="value-cell"><strong>₹${course.fee}</strong></td></tr>
              <tr><td class="label-cell">Training Campus</td><td class="value-cell"><strong>${admission.trainingBranch}</strong></td></tr>
              <tr><td class="label-cell">Admission Date</td><td class="value-cell"><strong>${new Date(admission.admissionDate).toLocaleDateString('en-IN')}</strong></td></tr>
              <tr><td class="label-cell">Processed By</td><td class="value-cell"><strong>${admission.counsellor}</strong></td></tr>
            </table>

            ${downloadableDocs.length > 0 ? `
            <div class="documents-section">
              <h3>📄 Your Admission Documents</h3>
              <ul>
                ${downloadableDocs.map(doc => `
                  <li>
                    <strong>${doc.name}</strong><br>
                    <a href="${doc.downloadUrl}" download target="_blank">
                      📥 Download
                    </a>
                  </li>
                `).join('')}
                <li>
                   <strong>Policy Document</strong><br>
                    <a
  href=${downloadpolicyDocument}
  download="RYMA_ACADEMY_Privacy_Policies.pdf" // Optional: suggest a filename
  className="your-button-classes"
  target="_blank"
  rel="noopener noreferrer"
>
  📥 Download Privacy Policies (PDF)
</a>
                </li>
              </ul>
              <p style="font-size:0.9em; color:#666;">Right-click and "Save As" if the download does not start automatically.</p>
            </div>
            ` : ''}

            <div class="footnote">
              <span style="font-size: 1.2em;">⏳</span> <strong>Please verify all details above.</strong><br>
              Any discrepancy must be reported to your Education Counsellor within 48 hours.
            </div>

            <p style="font-size: 18px; color: #7e3939; text-align: center; margin: 30px 0 10px; font-weight: 500;">
              Welcome to a legacy of excellence, <strong style="color: #b33838;">${student.name}</strong>.<br>
              Your story begins today. <em>Make it extraordinary.</em>
            </p>

            <div style="margin: 30px 0 20px; color: #592525;">
              With the highest regards & warmest welcome,<br>
              <strong>Team of Admissions & Student Services</strong><br>
              RYMA ACADEMY
            </div>

            <!-- CONTACT FOOTER (Email-Safe) -->
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
          <div class="footer-red">
            This is an electronically generated communication · No signature or stamp required<br>
            <span style="opacity: 0.8;">© RYMA ACADEMY – Admission record</span>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendMail(student.email, subject, html, true);
    console.log(`✅ ${type} admission email sent to ${student.email} (BCC included)`);
  } catch (error) {
    console.error(`❌ Failed to send ${type} admission email:`, error.message);
  }
}

// ----------------------------------------------------------------------
// CONTROLLER FUNCTIONS
// ----------------------------------------------------------------------

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
    const processedAdmissions = admissions.map(admission => processAdmissionDocuments(admission));

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

const getAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id)
      .populate('student')
      .populate('course')
      .select('-__v');
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });
    res.status(200).json({ success: true, data: processAdmissionDocuments(admission) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admission', error: error.message });
  }
};

const getAdmissionByAdmissionNo = async (req, res) => {
  try {
    const admission = await Admission.findOne({ admissionNo: req.params.admissionNo })
      .populate('student')
      .populate('course')
      .select('-__v');
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });
    res.status(200).json({ success: true, data: processAdmissionDocuments(admission) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admission', error: error.message });
  }
};

const getAdmissionsByStudent = async (req, res) => {
  try {
    const admissions = await Admission.find({ student: req.params.studentId })
      .populate('course', 'name code fee duration')
      .sort({ admissionDate: -1 })
      .select('-__v');
    const processedAdmissions = admissions.map(admission => processAdmissionDocuments(admission));
    res.status(200).json({ success: true, count: processedAdmissions.length, data: processedAdmissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching student admissions', error: error.message });
  }
};

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

const createAdmission = async (req, res) => {
  console.log('=== ADMISSION CREATION STARTED ===');
  try {
    const {
      student,
      course,
      trainingBranch,
      counsellor,
      termsCondition,
      appliedBatch,
      source,
      notes
    } = req.body;
    console.log('1. Reading request body...');
    console.log('Request body data:', {
      student,
      course,
      trainingBranch,
      counsellor,
      termsCondition,
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
        if (req.files.admissionFrontPage?.[0]) {
          const file = req.files.admissionFrontPage[0];
          admissionFrontPageUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/front-pages', file.originalname);
        }
        if (req.files.admissionBackPage?.[0]) {
          const file = req.files.admissionBackPage[0];
          admissionBackPageUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/back-pages', file.originalname);
        }
        if (req.files.studentStatement?.[0]) {
          const file = req.files.studentStatement[0];
          studentStatementUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/statements', file.originalname);
        }
        if (req.files.confidentialForm?.[0]) {
          const file = req.files.confidentialForm[0];
          confidentialFormUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/confidential-forms', file.originalname);
        }
      } catch (uploadError) {
        return res.status(500).json({ success: false, message: `File upload failed: ${uploadError.message}` });
      }
    }

    const studentExists = await Student.findById(student);
    if (!studentExists) return res.status(404).json({ success: false, message: 'Student not found' });
    const courseExists = await Course.findById(course);
    if (!courseExists) return res.status(404).json({ success: false, message: 'Course not found' });

    const existingAdmission = await Admission.findOne({ student, course, status: { $in: ['pending', 'approved'] } });
    if (existingAdmission) {
      return res.status(400).json({ success: false, message: 'Student already has an active admission for this course' });
    }

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

    const attachments = [];
    if (admissionFrontPageUrl) attachments.push({ type: 'Admission Front Page', url: admissionFrontPageUrl, originalUrl: admissionFrontPageUrl });
    if (admissionBackPageUrl) attachments.push({ type: 'Admission Back Page', url: admissionBackPageUrl, originalUrl: admissionBackPageUrl });
    if (studentStatementUrl) attachments.push({ type: 'Student Statement', url: studentStatementUrl, originalUrl: studentStatementUrl });
    if (confidentialFormUrl) attachments.push({ type: 'Confidential Form', url: confidentialFormUrl, originalUrl: confidentialFormUrl });

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

    // ❌ Email sending on creation removed – now only sent on approval

    const processedResponse = processAdmissionDocuments(savedAdmission);
    res.status(201).json({
      success: true,
      message: 'Admission created successfully',
      data: processedResponse
    });
  } catch (error) {
    console.error('=== ERROR ===', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
    }
    if (error.code === 11000 && error.keyPattern?.admissionNo) {
      return res.status(400).json({ success: false, message: 'System error: Please try again in a moment' });
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
    const { trainingBranch, termsCondition, status, appliedBatch, source, notes } = req.body;
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

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

    const updatedAdmission = await Admission.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('student', 'studentId name email phone')
      .populate('course', 'name code fee duration')
      .select('-__v');

    if (status === 'approved' && admission.status !== 'approved') {
      await sendAdmissionEmail(updatedAdmission, 'approved');
    }

    const processedAdmission = processAdmissionDocuments(updatedAdmission);
    res.status(200).json({
      success: true,
      message: 'Admission updated successfully',
      data: processedAdmission
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

const updateAdmissionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const admission = await Admission.findById(req.params.id)
      .populate('student', 'studentId name email phone')
      .populate('course', 'name code fee duration');
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    const validStatuses = ['pending', 'approved', 'rejected', 'waiting_list'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be one of: pending, approved, rejected, waiting_list' });
    }

    const updateData = { status, notes: notes !== undefined ? notes : admission.notes };
    const updatedAdmission = await Admission.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('student', 'studentId name email phone')
      .populate('course', 'name code fee duration')
      .select('-__v');

    if (status === 'approved' && admission.status !== 'approved') {
      await sendAdmissionEmail(updatedAdmission, 'approved');
    }

    const processedAdmission = processAdmissionDocuments(updatedAdmission);
    res.status(200).json({
      success: true,
      message: `Admission ${status} successfully`,
      data: processedAdmission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating admission status', error: error.message });
  }
};

const deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });
    if (admission.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending admissions can be deleted' });
    }

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

const verifyAdmissionEmail = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });
    admission.emailVerified = true;
    await admission.save();
    await admission.populate('student', 'studentId name email phone');
    await admission.populate('course', 'name code fee duration');
    res.status(200).json({ success: true, message: 'Email verified successfully', data: admission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying email', error: error.message });
  }
};

const getAdmissionStats = async (req, res) => {
  try {
    const statusStats = await Admission.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const counsellorStats = await Admission.aggregate([
      { $group: { _id: '$counsellor', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const branchStats = await Admission.aggregate([
      { $group: { _id: '$trainingBranch', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyStats = await Admission.aggregate([
      { $match: { admissionDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$admissionDate' }, month: { $month: '$admissionDate' } },
          count: { $sum: 1 }
        }
      },
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

const searchApprovedStudents = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || name.length < 1) return res.status(200).json({ success: true, data: [] });

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