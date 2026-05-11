const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/upload');
const {
  applyJob,
  getApplicantsByJob,
  getApplicationsByCandidate,
  getApplicationById,
  updateApplicationStatus,
  checkApplication,
  withdrawApplication,
  getApplicationsByRecruiter,
} = require('../controllers/applicationController');

// Apply for a job (with resume upload)
router.post('/apply', upload.single('resume'), applyJob);

// Get all applicants for a specific job (recruiter)
router.get('/job/:jobId', getApplicantsByJob);

// Get all applications by a candidate
router.get('/candidate/:candidateId', getApplicationsByCandidate);

// Get all applications by a recruiter (across all jobs)
router.get('/recruiter/:recruiterId', getApplicationsByRecruiter);

// Get single application detail
router.get('/:id', getApplicationById);

// Check if candidate already applied
router.get('/check/:candidateId/:jobId', checkApplication);

// Update application status (recruiter)
router.patch('/:id/status', updateApplicationStatus);

// Withdraw application (candidate)
router.delete('/:id/withdraw', withdrawApplication);

module.exports = router;