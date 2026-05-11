import { useEffect, useState } from 'react';
import { Link }    from 'react-router-dom';
import API         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader      from '../../components/Loader';
import {
  FaBriefcase, FaUsers, FaClock,
  FaCheckCircle, FaTimes, FaPlus,
  FaEye, FaPlusCircle
} from 'react-icons/fa';

const RecruiterDashboard = () => {
  const { recruiter } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/recruiter/dashboard/${recruiter._id}`);
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;
  if (!data)   return null;

  const { stats, recentApplications, recentJobs } = data;

  return (
    <div className="page-wrap">

      {/* ── Welcome Banner ── */}
      <div style={styles.banner}>
        <div style={styles.bannerLeft}>
          <div style={styles.companyLogoWrap}>
            {recruiter.companyLogo
              ? <img src={`http://localhost:5000/${recruiter.companyLogo}`}
                  alt="" style={styles.companyLogo} />
              : <div style={styles.companyLogoPh}>{recruiter.companyName?.charAt(0)}</div>
            }
          </div>
          <div>
            <h2 style={styles.welcomeTitle}>Welcome back, {recruiter.name}! 👋</h2>
            <p style={styles.welcomeSub}>{recruiter.companyName} • {recruiter.designation}</p>
            <p style={styles.welcomeHq}>{recruiter.headquarters || 'Location not set'}</p>
          </div>
        </div>
        <div style={styles.bannerActions}>
          <Link to={`/recruiter/profile/${recruiter._id}`} style={styles.btnOutline}>
            View Profile
          </Link>
          <Link to="/recruiter/post-job" style={styles.btnPrimary}>
            <FaPlusCircle style={{ marginRight: 6 }} /> Post Job
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={styles.statsGrid}>
        <StatCard label="Total Jobs"       value={stats.totalJobs}             color="#6366f1" bg="#ede9fe" icon={<FaBriefcase />} />
        <StatCard label="Active Jobs"      value={stats.activeJobs}            color="#22c55e" bg="#dcfce7" icon={<FaCheckCircle />} />
        <StatCard label="Total Applicants" value={stats.totalApplications}     color="#3b82f6" bg="#dbeafe" icon={<FaUsers />} />
        <StatCard label="Pending Review"   value={stats.pendingApplications}   color="#f59e0b" bg="#fef9c3" icon={<FaClock />} />
        <StatCard label="Shortlisted"      value={stats.shortlistedApplications} color="#8b5cf6" bg="#ede9fe" icon={<FaUsers />} />
        <StatCard label="Approved"         value={stats.approvedApplications}  color="#22c55e" bg="#dcfce7" icon={<FaCheckCircle />} />
        <StatCard label="Rejected"         value={stats.rejectedApplications}  color="#ef4444" bg="#fee2e2" icon={<FaTimes />} />
      </div>

      {/* ── Recent Applications ── */}
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>🧑‍💼 Recent Applications</h3>
        <Link to="/recruiter/jobs" style={styles.viewAll}>View All Jobs →</Link>
      </div>

      {recentApplications.length === 0 ? (
        <div style={styles.emptyBox}>
          <FaUsers size={32} color="#d1d5db" />
          <p>No applications yet. Post a job to get started!</p>
          <Link to="/recruiter/post-job" style={styles.btnPrimary}>Post Job</Link>
        </div>
      ) : (
        <div style={styles.appList}>
          {recentApplications.map((app) => (
            <div key={app._id} style={styles.appCard}>
              <div style={styles.appLeft}>
                {app.candidate?.profilePhoto
                  ? <img src={`http://localhost:5000/${app.candidate.profilePhoto}`}
                      alt="" style={styles.candidateAvatar} />
                  : <div style={styles.candidateAvatarPh}>
                      {app.candidate?.name?.charAt(0)}
                    </div>
                }
                <div>
                  <p style={styles.candidateName}>{app.candidate?.name}</p>
                  <p style={styles.candidateHeadline}>{app.candidate?.headline}</p>
                  <p style={styles.appJob}>Applied for: <strong>{app.job?.title}</strong></p>
                </div>
              </div>
              <div style={styles.appRight}>
                <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                <p style={styles.appDate}>{new Date(app.appliedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Recent Jobs ── */}
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>💼 Recent Job Posts</h3>
        <Link to="/recruiter/jobs" style={styles.viewAll}>Manage All →</Link>
      </div>

      {recentJobs.length === 0 ? (
        <div style={styles.emptyBox}>
          <FaBriefcase size={32} color="#d1d5db" />
          <p>No jobs posted yet.</p>
          <Link to="/recruiter/post-job" style={styles.btnPrimary}>
            <FaPlus style={{ marginRight: 6 }} /> Post First Job
          </Link>
        </div>
      ) : (
        <div style={styles.jobsList}>
          {recentJobs.map((job) => (
            <div key={job._id} style={styles.jobCard}>
              <div style={styles.jobLeft}>
                <h4 style={styles.jobTitle}>{job.title}</h4>
                <div style={styles.jobMeta}>
                  <span style={styles.metaItem}>{job.location}</span>
                  <span style={styles.metaDot}>•</span>
                  <span style={styles.metaItem}>{job.jobType}</span>
                  <span style={styles.metaDot}>•</span>
                  <span style={styles.metaItem}>{job.vacancy} openings</span>
                </div>
              </div>
              <div style={styles.jobRight}>
                <span className={`badge ${job.isActive ? 'badge-active' : 'badge-inactive'}`}>
                  {job.isActive ? 'Active' : 'Inactive'}
                </span>
                <span style={styles.appCount}>
                  <FaUsers size={12} style={{ marginRight: 4 }} />
                  {job.applicationCount} applicants
                </span>
                <div style={styles.jobActions}>
                  <Link to={`/recruiter/jobs/${job._id}/applicants`} style={styles.btnView}>
                    <FaEye size={12} /> View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

const StatCard = ({ label, value, color, bg, icon }) => (
  <div style={{ ...styles.statCard, background: bg }}>
    <div style={{ ...styles.statIcon, color }}>{icon}</div>
    <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>{value}</h3>
    <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>{label}</p>
  </div>
);

const styles = {
  banner:           { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: 16, padding: '28px 32px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 },
  bannerLeft:       { display: 'flex', alignItems: 'center', gap: 18 },
  companyLogoWrap:  { flexShrink: 0 },
  companyLogo:      { width: 68, height: 68, borderRadius: 12, objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' },
  companyLogoPh:    { width: 68, height: 68, borderRadius: 12, background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  welcomeTitle:     { fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 4 },
  welcomeSub:       { color: '#c7d2fe', fontSize: '0.9rem', marginBottom: 2 },
  welcomeHq:        { color: '#a5b4fc', fontSize: '0.82rem' },
  bannerActions:    { display: 'flex', gap: 10, flexWrap: 'wrap' },
  btnPrimary:       { display: 'flex', alignItems: 'center', background: '#fff', color: '#6366f1', padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.88rem' },
  btnOutline:       { display: 'flex', alignItems: 'center', border: '1.5px solid rgba(255,255,255,0.5)', color: '#fff', padding: '9px 18px', borderRadius: 8, fontWeight: 600, fontSize: '0.88rem' },
  statsGrid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 14, marginBottom: 32 },
  statCard:         { borderRadius: 12, padding: '18px 16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statIcon:         { fontSize: '1.3rem', marginBottom: 8 },
  sectionHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:     { fontSize: '1.1rem', fontWeight: 700, color: '#111827' },
  viewAll:          { color: '#6366f1', fontWeight: 600, fontSize: '0.88rem' },
  emptyBox:         { background: '#fff', borderRadius: 14, padding: '36px 20px', textAlign: 'center', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  appList:          { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 },
  appCard:          { background: '#fff', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 10 },
  appLeft:          { display: 'flex', alignItems: 'center', gap: 12 },
  candidateAvatar:  { width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ede9fe' },
  candidateAvatarPh:{ width: 44, height: 44, borderRadius: '50%', background: '#6366f1', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  candidateName:    { fontWeight: 700, color: '#111827', fontSize: '0.92rem' },
  candidateHeadline:{ color: '#6b7280', fontSize: '0.8rem', marginTop: 1 },
  appJob:           { color: '#9ca3af', fontSize: '0.78rem', marginTop: 2 },
  appRight:         { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  appDate:          { fontSize: '0.78rem', color: '#9ca3af' },
  jobsList:         { display: 'flex', flexDirection: 'column', gap: 10 },
  jobCard:          { background: '#fff', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 10 },
  jobLeft:          { flex: 1 },
  jobTitle:         { fontWeight: 700, color: '#111827', fontSize: '0.95rem', marginBottom: 4 },
  jobMeta:          { display: 'flex', alignItems: 'center', gap: 6 },
  metaItem:         { fontSize: '0.78rem', color: '#6b7280' },
  metaDot:          { color: '#d1d5db', fontSize: '0.7rem' },
  jobRight:         { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  appCount:         { display: 'flex', alignItems: 'center', fontSize: '0.82rem', color: '#6b7280', fontWeight: 600 },
  jobActions:       { display: 'flex', gap: 6 },
  btnView:          { display: 'flex', alignItems: 'center', gap: 5, background: '#ede9fe', color: '#6366f1', padding: '5px 12px', borderRadius: 6, fontWeight: 600, fontSize: '0.78rem' },
};

export default RecruiterDashboard;