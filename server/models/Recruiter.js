const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
  // Auth
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone:    { type: String },

  // Personal Profile
  recruiterPhoto: { type: String },
  designation:    { type: String },   // e.g. "HR Manager"
  bio:            { type: String },

  // Company Info
  companyName:     { type: String, required: true },
  companyLogo:     { type: String },
  companyImages:   [{ type: String }],  // Office photos etc.
  companyBio:      { type: String },
  industry:        { type: String },
  companySize:     { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] },
  founded:         { type: String },
  headquarters:    { type: String },
  website:         { type: String },

  // Social
  socialLinks: {
    linkedin: { type: String },
    twitter:  { type: String },
    facebook: { type: String },
  },

  // Status
  isActive:  { type: Boolean, default: true },
  isVerified:{ type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('Recruiter', recruiterSchema);