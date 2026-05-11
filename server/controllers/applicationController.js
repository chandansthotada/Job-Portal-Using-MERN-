const Application = require('../models/Application');
const Job         = require('../models/Job');
const Candidate   = require('../models/Candidate');
const Recruiter   = require('../models/Recruiter');

// ─── APPLY FOR JOB ────────────────────────────────────────────────────────────
const applyJob = async (req, res) => {
  try {
    const { candidateId, jobId, coverLetter } = req.body;

    if (!candidateId || !jobId) {
      return res.status(400).json({ message: 'Candidate ID and Job ID required' });
    }

    // Validate candidate
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    // Validate job
    const job = await Job.findById(jobId);
    if (!job)        return res.status(404).json({ message: 'Job not found' });
    if (!job.isActive) return res.status(400).json({ message: '❌ This job is no longer active' });

    // Check deadline
    if (job.deadline && new Date() > new Date(job.deadline)) {
      return res.status(400).json({ message: '❌ Application deadline has passed' });
    }

    // Check already applied
    const alreadyApplied = await Application.findOne({
      candidate: candidateId,
      job:       jobId,
    });
    if (alreadyApplied) {
      return res.status(409).json({ message: '❌ You have already applied for this job' });
    }

    // Resume is required
    if (!req.file?.path) {
      return res.status(400).json({ message: 'Resume (PDF) is required' });
    }

    const application = new Application({
      candidate:   candidateId,
      job:         jobId,
      recruiter:   job.recruiter,
      resume:      req.file.path,
      coverLetter: coverLetter || '',
    });

    await application.save();

    res.status(201).json({
      message: '✅ Application submitted successfully!',
      application: {
        _id:         application._id,
        job:         job.title,
        company:     job.companyName,
        status:      application.status,
        appliedAt:   application.appliedAt,
      },
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: '❌ You have already applied for this job' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET ALL APPLICANTS FOR A JOB (Recruiter view) ───────────────────────────
const getApplicantsByJob = async (req, res) => {
  try {
    const { jobId }                             = req.params;
    const { status, page = 1, limit = 10 }     = req.query;

    const query = { job: jobId };
    if (status) query.status = status;

    const skip  = (page - 1) * limit;
    const total = await Application.countDocuments(query);

    const applications = await Application.find(query)
      .populate('candidate', '-password -savedJobs')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Stats for this job
    const [pending, reviewed, shortlisted, approved, rejected] = await Promise.all([
      Application.countDocuments({ job: jobId, status: 'Pending'     }),
      Application.countDocuments({ job: jobId, status: 'Reviewed'    }),
      Application.countDocuments({ job: jobId, status: 'Shortlisted' }),
      Application.countDocuments({ job: jobId, status: 'Approved'    }),
      Application.countDocuments({ job: jobId, status: 'Rejected'    }),
    ]);

    res.status(200).json({
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / limit),
      stats: { pending, reviewed, shortlisted, approved, rejected },
      applications,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET ALL APPLICATIONS BY CANDIDATE ───────────────────────────────────────
const getApplicationsByCandidate = async (req, res) => {
  try {
    const { candidateId }              = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { candidate: candidateId };
    if (status) query.status = status;

    const skip  = (page - 1) * limit;
    const total = await Application.countDocuments(query);

    const applications = await Application.find(query)
      .populate({
        path:     'job',
        select:   'title companyName companyLogo location jobType salary skills isActive',
        populate: { path: 'recruiter', select: 'name recruiterPhoto designation' },
      })
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Stats
    const [pending, reviewed, shortlisted, approved, rejected] = await Promise.all([
      Application.countDocuments({ candidate: candidateId, status: 'Pending'     }),
      Application.countDocuments({ candidate: candidateId, status: 'Reviewed'    }),
      Application.countDocuments({ candidate: candidateId, status: 'Shortlisted' }),
      Application.countDocuments({ candidate: candidateId, status: 'Approved'    }),
      Application.countDocuments({ candidate: candidateId, status: 'Rejected'    }),
    ]);

    res.status(200).json({
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / limit),
      stats: { pending, reviewed, shortlisted, approved, rejected },
      applications,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET SINGLE APPLICATION DETAIL ───────────────────────────────────────────
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidate', '-password -savedJobs')
      .populate('job')
      .populate('recruiter', '-password');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    res.status(200).json({ application });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── UPDATE APPLICATION STATUS (Recruiter) ───────────────────────────────────
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, recruiterNote, recruiterId } = req.body;

    const validStatuses = ['Pending', 'Reviewed', 'Shortlisted', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Verify recruiter owns this application
    if (application.recruiter.toString() !== recruiterId) {
      return res.status(403).json({ message: '❌ Unauthorized' });
    }

    application.status        = status;
    application.recruiterNote = recruiterNote || application.recruiterNote;
    application.updatedAt     = new Date();
    await application.save();

    res.status(200).json({
      message:     `✅ Application ${status.toLowerCase()} successfully`,
      application: {
        _id:           application._id,
        status:        application.status,
        recruiterNote: application.recruiterNote,
        updatedAt:     application.updatedAt,
      },
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── CHECK IF ALREADY APPLIED ─────────────────────────────────────────────────
const checkApplication = async (req, res) => {
  try {
    const { candidateId, jobId } = req.params;

    const application = await Application.findOne({
      candidate: candidateId,
      job:       jobId,
    });

    if (application) {
      return res.status(200).json({
        hasApplied:  true,
        status:      application.status,
        appliedAt:   application.appliedAt,
        applicationId: application._id,
      });
    }

    res.status(200).json({ hasApplied: false });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── WITHDRAW APPLICATION ─────────────────────────────────────────────────────
const withdrawApplication = async (req, res) => {
  try {
    const { candidateId } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.candidate.toString() !== candidateId) {
      return res.status(403).json({ message: '❌ Unauthorized' });
    }

    if (application.status === 'Approved') {
      return res.status(400).json({ message: '❌ Cannot withdraw an approved application' });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: '✅ Application withdrawn successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET ALL APPLICATIONS BY RECRUITER ───────────────────────────────────────
const getApplicationsByRecruiter = async (req, res) => {
  try {
    const { recruiterId }                      = req.params;
    const { status, page = 1, limit = 10 }    = req.query;

    const query = { recruiter: recruiterId };
    if (status) query.status = status;

    const skip  = (page - 1) * limit;
    const total = await Application.countDocuments(query);

    const applications = await Application.find(query)
      .populate('candidate', 'name email profilePhoto headline skills totalExperience')
      .populate('job',       'title companyName location jobType')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / limit),
      applications,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  applyJob,
  getApplicantsByJob,
  getApplicationsByCandidate,
  getApplicationById,
  updateApplicationStatus,
  checkApplication,
  withdrawApplication,
  getApplicationsByRecruiter,
};