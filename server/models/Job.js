const mongoose = require('mongoose');

const hiringStepSchema = new mongoose.Schema({
  step:        { type: Number },
  title:       { type: String },   // e.g. "Resume Screening"
  description: { type: String },
});

const jobSchema = new mongoose.Schema({
  // Recruiter reference
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },

  // Job Info
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  responsibilities: [{ type: String }],
  requirements:     [{ type: String }],

  // Company Info (snapshot)
  companyName:  { type: String, required: true },
  companyLogo:  { type: String },
  companyBio:   { type: String },
  location:     { type: String, required: true },
  isRemote:     { type: Boolean, default: false },

  // Job Details
  jobType:      { type: String, enum: ['Full-time', 'Part-time', 'Remote', 'Internship', 'Contract'], required: true },
  experience:   { type: String },    // e.g. "2-4 years"
  salary: {
    min:      { type: Number },
    max:      { type: Number },
    currency: { type: String, default: 'INR' },
    period:   { type: String, default: 'yearly' },
    isHidden: { type: Boolean, default: false },
  },
  vacancy:      { type: Number, default: 1 },
  deadline:     { type: Date },

  // Skills
  skills:       [{ type: String }],

  // Hiring Process
  hiringProcess: [hiringStepSchema],

  // Perks & Benefits
  perks:        [{ type: String }],   // e.g. "Health insurance", "Remote work"

  // Status
  isActive:     { type: Boolean, default: true },
  views:        { type: Number, default: 0 },

}, { timestamps: true });

// Text search index
jobSchema.index({ title: 'text', description: 'text', skills: 'text', companyName: 'text' });

module.exports = mongoose.model('Job', jobSchema);