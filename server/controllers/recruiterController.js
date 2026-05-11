const Recruiter    = require('../models/Recruiter');
const Job          = require('../models/Job');
const Application  = require('../models/Application');

// ─── REGISTER ────────────────────────────────────────────────────────────────
const registerRecruiter = async (req, res) => {
  try {
    const {
      name, email, password, phone,
      designation, bio,
      companyName, companyBio, industry,
      companySize, founded, headquarters, website,
    } = req.body;

    // Check duplicate
    const existing = await Recruiter.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    if (!companyName) return res.status(400).json({ message: 'Company name is required' });

    // Handle uploaded files
    const recruiterPhoto = req.files?.recruiterPhoto?.[0]?.path || null;
    const companyLogo    = req.files?.companyLogo?.[0]?.path    || null;
    const companyImages  = req.files?.companyImages
      ? req.files.companyImages.map((f) => f.path)
      : [];

    const recruiter = new Recruiter({
      name, email, password, phone,
      designation, bio,
      recruiterPhoto,
      companyName, companyLogo, companyImages,
      companyBio, industry, companySize,
      founded, headquarters, website,
    });

    await recruiter.save();

    res.status(201).json({
      message:   '✅ Recruiter registered successfully!',
      recruiter: {
        _id:         recruiter._id,
        name:        recruiter.name,
        email:       recruiter.email,
        companyName: recruiter.companyName,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const recruiter = await Recruiter.findOne({ email: email.toLowerCase() });
    if (!recruiter)
      return res.status(404).json({ message: 'No account found with this email' });

    if (recruiter.password !== password)
      return res.status(401).json({ message: 'Incorrect password' });

    if (!recruiter.isActive)
      return res.status(403).json({ message: 'Your account has been deactivated' });

    res.status(200).json({
      message:   '✅ Login successful',
      recruiter: {
        _id:            recruiter._id,
        name:           recruiter.name,
        email:          recruiter.email,
        phone:          recruiter.phone,
        designation:    recruiter.designation,
        recruiterPhoto: recruiter.recruiterPhoto,
        companyName:    recruiter.companyName,
        companyLogo:    recruiter.companyLogo,
        companyImages:  recruiter.companyImages,
        industry:       recruiter.industry,
        headquarters:   recruiter.headquarters,
        website:        recruiter.website,
        isVerified:     recruiter.isVerified,
      },
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
const getRecruiterProfile = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id).select('-password');
    if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });

    // Get job count
    const jobCount = await Job.countDocuments({ recruiter: req.params.id });

    res.status(200).json({ recruiter, jobCount });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
const updateRecruiterProfile = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id);
    if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });

    const {
      name, phone, designation, bio,
      companyName, companyBio, industry,
      companySize, founded, headquarters, website,
      socialLinks,
    } = req.body;

    // Update simple fields
    if (name)          recruiter.name          = name;
    if (phone)         recruiter.phone         = phone;
    if (designation)   recruiter.designation   = designation;
    if (bio)           recruiter.bio           = bio;
    if (companyName)   recruiter.companyName   = companyName;
    if (companyBio)    recruiter.companyBio    = companyBio;
    if (industry)      recruiter.industry      = industry;
    if (companySize)   recruiter.companySize   = companySize;
    if (founded)       recruiter.founded       = founded;
    if (headquarters)  recruiter.headquarters  = headquarters;
    if (website)       recruiter.website       = website;

    // Social links
    if (socialLinks) {
      const parsed = typeof socialLinks === 'string'
        ? JSON.parse(socialLinks) : socialLinks;
      recruiter.socialLinks = { ...recruiter.socialLinks?.toObject?.() || {}, ...parsed };
    }

    // Uploaded files
    if (req.files?.recruiterPhoto?.[0]?.path) {
      recruiter.recruiterPhoto = req.files.recruiterPhoto[0].path;
    }
    if (req.files?.companyLogo?.[0]?.path) {
      recruiter.companyLogo = req.files.companyLogo[0].path;
    }
    if (req.files?.companyImages?.length > 0) {
      const newImages = req.files.companyImages.map((f) => f.path);
      recruiter.companyImages = [...recruiter.companyImages, ...newImages];
    }

    await recruiter.save();

    res.status(200).json({
      message:   '✅ Profile updated successfully',
      recruiter: { ...recruiter.toObject(), password: undefined },
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── REMOVE COMPANY IMAGE ─────────────────────────────────────────────────────
const removeCompanyImage = async (req, res) => {
  try {
    const { id, imageIndex } = req.params;

    const recruiter = await Recruiter.findById(id);
    if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });

    recruiter.companyImages.splice(parseInt(imageIndex), 1);
    await recruiter.save();

    res.status(200).json({
      message:       '✅ Image removed',
      companyImages: recruiter.companyImages,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
const getRecruiterDashboard = async (req, res) => {
  try {
    const recruiterId = req.params.id;

    // All jobs by this recruiter
    const jobs = await Job.find({ recruiter: recruiterId }).sort({ createdAt: -1 });

    const jobIds = jobs.map((j) => j._id);

    // Application stats
    const [
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      approvedApplications,
      rejectedApplications,
    ] = await Promise.all([
      Application.countDocuments({ job: { $in: jobIds } }),
      Application.countDocuments({ job: { $in: jobIds }, status: 'Pending' }),
      Application.countDocuments({ job: { $in: jobIds }, status: 'Shortlisted' }),
      Application.countDocuments({ job: { $in: jobIds }, status: 'Approved' }),
      Application.countDocuments({ job: { $in: jobIds }, status: 'Rejected' }),
    ]);

    // Recent applications
    const recentApplications = await Application.find({ job: { $in: jobIds } })
      .sort({ appliedAt: -1 })
      .limit(5)
      .populate('candidate', 'name email profilePhoto headline')
      .populate('job',       'title');

    // Jobs with application count
    const jobsWithCount = await Promise.all(
      jobs.slice(0, 5).map(async (job) => {
        const count = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicationCount: count };
      })
    );

    res.status(200).json({
      stats: {
        totalJobs:        jobs.length,
        activeJobs:       jobs.filter((j) => j.isActive).length,
        totalApplications,
        pendingApplications,
        shortlistedApplications,
        approvedApplications,
        rejectedApplications,
      },
      recentApplications,
      recentJobs: jobsWithCount,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  registerRecruiter,
  loginRecruiter,
  getRecruiterProfile,
  updateRecruiterProfile,
  removeCompanyImage,
  getRecruiterDashboard,
};