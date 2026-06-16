const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists in the workspace
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const blockedExtensions = ['.exe', '.js', '.php', '.bat', '.sh', '.cmd', '.vbs', '.scr'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (blockedExtensions.includes(ext)) {
    return cb(new Error('Extension blocked. Script or executable uploads are prohibited.'), false);
  }
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.'), false);
  }
  
  cb(null, true);
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
