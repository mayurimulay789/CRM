const fs = require('fs');
const path = require('path');

// Test multiple possible locations
const possiblePaths = [
  path.join(__dirname, 'assets/RYMA_ACADEMY_PRIVACY_&_POLICIES.pdf'),
  path.join(__dirname, 'backend/assets/RYMA_ACADEMY_PRIVACY_&_POLICIES.pdf'),
  path.join(__dirname, 'src/assets/RYMA_ACADEMY_PRIVACY_&_POLICIES.pdf'),
];

possiblePaths.forEach(testPath => {
  console.log(`\nChecking: ${testPath}`);
  
  try {
    if (fs.existsSync(testPath)) {
      console.log('✅ File exists');
      
      const stats = fs.statSync(testPath);
      console.log(`📊 File size: ${stats.size} bytes`);
      
      // Read first 5 bytes to check PDF header
      const fd = fs.openSync(testPath, 'r');
      const buffer = Buffer.alloc(5);
      fs.readSync(fd, buffer, 0, 5, 0);
      fs.closeSync(fd);
      
      const header = buffer.toString();
      console.log(`📋 First 5 bytes: ${header}`);
      
      if (header === '%PDF-') {
        console.log('✅ Valid PDF file');
        
        // Try to read the whole file
        const fullBuffer = fs.readFileSync(testPath);
        console.log(`✅ Successfully read ${fullBuffer.length} bytes`);
      } else {
        console.log('❌ Not a valid PDF file (missing %PDF- header)');
      }
    } else {
      console.log('❌ File does not exist');
    }
  } catch (err) {
    console.log('❌ Error reading file:', err.message);
  }
});