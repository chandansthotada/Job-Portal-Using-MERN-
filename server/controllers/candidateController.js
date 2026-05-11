const Candidate = require('../models/Candidate');
const Job       = require('../models/Job');

// ─── REGISTER ────────────────────────────────────────────────────────────────
const registerCandidate = async (req, res) => {
  try {
    const {
      name, email, password, phone, dob, gender,
      headline, bio, location, portfolio,
      skills, jobType, expectedSalary,
      noticePeriod, totalExperience,
      preferredRoles, preferredLocations,
    } = req.body;

    // Check duplicate
    const existing = await Candidate.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const profilePhoto = req.file?.path || null;

    // Parse arrays sent as JSON strings from form-data
    const parseField = (field) => {
      if (!field) return [];
      try { return JSON.parse(field); } catch { return []; }
    };

    const candidate = new Candidate({
      name, email, password, phone, dob, gender,
      headline, bio, location, portfolio,
      profilePhoto,
      skills:             parseField(skills),
      preferredRoles:     parseField(preferredRoles),
      preferredLocations: parseField(preferredLocations),
      jobType, expectedSalary, noticePeriod, totalExperience,
    });

    await candidate.save();

    res.status(201).json({
      message:   '✅ Registration successful!',
      candidate: {
        _id:   candidate._id,
        name:  candidate.name,
        email: candidate.email,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const loginCandidate = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const candidate = await Candidate.findOne({ email: email.toLowerCase() });
    if (!candidate)
      return res.status(404).json({ message: 'No account found with this email' });

    if (candidate.password !== password)
      return res.status(401).json({ message: 'Incorrect password' });

    if (!candidate.isActive)
      return res.status(403).json({ message: 'Your account has been deactivated' });

    res.status(200).json({
      message:   '✅ Login successful',
      candidate: {
        _id:          candidate._id,
        name:         candidate.name,
        email:        candidate.email,
        phone:        candidate.phone,
        headline:     candidate.headline,
        profilePhoto: candidate.profilePhoto,
        skills:       candidate.skills,
        isOpen:       candidate.isOpen,
        savedJobs:    candidate.savedJobs,
      },
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
const getCandidateProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .select('-password')
      .populate('savedJobs', 'title companyName location jobType salary');

    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    res.status(200).json({ candidate });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
const updateCandidateProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    const parseField = (field) => {
      if (!field) return undefined;
      try { return JSON.parse(field); } catch { return field; }
    };

    const {
      name, phone, dob, gender, headline, bio,
      location, portfolio, jobType, expectedSalary,
      noticePeriod, totalExperience, isOpen,
      skills, preferredRoles, preferredLocations,
      socialLinks, education, experience,
      certifications, projects, achievements,
    } = req.body;

    // Simple fields
    if (name)             candidate.name             = name;
    if (phone)            candidate.phone            = phone;
    if (dob)              candidate.dob              = dob;
    if (gender)           candidate.gender           = gender;
    if (headline)         candidate.headline         = headline;
    if (bio)              candidate.bio              = bio;
    if (location)         candidate.location         = location;
    if (portfolio)        candidate.portfolio        = portfolio;
    if (jobType)          candidate.jobType          = jobType;
    if (expectedSalary)   candidate.expectedSalary   = expectedSalary;
    if (noticePeriod)     candidate.noticePeriod     = noticePeriod;
    if (totalExperience)  candidate.totalExperience  = totalExperience;
    if (isOpen !== undefined) candidate.isOpen       = isOpen === 'true';

    // Array fields
    const parsedSkills = parseField(skills);
    if (parsedSkills) candidate.skills = parsedSkills;

    const parsedRoles = parseField(preferredRoles);
    if (parsedRoles) candidate.preferredRoles = parsedRoles;

    const parsedLocations = parseField(preferredLocations);
    if (parsedLocations) candidate.preferredLocations = parsedLocations;

    // Nested object
    const parsedSocial = parseField(socialLinks);
    if (parsedSocial) candidate.socialLinks = { ...candidate.socialLinks.toObject?.() || {}, ...parsedSocial };

    // LinkedIn-style sections
    const parsedEducation = parseField(education);
    if (parsedEducation) candidate.education = parsedEducation;

    const parsedExperience = parseField(experience);
    if (parsedExperience) candidate.experience = parsedExperience;

    const parsedCerts = parseField(certifications);
    if (parsedCerts) candidate.certifications = parsedCerts;

    const parsedProjects = parseField(projects);
    if (parsedProjects) candidate.projects = parsedProjects;

    const parsedAchievements = parseField(achievements);
    if (parsedAchievements) candidate.achievements = parsedAchievements;

    // Profile photo
    if (req.file?.path) candidate.profilePhoto = req.file.path;

    await candidate.save();

    res.status(200).json({
      message:   '✅ Profile updated successfully',
      candidate: { ...candidate.toObject(), password: undefined },
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── TOGGLE OPEN TO WORK ──────────────────────────────────────────────────────
const toggleOpenToWork = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    candidate.isOpen = !candidate.isOpen;
    await candidate.save();

    res.status(200).json({
      message: candidate.isOpen ? '✅ Open to work enabled' : '🔒 Open to work disabled',
      isOpen:  candidate.isOpen,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── BOOKMARK JOB ─────────────────────────────────────────────────────────────
const bookmarkJob = async (req, res) => {
  try {
    const { id, jobId } = req.params;

    const candidate = await Candidate.findById(id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const alreadySaved = candidate.savedJobs.includes(jobId);

    if (alreadySaved) {
      // Remove bookmark
      candidate.savedJobs = candidate.savedJobs.filter(
        (j) => j.toString() !== jobId
      );
      await candidate.save();
      return res.status(200).json({ message: '🔖 Job removed from bookmarks', bookmarked: false });
    } else {
      // Add bookmark
      candidate.savedJobs.push(jobId);
      await candidate.save();
      return res.status(200).json({ message: '🔖 Job bookmarked!', bookmarked: true });
    }

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET BOOKMARKS ────────────────────────────────────────────────────────────
const getBookmarks = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate({
        path:     'savedJobs',
        populate: { path: 'recruiter', select: 'companyName companyLogo' },
      });

    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    res.status(200).json({
      total:     candidate.savedJobs.length,
      bookmarks: candidate.savedJobs,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── SEARCH CANDIDATES (for recruiters) ──────────────────────────────────────
const searchCandidates = async (req, res) => {
  try {
    const { skills, location, jobType, experience, page = 1, limit = 10 } = req.query;

    const query = { isActive: true, isOpen: true };

    if (skills) {
      const skillArr = skills.split(',').map((s) => s.trim());
      query.skills = { $in: skillArr.map((s) => new RegExp(s, 'i')) };
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (jobType)  query.jobType  = jobType;
    if (experience) query.totalExperience = { $regex: experience, $options: 'i' };

    const skip  = (page - 1) * limit;
    const total = await Candidate.countDocuments(query);

    const candidates = await Candidate.find(query)
      .select('-password -savedJobs')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      total,
      page:       parseInt(page),
      totalPages: Math.ceil(total / limit),
      candidates,
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  registerCandidate,
  loginCandidate,
  getCandidateProfile,
  updateCandidateProfile,
  toggleOpenToWork,
  bookmarkJob,
  getBookmarks,
  searchCandidates,
};