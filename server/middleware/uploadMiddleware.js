const multer = require('multer');

// Use memory storage
const storage = multer.memoryStorage();

// File filter - allow images and PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for admission documents
  }
});

// Middleware for student file uploads
const uploadStudentFiles = upload.fields([
  { name: 'studentPhoto', maxCount: 1 },
  { name: 'studentSignature', maxCount: 1 },
  { name: 'idProofPhoto', maxCount: 1 }
]);

// Middleware for admission file uploads
const uploadAdmissionFiles = upload.fields([
  { name: 'admissionFrontPage', maxCount: 1 },
  { name: 'admissionBackPage', maxCount: 1 },
  { name: 'studentStatement', maxCount: 1 },
  { name: 'confidentialForm', maxCount: 1 }
]);

// Error handling middleware
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name for file upload.'
      });
    }
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next();
};

module.exports = {
  uploadStudentFiles,
  uploadAdmissionFiles,
  handleUploadErrors
};