const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  candidate:   { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  job:         { type: mongoose.Schema.Types.ObjectId, ref: 'Job',       required: true },
  recruiter:   { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },

  // Application Data
  resume:       { type: String, required: true },  // file path
  coverLetter:  { type: String },

  // Status
  status: {
    type:    String,
    enum:    ['Pending', 'Reviewed', 'Shortlisted', 'Approved', 'Rejected'],
    default: 'Pending',
  },

  // Recruiter notes
  recruiterNote: { type: String },

  // Timestamps
  appliedAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});

// One candidate can apply once per job
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);