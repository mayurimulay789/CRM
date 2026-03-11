const Admission = require('../models/Admission');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const sendMail = require('../utils/email').sendMail;
const path = require('path');
// Helper function to convert Cloudinary URLs to viewable/downloadable format
const makeViewableUrl = (url) => {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  console.log(`📄 Processing document URL for iframe viewing: ${url}`);

  try {
    // For Cloudinary raw uploads (PDFs), convert to iframe-optimized format
    if (url.includes('/raw/upload/')) {
      const baseUrl = url.split('/raw/upload/')[0];
      let resourcePath = url.split('/raw/upload/')[1];

      // Remove version if present
      resourcePath = resourcePath.replace(/^v\d+\//, '');

      // Ensure .pdf extension
      if (!resourcePath.endsWith('.pdf')) {
        resourcePath += '.pdf';
      }

      // Optimized URL for iframe viewing (no download flags, just format specification)
      const viewableUrl = `${baseUrl}/raw/upload/f_pdf,fl_immutable_cache,q_auto/${resourcePath}`;
      console.log(`✅ Generated iframe-optimized PDF URL: ${viewableUrl}`);
      return viewableUrl;
    } else if (url.includes('/image/upload/')) {
      // For image uploads that are actually PDFs
      const viewableUrl = url.replace('/image/upload/', '/image/upload/f_pdf,fl_immutable_cache,q_auto/');
      console.log(`✅ Processed image upload URL for iframe PDF viewing: ${viewableUrl}`);
      return viewableUrl;
    }

    // For regular uploads, return as-is
    console.log(`📋 Returning original URL (standard format): ${url}`);
    return url;
  } catch (error) {
    console.error('❌ Error processing URL for iframe viewing:', error);

    // Fallback: try basic iframe-compatible format
    try {
      if (url.includes('cloudinary.com') && url.includes('upload')) {
        const parts = url.split('/upload/');
        if (parts.length === 2) {
          const fallbackUrl = `${parts[0]}/upload/f_pdf/${parts[1]}`;
          console.log(`⚠️ Using fallback iframe URL: ${fallbackUrl}`);
          return fallbackUrl;
        }
      }
    } catch (fallbackError) {
      console.error('❌ Fallback processing failed:', fallbackError);
    }

    return url;
  }
};

// Helper function to process admission document URLs
const processAdmissionDocuments = (admission) => {
  if (!admission) return admission;

  const processed = admission.toObject ? admission.toObject() : { ...admission };

  // Process document URLs for viewing
  if (processed.admissionFrontPage) {
    processed.admissionFrontPage = makeViewableUrl(processed.admissionFrontPage);
  }
  if (processed.admissionBackPage) {
    processed.admissionBackPage = makeViewableUrl(processed.admissionBackPage);
  }
  if (processed.studentStatement) {
    processed.studentStatement = makeViewableUrl(processed.studentStatement);
  }
  if (processed.confidentialForm) {
    processed.confidentialForm = makeViewableUrl(processed.confidentialForm);
  }

  return processed;
};

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

    // Process document URLs for each admission
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

    // Process document URLs for viewing
    const processedAdmission = processAdmissionDocuments(admission);

    res.status(200).json({
      success: true,
      data: processedAdmission
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

    // Process document URLs for viewing
    const processedAdmission = processAdmissionDocuments(admission);

    res.status(200).json({
      success: true,
      data: processedAdmission
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

    // Process document URLs for each admission
    const processedAdmissions = admissions.map(admission => processAdmissionDocuments(admission));

    res.status(200).json({
      success: true,
      count: processedAdmissions.length,
      data: processedAdmissions
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
        console.log('3. Starting file uploads to Cloudinary...');
        if (req.files.admissionFrontPage && req.files.admissionFrontPage[0]) {
          const file = req.files.admissionFrontPage[0];
          console.log('📄 Uploading admission front page:', file.originalname);
          admissionFrontPageUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/front-pages', file.originalname);
          console.log('✅ Admission front page uploaded:', admissionFrontPageUrl);
        }
        if (req.files.admissionBackPage && req.files.admissionBackPage[0]) {
          const file = req.files.admissionBackPage[0];
          console.log('📄 Uploading admission back page:', file.originalname);
          admissionBackPageUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/back-pages', file.originalname);
          console.log('✅ Admission back page uploaded:', admissionBackPageUrl);
        }
        if (req.files.studentStatement && req.files.studentStatement[0]) {
          const file = req.files.studentStatement[0];
          console.log('📄 Uploading student statement:', file.originalname);
          studentStatementUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/statements', file.originalname);
          console.log('✅ Student statement uploaded:', studentStatementUrl);
        }
        if (req.files.confidentialForm && req.files.confidentialForm[0]) {
          const file = req.files.confidentialForm[0];
          console.log('📄 Uploading confidential form:', file.originalname);
          confidentialFormUrl = await uploadToCloudinary(file.buffer, 'lms/admissions/confidential-forms', file.originalname);
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
    // Prepare attachments array
    // Helper to create download link with filename
    function makeDownloadUrl(url, filename) {
      if (!url) return url;
      console.log(`🔗 Processing URL for PDF download: ${url}`);
      // For Cloudinary URLs, create proper download link with PDF format
      if (url.includes('res.cloudinary.com')) {
        try {
          // Handle raw uploads (PDFs)
          if (url.includes('/raw/upload/')) {
            // Split the URL to insert transformation parameters
            const baseUrl = url.split('/raw/upload/')[0];
            let resourcePath = url.split('/raw/upload/')[1];

            // Remove version if present (v1234567890/)
            resourcePath = resourcePath.replace(/^v\d+\//, '');

            // Ensure the resource path ends with .pdf
            if (!resourcePath.endsWith('.pdf')) {
              resourcePath = resourcePath + '.pdf';
            }

            // Create download URL with proper attachment and format flags
            const downloadUrl = `${baseUrl}/raw/upload/fl_attachment:${filename}/f_pdf/${resourcePath}`;
            console.log(`📎 Generated PDF download URL: ${downloadUrl}`);
            return downloadUrl;
          }

          // Handle regular image uploads (shouldn't happen for PDFs, but just in case)
          else if (url.includes('/upload/')) {
            return url.replace('/upload/', `/upload/fl_attachment:${filename}/f_pdf/`);
          }
        } catch (error) {
          console.error('❌ Error processing PDF URL:', error);
        }
      }

      // Fallback: ensure URL ends with .pdf
      let fallbackUrl = url;
      if (!fallbackUrl.endsWith('.pdf')) {
        fallbackUrl = `${url}.pdf`;
      }
      console.log(`⚠️ Returning fallback PDF URL: ${fallbackUrl}`);
      return fallbackUrl;
    }

    const attachments = [];

    // Log original URLs for debugging
    console.log('🔍 Original URLs:');
    if (admissionFrontPageUrl) console.log(`   Front Page: ${admissionFrontPageUrl}`);
    if (admissionBackPageUrl) console.log(`   Back Page: ${admissionBackPageUrl}`);
    if (studentStatementUrl) console.log(`   Statement: ${studentStatementUrl}`);
    if (confidentialFormUrl) console.log(`   Confidential: ${confidentialFormUrl}`);

    // Create attachment objects with both transformed and original URLs
    if (admissionFrontPageUrl) {
      const transformedUrl = makeDownloadUrl(admissionFrontPageUrl, 'Admission_Front_Page.pdf');
      attachments.push({
        type: 'Admission Front Page',
        url: transformedUrl,
        originalUrl: admissionFrontPageUrl  // Keep original as fallback
      });
    }
    if (admissionBackPageUrl) {
      const transformedUrl = makeDownloadUrl(admissionBackPageUrl, 'Admission_Back_Page.pdf');
      attachments.push({
        type: 'Admission Back Page',
        url: transformedUrl,
        originalUrl: admissionBackPageUrl
      });
    }
    if (studentStatementUrl) {
      const transformedUrl = makeDownloadUrl(studentStatementUrl, 'Student_Statement.pdf');
      attachments.push({
        type: 'Student Statement',
        url: transformedUrl,
        originalUrl: studentStatementUrl
      });
    }
    if (confidentialFormUrl) {
      const transformedUrl = makeDownloadUrl(confidentialFormUrl, 'Confidential_Form.pdf');
      attachments.push({
        type: 'Confidential Form',
        url: transformedUrl,
        originalUrl: confidentialFormUrl
      });
    }

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

    // Send email to student with PDF/Cloudinary URLs
    const filePathforPolicy = path.join(__dirname, '..', 'assets', 'policy.pdf');
    const fileNameforPolicy = 'policy.pdf';

    let policyattachments = [
      {
        filename: fileNameforPolicy,
        path: 'https://drive.google.com/file/d/1YicXxjX89HJjPE1yjSQxqxMCTZTgOfaa/view?usp=sharing'
      }
    ];
    try {
      const studentEmail = admissionResponse.student?.email;
      if (studentEmail) {
        console.log('📧 Preparing email with attachments:');
        attachments.forEach((att, index) => {
          console.log(`   ${index + 1}. ${att.type}: ${att.url}`);
        });

        let emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Dear ${admissionResponse.student?.name || 'Student'},</h2>
            <p>Your admission has been processed successfully. Please find your document download links below:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">📄 Your PDF Documents:</h3>
              <ul style="list-style: none; padding: 0;">`;

        attachments.forEach(att => {
          emailHtml += `
                <li style="margin: 10px 0; padding: 10px; background: white; border-radius: 3px; border-left: 4px solid #007bff;">
                  <strong>${att.type} (PDF)</strong><br>
                  <a href="${att.url}" 
                     style="color: #007bff; text-decoration: none; font-weight: bold;"
                     download="${att.type.replace(/\s+/g, '_')}.pdf"
                     target="_blank">
                     📄 Download ${att.type} PDF
                  </a>
                  ${att.originalUrl && att.originalUrl !== att.url ? `
                  <br>
                  <a href="${att.originalUrl}" 
                     style="color: #28a745; text-decoration: none; font-size: 0.9em;"
                     download="${att.type.replace(/\s+/g, '_')}.pdf"
                     target="_blank">
                     🔗 Alternative PDF Link
                  </a>` : ''}
                  <br>
                  <small style="color: #6c757d;">Right-click and "Save As" if download doesn't start automatically</small>
                </li>           
                `
            ;
        });

        emailHtml += `
              </ul>
            </div>
            
            <p style="color: #666;">
              <strong>📋 Important Notes:</strong><br>
              • All documents are in PDF format<br>
              • If a document opens in browser instead of downloading, right-click the link and select "Save As"<br>
              • Ensure you have a PDF reader installed (like Adobe Reader, Chrome, Edge)<br>
              • If you have trouble opening any document, please contact our support team
            </p>
            
            <p>Thank you!</p>
          </div>`;

        await sendMail(studentEmail, 'Your Admission PDF Documents', emailHtml, false, policyattachments);
        console.log('✅ Admission document email sent to student:', studentEmail, policyattachments);
      }
    } catch (mailError) {
      console.error('❌ Error sending admission email:', mailError);
    }
    // Process document URLs for management interface viewing
    const processedResponse = processAdmissionDocuments(savedAdmission);
    res.status(201).json({
      success: true,
      message: 'Admission created successfully',
      data: processedResponse
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
      appliedBatch,
      source,
      notes
    } = req.body;
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
        if (req.files.admissionFrontPage && req.files.admissionFrontPage[0]) {
          const file = req.files.admissionFrontPage[0];
          console.log('📄 Uploading new admission front page:', file.originalname);
          fileUpdateData.admissionFrontPage = await uploadToCloudinary(file.buffer, 'lms/admissions/front-pages', file.originalname);

          // Delete old file if exists
          if (admission.admissionFrontPage) {
            await deleteFromCloudinary(admission.admissionFrontPage);
          }
          console.log('✅ Admission front page updated');
        }

        if (req.files.admissionBackPage && req.files.admissionBackPage[0]) {
          const file = req.files.admissionBackPage[0];
          console.log('📄 Uploading new admission back page:', file.originalname);
          fileUpdateData.admissionBackPage = await uploadToCloudinary(file.buffer, 'lms/admissions/back-pages', file.originalname);

          // Delete old file if exists
          if (admission.admissionBackPage) {
            await deleteFromCloudinary(admission.admissionBackPage);
          }
          console.log('✅ Admission back page updated');
        }

        if (req.files.studentStatement && req.files.studentStatement[0]) {
          const file = req.files.studentStatement[0];
          console.log('📄 Uploading new student statement:', file.originalname);
          fileUpdateData.studentStatement = await uploadToCloudinary(file.buffer, 'lms/admissions/statements', file.originalname);

          // Delete old file if exists
          if (admission.studentStatement) {
            await deleteFromCloudinary(admission.studentStatement);
          }
          console.log('✅ Student statement updated');
        }

        if (req.files.confidentialForm && req.files.confidentialForm[0]) {
          const file = req.files.confidentialForm[0];
          console.log('📄 Uploading new confidential form:', file.originalname);
          fileUpdateData.confidentialForm = await uploadToCloudinary(file.buffer, 'lms/admissions/confidential-forms', file.originalname);

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

    // Process document URLs for viewing
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
      console.log(`📧 Status changed to approved - sending confirmation email to: ${updatedAdmission.student?.email}`);
      try {
        await sendAdmissionConfirmationEmail(updatedAdmission);
        console.log(`✅ Admission confirmation email sent successfully`);
      } catch (emailError) {
        console.error('❌ Failed to send admission confirmation email:', emailError);
        // Log the error but don't fail the status update
        console.error('Email error details:', {
          studentEmail: updatedAdmission.student?.email,
          admissionNo: updatedAdmission.admissionNo,
          error: emailError.message,
          stack: emailError.stack
        });
      }
    }

    // Process document URLs for viewing
    const processedAdmission = processAdmissionDocuments(updatedAdmission);

    res.status(200).json({
      success: true,
      message: `Admission ${status} successfully`,
      data: processedAdmission
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
  console.log(`📧 Starting admission confirmation email for: ${admission.admissionNo}`);

  try {
    const { student, course } = admission;

    console.log(`📋 Email details:`, {
      admissionNo: admission.admissionNo,
      studentName: student?.name,
      studentEmail: student?.email,
      courseName: course?.name,
      hasStudent: !!student,
      hasCourse: !!course
    });

    if (!student || !student.email) {
      const error = `❌ Student email not found for admission: ${admission.admissionNo}`;
      console.error(error);
      throw new Error(`Student email missing for admission ${admission.admissionNo}`);
    }

    if (!course) {
      const error = `❌ Course not found for admission: ${admission.admissionNo}`;
      console.error(error);
      throw new Error(`Course missing for admission ${admission.admissionNo}`);
    }

    // Prepare document links (from both individual fields and attachments array)
    const documents = [
      { name: 'Admission Front Page', url: admission.admissionFrontPage },
      { name: 'Admission Back Page', url: admission.admissionBackPage },
      { name: 'Student Statement', url: admission.studentStatement },
      { name: 'Confidential Form', url: admission.confidentialForm },
      ...(admission.attachments || []).map(att => ({
        name: att.type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        url: att.url
      }))
    ].filter(doc => doc.url); // only include those with a URL

    // Email subject
    const subject = `🎓 Welcome to RYMA ACADEMY | Your Admission is Officially Confirmed`;

    // Email HTML content
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
      margin:  auto;
      background-color: #ffffff;
      overflow: hidden;
      box-shadow: 0 12px 28px rgba(150, 30, 30, 0.2);
    }
    /* header image area */
    .header-image {
      width: 100%;
      background-color: #b31b1b; /* fallback color */
      text-align: center;
      padding: 0;
      line-height: 0; /* removes extra space below image */
    }
    .header-image img {
      width: 100%;
      height: auto;
      display: block;
      max-height: 180px;
      object-fit: cover;
      background-color: #8a1e1e; /* while image loads */
    }
    /* if image is not provided, show a styled placeholder */
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
    .imgformate{
        width:1200px;
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
    gap: 12px 8px; /* space between items */
    word-break: break-word;
}

.contact-footer a {
    color: #a13030;
    text-decoration: underline;
    white-space: nowrap; /* prevent phone numbers from breaking */
}

/* Responsive stacking on small screens */
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
}
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header image area: replace src with your logo/banner -->
     <img src=${server/assets/header.png} alt="" class="imgformate">
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
        This single word carries the weight of every late night, every effort, and every dream you have invested in your future. Today, that effort has been acknowledged.
      </div>

      <!-- On behalf of family block -->
      <div class="family-block">
        <strong>On behalf of the entire RYMA ACADEMY family</strong> — it is our immense honour and privilege to officially confirm your admission. You are no longer just an applicant. You are now a part of an institution that has been built on one singular promise:
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
        <tr><td class="label-cell">Student Name</td><td class="value-cell"><strong>${student.name}</strong></td></tr>
        <tr><td class="label-cell">Student ID</td><td class="value-cell"><strong>${student.studentId}</strong></td></tr>
        <tr><td class="label-cell">Applied Program</td><td class="value-cell"><strong>${course.name}</strong></td></tr>
        <tr><td class="label-cell">Program Duration</td><td class="value-cell"><strong>${course.duration}</strong></td></tr>
        <tr><td class="label-cell">Program Fee</td><td class="value-cell"><strong>₹${course.fee}</strong></td></tr>
        <tr><td class="label-cell">Training Campus</td><td class="value-cell"><strong>${admission.trainingBranch}</strong></td></tr>
        <tr><td class="label-cell">Admission Date</td><td class="value-cell"><strong>${new Date(admission.admissionDate).toLocaleDateString('en-IN')}</strong></td></tr>
        <tr><td class="label-cell">Processed By</td><td class="value-cell"><strong>${admission.counsellor}</strong></td></tr>
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

    // Send email to student with BCC for submission
    await sendMail(student.email, subject, html, true);

    console.log(`✅ Admission confirmation email (with documents) sent to ${student.email} with BCC`);

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

const searchApprovedStudents = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.length < 1) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Find approved admissions and populate student details
    const approvedAdmissions = await Admission.find({ status: 'approved' })
      .populate('student', 'studentId name email phone')
      .select('student');

    // Filter students by name and remove duplicates
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

    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching approved students',
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
  getAdmissionStats,
  searchApprovedStudents
};      