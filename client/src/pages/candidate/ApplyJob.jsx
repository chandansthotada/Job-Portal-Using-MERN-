import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader      from '../../components/Loader';
import toast       from 'react-hot-toast';
import { FaUpload, FaFilePdf, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const ApplyJob = () => {
  const { jobId }    = useParams();
  const { candidate } = useAuth();
  const navigate      = useNavigate();

  const [job,         setJob]         = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [resume,      setResume]      = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await API.get(`/jobs/${jobId}`);
        setJob(data.job);

        // Check already applied
        const check = await API.get(`/applications/check/${candidate._id}/${jobId}`);
        if (check.data.hasApplied) {
          toast.error('You have already applied for this job');
          navigate(`/jobs/${jobId}`);
        }
      } catch (err) {
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume) return toast.error('Please upload your resume (PDF)');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('candidateId',  candidate._id);
      formData.append('jobId',        jobId);
      formData.append('coverLetter',  coverLetter);
      formData.append('resume',       resume);

      await API.post('/applications/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
      toast.success('✅ Application submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  // ── Success Screen ──
  if (success) {
    return (
      <div style={styles.centerWrap}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <FaCheckCircle size={52} color="#22c55e" />
          </div>
          <h2 style={styles.successTitle}>Application Submitted!</h2>
          <p style={styles.successDesc}>
            Your application for <strong>{job?.title}</strong> at{' '}
            <strong>{job?.companyName}</strong> has been submitted successfully.
          </p>
          <div style={styles.successInfo}>
            <p style={styles.successHint}>
              📬 The recruiter will review your application and update the status.
              You can track your application status in My Applications.
            </p>
          </div>
          <div style={styles.successActions}>
            <Link to="/candidate/applications" style={styles.btnPrimary}>
              Track Applications →
            </Link>
            <Link to="/jobs" style={styles.btnOutline}>
              Browse More Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        <FaArrowLeft style={{ marginRight: 6 }} /> Back
      </button>

      <div style={styles.layout}>

        {/* ── Form ── */}
        <div style={styles.formCard}>
          <h2 style={styles.title}>📄 Apply for Job</h2>
          <p style={styles.subtitle}>Complete your application below</p>

          {/* Candidate Preview */}
          <div style={styles.candidatePreview}>
            {candidate.profilePhoto
              ? <img src={`http://localhost:5000/${candidate.profilePhoto}`}
                  alt="" style={styles.candidateAvatar} />
              : <div style={styles.candidateAvatarPh}>{candidate.name?.charAt(0)}</div>
            }
            <div>
              <p style={styles.candidateName}>{candidate.name}</p>
              <p style={styles.candidateHeadline}>{candidate.headline || candidate.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* ── Resume Upload ── */}
            <p className="section-head">Resume *</p>
            <div style={styles.resumeUpload}>
              <label style={styles.resumeLabel}>
                <div style={styles.resumeInner}>
                  {resume ? (
                    <>
                      <FaFilePdf size={32} color="#ef4444" />
                      <p style={styles.resumeFileName}>{resume.name}</p>
                      <p style={styles.resumeSize}>
                        {(resume.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p style={styles.changeFile}>Click to change</p>
                    </>
                  ) : (
                    <>
                      <FaUpload size={28} color="#9ca3af" />
                      <p style={styles.resumeUploadTitle}>Upload your Resume</p>
                      <p style={styles.resumeUploadHint}>PDF only — Max 10MB</p>
                    </>
                  )}
                </div>
                <input type="file" accept=".pdf" style={{ display: 'none' }}
                  onChange={(e) => setResume(e.target.files[0])} />
              </label>
            </div>

            {/* ── Cover Letter ── */}
            <p className="section-head">Cover Letter (Optional)</p>
            <div className="form-group">
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder={`Dear Hiring Manager,\n\nI am excited to apply for the ${job?.title} position at ${job?.companyName}...\n\nThank you for your consideration.`}
                rows={8}
                style={{ resize: 'vertical' }}
              />
              <p style={styles.charCount}>{coverLetter.length} / 2000 characters</p>
            </div>

            <button type="submit" className="btn-primary"
              disabled={submitting || !resume} style={{ marginTop: 8 }}>
              {submitting ? 'Submitting...' : '🚀 Submit Application'}
            </button>
          </form>
        </div>

        {/* ── Job Summary Sidebar ── */}
        <div style={styles.sidebar}>
          <div style={styles.jobSummary}>
            <h3 style={styles.sideTitle}>Job Summary</h3>

            <div style={styles.jobHeader}>
              {job?.companyLogo
                ? <img src={`http://localhost:5000/${job.companyLogo}`}
                    alt="" style={styles.jobLogo} />
                : <div style={styles.jobLogoPh}>{job?.companyName?.charAt(0)}</div>
              }
              <div>
                <h4 style={styles.jobTitle}>{job?.title}</h4>
                <p style={styles.jobCompany}>{job?.companyName}</p>
              </div>
            </div>

            <div style={styles.jobMetas}>
              <JobMeta label="Location"   value={job?.isRemote ? 'Remote' : job?.location} />
              <JobMeta label="Type"       value={job?.jobType} />
              <JobMeta label="Experience" value={job?.experience || 'Not specified'} />
              <JobMeta label="Vacancy"    value={`${job?.vacancy} openings`} />
              {job?.deadline && (
                <JobMeta label="Deadline"
                  value={new Date(job.deadline).toLocaleDateString()} />
              )}
            </div>

            {job?.skills?.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p style={styles.metaLabel}>Required Skills</p>
                <div className="tag-wrap" style={{ marginTop: 6 }}>
                  {job.skills.map((s) => (
                    <span key={s} className="tag-item">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {job?.perks?.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p style={styles.metaLabel}>Perks</p>
                {job.perks.map((p, i) => (
                  <p key={i} style={styles.perkItem}>✅ {p}</p>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div style={styles.tipsCard}>
            <h3 style={styles.sideTitle}>💡 Application Tips</h3>
            {[
              'Tailor your resume to match the job requirements',
              'Write a personalized cover letter for better chances',
              'Highlight relevant skills and achievements',
              'Keep your profile updated with latest experience',
            ].map((tip, i) => (
              <p key={i} style={styles.tip}>
                <span style={styles.tipNum}>{i + 1}</span> {tip}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const JobMeta = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem' }}>
    <span style={{ color: '#9ca3af', fontWeight: 500 }}>{label}</span>
    <span style={{ color: '#111827', fontWeight: 600 }}>{value}</span>
  </div>
);

const styles = {
  wrap:               { maxWidth: 1000, margin: '0 auto', padding: '32px 20px' },
  backBtn:            { display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontWeight: 600, marginBottom: 20, fontSize: '0.9rem' },
  layout:             { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 },
  formCard:           { background: '#fff', borderRadius: 16, padding: '32px', boxShadow: '0 2px 14px rgba(0,0,0,0.08)' },
  title:              { fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: 4 },
  subtitle:           { color: '#6b7280', marginBottom: 24, fontSize: '0.92rem' },
  candidatePreview:   { display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', borderRadius: 10, padding: '14px 16px', marginBottom: 24, border: '1px solid #e5e7eb' },
  candidateAvatar:    { width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ede9fe' },
  candidateAvatarPh:  { width: 48, height: 48, borderRadius: '50%', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  candidateName:      { fontWeight: 700, color: '#111827', fontSize: '0.95rem' },
  candidateHeadline:  { color: '#6b7280', fontSize: '0.82rem', marginTop: 2 },
  resumeUpload:       { marginBottom: 20 },
  resumeLabel:        { cursor: 'pointer', display: 'block' },
  resumeInner:        { border: '2px dashed #c4b5fd', borderRadius: 12, padding: '32px 20px', textAlign: 'center', background: '#faf5ff', transition: 'border 0.2s' },
  resumeFileName:     { fontWeight: 700, color: '#111827', marginTop: 10, fontSize: '0.95rem' },
  resumeSize:         { color: '#6b7280', fontSize: '0.8rem', marginTop: 2 },
  changeFile:         { color: '#6366f1', fontSize: '0.8rem', marginTop: 4, fontWeight: 600 },
  resumeUploadTitle:  { fontWeight: 700, color: '#374151', marginTop: 10 },
  resumeUploadHint:   { color: '#9ca3af', fontSize: '0.82rem', marginTop: 4 },
  charCount:          { textAlign: 'right', fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 },
  sidebar:            { display: 'flex', flexDirection: 'column', gap: 16 },
  jobSummary:         { background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  sideTitle:          { fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: 16 },
  jobHeader:          { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' },
  jobLogo:            { width: 48, height: 48, borderRadius: 8, objectFit: 'cover' },
  jobLogoPh:          { width: 48, height: 48, borderRadius: 8, background: '#6366f1', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  jobTitle:           { fontWeight: 700, color: '#111827', fontSize: '0.95rem' },
  jobCompany:         { color: '#6366f1', fontSize: '0.82rem', fontWeight: 600 },
  jobMetas:           { display: 'flex', flexDirection: 'column' },
  metaLabel:          { fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' },
  perkItem:           { fontSize: '0.82rem', color: '#374151', marginTop: 4 },
  tipsCard:           { background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  tip:                { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.5, marginBottom: 8 },
  tipNum:             { background: '#ede9fe', color: '#6366f1', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 },
  centerWrap:         { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: 20 },
  successCard:        { background: '#fff', borderRadius: 20, padding: '48px 40px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', maxWidth: 480, width: '100%' },
  successIcon:        { marginBottom: 20 },
  successTitle:       { fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: 12 },
  successDesc:        { color: '#6b7280', lineHeight: 1.7, marginBottom: 20 },
  successInfo:        { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '14px 16px', marginBottom: 24 },
  successHint:        { color: '#166534', fontSize: '0.85rem', lineHeight: 1.6 },
  successActions:     { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary:         { background: '#6366f1', color: '#fff', padding: '11px 24px', borderRadius: 8, fontWeight: 700, fontSize: '0.92rem' },
  btnOutline:         { border: '1.5px solid #6366f1', color: '#6366f1', padding: '11px 24px', borderRadius: 8, fontWeight: 700, fontSize: '0.92rem' },
};

export default ApplyJob;