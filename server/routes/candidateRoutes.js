const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/upload');
const {
  registerCandidate,
  loginCandidate,
  getCandidateProfile,
  updateCandidateProfile,
  toggleOpenToWork,
  bookmarkJob,
  getBookmarks,
  searchCandidates,
} = require('../controllers/candidateController');

// Auth
router.post('/register', upload.single('profilePhoto'), registerCandidate);
router.post('/login',    loginCandidate);

// Profile
router.get('/profile/:id',  getCandidateProfile);
router.put('/profile/:id',  upload.single('profilePhoto'), updateCandidateProfile);

// Open to work toggle
router.patch('/toggle-open/:id', toggleOpenToWork);

// Bookmarks
router.post('/bookmark/:id/:jobId', bookmarkJob);
router.get('/bookmarks/:id',        getBookmarks);

// Search (for recruiters)
router.get('/search', searchCandidates);

module.exports = router;