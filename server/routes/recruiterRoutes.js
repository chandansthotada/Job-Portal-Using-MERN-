const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/upload');
const {
  registerRecruiter,
  loginRecruiter,
  getRecruiterProfile,
  updateRecruiterProfile,
  removeCompanyImage,
  getRecruiterDashboard,
} = require('../controllers/recruiterController');

// Auth
router.post('/register',
  upload.fields([
    { name: 'recruiterPhoto', maxCount: 1  },
    { name: 'companyLogo',    maxCount: 1  },
    { name: 'companyImages',  maxCount: 5  },
  ]),
  registerRecruiter
);
router.post('/login', loginRecruiter);

// Profile
router.get('/profile/:id', getRecruiterProfile);
router.put('/profile/:id',
  upload.fields([
    { name: 'recruiterPhoto', maxCount: 1 },
    { name: 'companyLogo',    maxCount: 1 },
    { name: 'companyImages',  maxCount: 5 },
  ]),
  updateRecruiterProfile
);

// Remove a company image by index
router.delete('/profile/:id/image/:imageIndex', removeCompanyImage);

// Dashboard
router.get('/dashboard/:id', getRecruiterDashboard);

module.exports = router;