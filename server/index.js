const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const candidateRoutes    = require('./routes/candidateRoutes');
const recruiterRoutes    = require('./routes/recruiterRoutes');
const jobRoutes          = require('./routes/jobRoutes');
const applicationRoutes  = require('./routes/applicationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/candidate',   candidateRoutes);
app.use('/api/recruiter',   recruiterRoutes);
app.use('/api/jobs',        jobRoutes);
app.use('/api/applications',applicationRoutes);

// MongoDB + Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error('❌ DB Error:', err));