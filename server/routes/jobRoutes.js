const express = require('express');
const router  = express.Router();
const {
  postJob,
  getAllJobs,
  getJobById,
  getJobsByRecruiter,
  updateJob,
  toggleJobStatus,
  deleteJob,
  getSimilarJobs,
} = require('../controllers/jobController');

// Post a job
router.post('/', postJob);

// Get all jobs (search + filter)
router.get('/', getAllJobs);

// Get single job
router.get('/:id', getJobById);

// Get similar jobs
router.get('/:id/similar', getSimilarJobs);

// Get all jobs by a recruiter
router.get('/recruiter/:recruiterId', getJobsByRecruiter);

// Update job
router.put('/:id', updateJob);

// Toggle active/inactive
router.patch('/:id/toggle', toggleJobStatus);

// Delete job
router.delete('/:id', deleteJob);

module.exports = router;