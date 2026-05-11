import { useEffect, useState } from 'react';
import { Link }    from 'react-router-dom';
import API         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader      from '../../components/Loader';
import JobCard     from '../../components/JobCard';
import {
  FaBriefcase, FaFileAlt, FaBookmark,
  FaCheckCircle, FaClock, FaTimes,
  FaUserEdit, FaSearch
} from 'react-icons/fa';

const CandidateDashboard = () => {
  const { candidate } = useAuth();
  const [appStats,  setAppStats]  = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          API.get(`/applications/candidate/${candidate._id}?limit=3`),
          API.get('/jobs?limit=6&sortBy=createdAt'),
        ]);
        setAppStats(appsRes.data.stats);
        setRecentApps(appsRes.data.applications);
        setRecentJobs(jobsRes.data.jobs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-wrap">

      {/* ── Welcome ── */}
      <div style={styles.welcomeCard}>
        <div style={styles.welcomeLeft}>
          <div style={styles.avatarWrap}>
            {candidate.profilePhoto
              ? <img src={`http://localhost:5000/${candidate.profilePhoto}`}
                  alt="" style={styles.avatar} />
              : <div style={styles.avatarPh}>{candidate.name?.charAt(0)}</div>
            }
            {candidate.isOpen && <span style={styles.openBadge}>Open to Work</span>}
          </div>
          <div>
            <h2 style={styles.welcomeName}>Welcome back, {candidate.name}! 👋</h2>
            <p style={styles.headline}>{candidate.headline || 'Complete your profile to attract recruiters'}</p>
            <p style={styles.location}>{candidate.location || 'Location not set'}</p>
          </div>
        </div>
        <div style={styles.welcomeActions}>
          <Link to={`/candidate/profile/${candidate._id}`} style={styles.btnOutline}>
            <FaUserEdit style={{ marginRight: 6 }} /> View Profile
          </Link>
          <Link to="/jobs" style={styles.btnPrimary}>
            <FaSearch style={{ marginRight: 6 }} /> Find Jobs
          </Link>
        </div>
      </div>

      {/* ── Application Stats ── */}
      <h3 style={styles.sectionTitle}>📊 My Applications</h3>
      <div style={styles.statsGrid}>
        <StatCard label="Total Applied"  value={Object.values(appStats || {}).reduce((a, b) => a + b, 0)} color="#6366f1" icon={<FaFileAlt />} />
        <StatCard label="Pending"        value={appStats?.pending     || 0} color="#f59e0b" icon={<FaClock />} />
        <StatCard label="Shortlisted"    value={appStats?.shortlisted || 0} color="#8b5cf6" icon={<FaBriefcase />} />
        <StatCard label="Approved"       value={appStats?.approved    || 0} color="#22c55e" icon={<FaCheckCircle />} />
        <StatCard label="Rejected"       value={appStats?.rejected    || 0} color="#ef4444" icon={<FaTimes />} />
        <StatCard label="Saved Jobs"     value={candidate.savedJobs?.length || 0} color="#06b6d4" icon={<FaBookmark />} />
      </div>

      {/* ── Recent Applications ── */}
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>📋 Recent Applications</h3>
        <Link to="/candidate/applications" style={styles.viewAll}>View All →</Link>
      </div>

      {recentApps.length === 0 ? (
        <div style={styles.emptyBox}>
          <FaFileAlt size={32} color="#d1d5db" />
          <p>No applications yet. Start applying!</p>
          <Link to="/jobs" style={styles.btnPrimary}>Browse Jobs</Link>
        </div>
      ) : (
        <div style={styles.appList}>
          {recentApps.map((app) => (
            <div key={app._id} style={styles.appCard}>
              <div style={styles.appLeft}>
                {app.job?.companyLogo
                  ? <img src={`http://localhost:5000/${app.job.companyLogo}`}
                      alt="" style={styles.appLogo} />
                  : <div style={styles.appLogoPh}>{app.job?.companyName?.charAt(0)}</div>
                }
                <div>
                  <h4 style={styles.appTitle}>{app.job?.title}</h4>
                  <p style={styles.appCompany}>{app.job?.companyName} • {app.job?.location}</p>
                  <p style={styles.appDate}>Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Recommended Jobs ── */}
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>💼 Latest Jobs</h3>
        <Link to="/jobs" style={styles.viewAll}>View All →</Link>
      </div>
      <div style={styles.jobsGrid}>
        {recentJobs.map((job) => <JobCard key={job._id} job={job} />)}
      </div>

    </div>
  );
};

const StatCard = ({ label, value, color, icon }) => (
  <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
    <div style={{ ...styles.statIcon, color }}>{icon}</div>
    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827' }}>{value}</h3>
    <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 2 }}>{label}</p>
  </div>
);

const styles = {
  welcomeCard:    { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: 16, padding: '28px 32px', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 },
  welcomeLeft:    { display: 'flex', alignItems: 'center', gap: 18 },
  avatarWrap:     { position: 'relative', flexShrink: 0 },
  avatar:         { width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)' },
  avatarPh:       { width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  openBadge:      { position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 10, whiteSpace: 'nowrap' },
  welcomeName:    { fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 4 },
  headline:       { color: '#c7d2fe', fontSize: '0.9rem', marginBottom: 2 },
  location:       { color: '#a5b4fc', fontSize: '0.82rem' },
  welcomeActions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  btnPrimary:     { display: 'flex', alignItems: 'center', background: '#fff', color: '#6366f1', padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.88rem' },
  btnOutline:     { display: 'flex', alignItems: 'center', border: '1.5px solid rgba(255,255,255,0.5)', color: '#fff', padding: '9px 18px', borderRadius: 8, fontWeight: 600, fontSize: '0.88rem' },
  statsGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 16, marginBottom: 32 },
  statCard:       { background: '#fff', borderRadius: 12, padding: '20px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' },
  statIcon:       { fontSize: '1.3rem', marginBottom: 8 },
  sectionHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle:   { fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: '0 0 16px' },
  viewAll:        { color: '#6366f1', fontWeight: 600, fontSize: '0.88rem' },
  emptyBox:       { background: '#fff', borderRadius: 14, padding: '40px 20px', textAlign: 'center', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 },
  appList:        { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 },
  appCard:        { background: '#fff', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 10 },
  appLeft:        { display: 'flex', alignItems: 'center', gap: 12 },
  appLogo:        { width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #f3f4f6' },
  appLogoPh:      { width: 44, height: 44, borderRadius: 8, background: '#ede9fe', color: '#6366f1', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  appTitle:       { fontWeight: 700, color: '#111827', fontSize: '0.95rem', marginBottom: 2 },
  appCompany:     { fontSize: '0.82rem', color: '#6b7280', marginBottom: 2 },
  appDate:        { fontSize: '0.78rem', color: '#9ca3af' },
  jobsGrid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 },
};

export default CandidateDashboard;