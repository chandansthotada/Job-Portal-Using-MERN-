const Job         = require('../models/Job');
const Recruiter   = require('../models/Recruiter');
const Application = require('../models/Application');

// ─── POST A JOB ───────────────────────────────────────────────────────────────
const postJob = async (req, res) => {
  try {
    const {
      recruiterId,
      title, description,
      responsibilities, requirements,
      location, isRemote,
      jobType, experience,
      salaryMin, salaryMax, salaryCurrency,
      salaryPeriod, isSalaryHidden,
      vacancy, deadline,
      skills, hiringProcess, perks,
    } = req.body;

    if (!recruiterId) return res.status(400).json({ message: 'Recruiter ID required' });

    const recruiter = await Recruiter.findById(recruiterId);
    if (!recruiter)  return res.status(404).json({ message: 'Recruiter not found' });

    const parseField = (field) => {
      if (!field) return [];
      try { return JSON.parse(field); } catch { return []; }
    };

    const job = new Job({
      recruiter:       recruiterId,
      title,
      description,
      responsibilities: parseField(responsibilities),
      requirements:     parseField(requirements),

      // Company snapshot from recruiter
      companyName:  recruiter.companyName,
      companyLogo:  recruiter.companyLogo,
      companyBio:   recruiter.companyBio,
      location,
      isRemote:     isRemote === 'true',

      jobType,
      experience,
      salary: {
        min:      salaryMin      || 0,
        max:      salaryMax      || 0,
        currency: salaryCurrency || 'INR',
        period:   salaryPeriod   || 'yearly',
        isHidden: isSalaryHidden === 'true',
      },
      vacancy:  vacancy  || 1,
      deadline: deadline || null,

      skills:        parseField(skills),
      hiringProcess: parseField(hiringProcess),
      perks:         parseField(perks),
    });

    await job.save();

    res.status(201).json({
      message: '✅ Job posted successfully!',
      job,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET ALL JOBS (with search + filters + pagination) ────────────────────────
const getAllJobs = async (req, res) => {
  try {
    const {
      search, location, jobType, experience,
      skills, salaryMin, salaryMax,
      isRemote, page = 1, limit = 10,
      sortBy = 'createdAt',
    } = req.query;

    const query = { isActive: true };

    // Full text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (location) query.location   = { $regex: location, $options: 'i' };
    if (jobType)  query.jobType    = jobType;
    if (isRemote) query.isRemote   = isRemote === 'true';
    if (experience) query.experience = { $regex: experience, $options: 'i' };

    if (skills) {
      const skillArr = skills.split(',').map((s) => s.trim());
      query.skills = { $in: skillArr.map((s) => new RegExp(s, 'i')) };
    }

    if (salaryMin || salaryMax) {
      query['salary.isHidden'] = false;
      if (salaryMin) query['salary.min'] = { $gte: parseInt(salaryMin) };
      if (salaryMax) query['salary.max'] = { $lte: parseInt(salaryMax) };
    }

    const skip  = (page - 1) * limit;
    const total = await Job.countDocuments(query);

    const sortOption = sortBy === 'salary'
      ? { 'salary.max': -1 }
      : sortBy === 'views'
      ? { views: -1 }
      : { createdAt: -1 };

    const jobs = await Job.find(query)
      .populate('recruiter', 'name recruiterPhoto designation companyName companyLogo headquarters website')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / limit),
      jobs,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET SINGLE JOB ───────────────────────────────────────────────────────────
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', '-password');

    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Increment views
    job.views += 1;
    await job.save();

    // Application count
    const applicationCount = await Application.countDocuments({ job: job._id });

    res.status(200).json({ job, applicationCount });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET JOBS BY RECRUITER ────────────────────────────────────────────────────
const getJobsByRecruiter = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { recruiter: req.params.recruiterId };
    if (status === 'active')   query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const skip  = (page - 1) * limit;
    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add application count to each job
    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicationCount };
      })
    );

    res.status(200).json({
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / limit),
      jobs:       jobsWithCount,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── UPDATE JOB ───────────────────────────────────────────────────────────────
const updateJob = async (req, res) => {
  try {
    const { recruiterId, ...updateData } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Verify ownership
    if (job.recruiter.toString() !== recruiterId) {
      return res.status(403).json({ message: '❌ Unauthorized - Not your job post' });
    }

    const parseField = (field) => {
      if (!field) return undefined;
      try { return JSON.parse(field); } catch { return field; }
    };

    // Update fields
    const fields = [
      'title', 'description', 'location', 'jobType',
      'experience', 'vacancy', 'deadline', 'isRemote',
    ];
    fields.forEach((f) => { if (updateData[f] !== undefined) job[f] = updateData[f]; });

    // Array fields
    const arrayFields = ['responsibilities', 'requirements', 'skills', 'perks'];
    arrayFields.forEach((f) => {
      const parsed = parseField(updateData[f]);
      if (parsed) job[f] = parsed;
    });

    const parsedHiring = parseField(updateData.hiringProcess);
    if (parsedHiring) job.hiringProcess = parsedHiring;

    // Salary
    if (updateData.salaryMin) job.salary.min      = updateData.salaryMin;
    if (updateData.salaryMax) job.salary.max      = updateData.salaryMax;
    if (updateData.isSalaryHidden !== undefined)
      job.salary.isHidden = updateData.isSalaryHidden === 'true';

    // Active status
    if (updateData.isActive !== undefined) job.isActive = updateData.isActive === 'true';

    await job.save();

    res.status(200).json({ message: '✅ Job updated successfully', job });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── TOGGLE JOB STATUS ────────────────────────────────────────────────────────
const toggleJobStatus = async (req, res) => {
  try {
    const { recruiterId } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiter.toString() !== recruiterId) {
      return res.status(403).json({ message: '❌ Unauthorized' });
    }

    job.isActive = !job.isActive;
    await job.save();

    res.status(200).json({
      message:  job.isActive ? '✅ Job activated' : '🔒 Job deactivated',
      isActive: job.isActive,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── DELETE JOB ───────────────────────────────────────────────────────────────
const deleteJob = async (req, res) => {
  try {
    const { recruiterId } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiter.toString() !== recruiterId) {
      return res.status(403).json({ message: '❌ Unauthorized - Not your job post' });
    }

    await Job.findByIdAndDelete(req.params.id);

    // Delete all applications for this job
    await Application.deleteMany({ job: req.params.id });

    res.status(200).json({ message: '✅ Job and related applications deleted' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET SIMILAR JOBS ─────────────────────────────────────────────────────────
const getSimilarJobs = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const similar = await Job.find({
      _id:      { $ne: job._id },
      isActive: true,
      $or: [
        { skills:   { $in: job.skills } },
        { jobType:  job.jobType         },
        { location: job.location        },
      ],
    })
    .populate('recruiter', 'name companyName companyLogo')
    .limit(4);

    res.status(200).json({ similar });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  postJob,
  getAllJobs,
  getJobById,
  getJobsByRecruiter,
  updateJob,
  toggleJobStatus,
  deleteJob,
  getSimilarJobs,
};