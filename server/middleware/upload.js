const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';

    if (file.fieldname === 'profilePhoto')    folder += 'candidates/';
    else if (file.fieldname === 'recruiterPhoto') folder += 'recruiters/';
    else if (file.fieldname === 'companyLogo')    folder += 'companies/';
    else if (file.fieldname === 'companyImages')  folder += 'companies/';
    else if (file.fieldname === 'resume')         folder += 'resumes/';
    else folder += 'misc/';

    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    // Only PDF for resume
    const allowed = /pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Only PDF allowed for resume'));
  } else {
    // Images for everything else
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;