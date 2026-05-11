const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  degree:      { type: String },
  institution: { type: String },
  field:       { type: String },
  startYear:   { type: String },
  endYear:     { type: String },
  grade:       { type: String },
});

const experienceSchema = new mongoose.Schema({
  title:       { type: String },
  company:     { type: String },
  location:    { type: String },
  startDate:   { type: String },
  endDate:     { type: String },
  current:     { type: Boolean, default: false },
  description: { type: String },
});

const certificationSchema = new mongoose.Schema({
  name:         { type: String },
  issuer:       { type: String },
  issueDate:    { type: String },
  expiryDate:   { type: String },
  credentialId: { type: String },
});

const projectSchema = new mongoose.Schema({
  title:       { type: String },
  description: { type: String },
  techStack:   [{ type: String }],
  link:        { type: String },
  github:      { type: String },
});

const achievementSchema = new mongoose.Schema({
  title:       { type: String },
  description: { type: String },
  date:        { type: String },
});

const candidateSchema = new mongoose.Schema({
  // Auth
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone:    { type: String },
  dob:      { type: Date },
  gender:   { type: String, enum: ['Male', 'Female', 'Other'] },

  // Profile
  profilePhoto: { type: String },
  headline:     { type: String },   // e.g. "Full Stack Developer at XYZ"
  bio:          { type: String },   // About me
  location:     { type: String },
  portfolio:    { type: String },

  // Social Links
  socialLinks: {
    linkedin: { type: String },
    github:   { type: String },
    twitter:  { type: String },
    website:  { type: String },
  },

  // Skills
  skills:   [{ type: String }],

  // LinkedIn-style sections
  education:      [educationSchema],
  experience:     [experienceSchema],
  certifications: [certificationSchema],
  projects:       [projectSchema],
  achievements:   [achievementSchema],

  // Job preferences
  preferredRoles:     [{ type: String }],
  preferredLocations: [{ type: String }],
  expectedSalary:     { type: String },
  jobType:            { type: String, enum: ['Full-time', 'Part-time', 'Remote', 'Internship', 'Contract'] },
  noticePeriod:       { type: String },
  totalExperience:    { type: String },

  // Saved Jobs
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

  // Status
  isActive:  { type: Boolean, default: true },
  isOpen:    { type: Boolean, default: true },  // Open to work

}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);