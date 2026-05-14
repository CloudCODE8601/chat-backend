const multer = require('multer');
const path = require('path');
const fs = require('fs'); // ✅ ADD THIS

// ✅ Ensure uploads folder exists
const uploadPath = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true }); // ✅ CREATE FOLDER
}

// ✅ Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath); // ✅ USE FULL PATH
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

// ✅ File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;