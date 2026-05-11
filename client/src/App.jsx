import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster }       from 'react-hot-toast';
import { AuthProvider }  from './context/AuthContext';
import Navbar            from './components/Navbar';
import CandidateRoute    from './components/CandidateRoute';
import RecruiterRoute    from './components/RecruiterRoute';

// Public
import Home       from './pages/Home';
import JobSearch  from './pages/candidate/JobSearch';
import JobDetail  from './pages/candidate/JobDetail';

// Candidate
import CandidateRegister    from './pages/candidate/CandidateRegister';
import CandidateLogin       from './pages/candidate/CandidateLogin';
import CandidateDashboard   from './pages/candidate/CandidateDashboard';
import CandidateProfile     from './pages/candidate/CandidateProfile';
import EditCandidateProfile from './pages/candidate/EditCandidateProfile';
import ApplyJob             from './pages/candidate/ApplyJob';
import MyApplications       from './pages/candidate/MyApplications';
import Bookmarks            from './pages/candidate/Bookmarks';

// Recruiter
import RecruiterRegister    from './pages/recruiter/RecruiterRegister';
import RecruiterLogin       from './pages/recruiter/RecruiterLogin';
import RecruiterDashboard   from './pages/recruiter/RecruiterDashboard';
import RecruiterProfile     from './pages/recruiter/RecruiterProfile';
import EditRecruiterProfile from './pages/recruiter/EditRecruiterProfile';
import PostJob              from './pages/recruiter/PostJob';
import MyJobs               from './pages/recruiter/MyJobs';
import EditJob              from './pages/recruiter/EditJob';
import Applicants           from './pages/recruiter/Applicants';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Navbar />
        <Routes>

          {/* ── Public ── */}
          <Route path="/"         element={<Home />} />
          <Route path="/jobs"     element={<JobSearch />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* ── Candidate Auth ── */}
          <Route path="/candidate/register" element={<CandidateRegister />} />
          <Route path="/candidate/login"    element={<CandidateLogin />} />

          {/* ── Candidate Protected ── */}
          <Route path="/candidate/dashboard"      element={<CandidateRoute><CandidateDashboard /></CandidateRoute>} />
          <Route path="/candidate/profile/:id"    element={<CandidateRoute><CandidateProfile /></CandidateRoute>} />
          <Route path="/candidate/profile/:id/edit" element={<CandidateRoute><EditCandidateProfile /></CandidateRoute>} />
          <Route path="/candidate/apply/:jobId"   element={<CandidateRoute><ApplyJob /></CandidateRoute>} />
          <Route path="/candidate/applications"   element={<CandidateRoute><MyApplications /></CandidateRoute>} />
          <Route path="/candidate/bookmarks"      element={<CandidateRoute><Bookmarks /></CandidateRoute>} />

          {/* ── Recruiter Auth ── */}
          <Route path="/recruiter/register" element={<RecruiterRegister />} />
          <Route path="/recruiter/login"    element={<RecruiterLogin />} />

          {/* ── Recruiter Protected ── */}
          <Route path="/recruiter/dashboard"        element={<RecruiterRoute><RecruiterDashboard /></RecruiterRoute>} />
          <Route path="/recruiter/profile/:id"      element={<RecruiterRoute><RecruiterProfile /></RecruiterRoute>} />
          <Route path="/recruiter/profile/:id/edit" element={<RecruiterRoute><EditRecruiterProfile /></RecruiterRoute>} />
          <Route path="/recruiter/post-job"         element={<RecruiterRoute><PostJob /></RecruiterRoute>} />
          <Route path="/recruiter/jobs"             element={<RecruiterRoute><MyJobs /></RecruiterRoute>} />
          <Route path="/recruiter/jobs/:id/edit"    element={<RecruiterRoute><EditJob /></RecruiterRoute>} />
          <Route path="/recruiter/jobs/:id/applicants" element={<RecruiterRoute><Applicants /></RecruiterRoute>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;