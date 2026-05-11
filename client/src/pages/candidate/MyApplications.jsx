import { useEffect, useState } from 'react';
import { Link }    from 'react-router-dom';
import API         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader      from '../../components/Loader';
import toast       from 'react-hot-toast';
import {
  FaFileAlt, FaDownload, FaTrash,
  FaBriefcase, FaMapMarkerAlt, FaClock
} from 'react-icons/fa';

const MyApplications = () => {
  const { candidate }  = useAuth();
  const [apps,    setApps]    = useState([]);
  const [stats,   setStats]   = useState({});
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('All');
  const [page,    setPage]    = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchApps = async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 8 };
      if (filter !== 'All') params.status = filter;
      const { data } = await API.get(`/applications/candidate/${candidate._id}`, { params });
      setApps(data.applications);
      setStats(data.stats);
      setTotalPages(data.totalPages);
      setPage(pg);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(1); }, [filter]);

  const handleWithdraw = async (appId, jobTitle) => {
    if (!window.confirm(`Withdraw application for "${jobTitle}"?`)) return;
    try {
      await API.delete(`/applications/${appId}/withdraw`, {
        data: { candidateId: candidate._id },
      });
      toast.success('Application withdrawn');
      fetchApps(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const statFilters = ['All', 'Pending', 'Reviewed', 'Shortlisted', 'Approved', 'Rejected'];

  return (
    <div className="page-wrap">

      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>📋 My Applications</h2>
          <p style={styles.subtitle}>Track all your job applications</p>
        </div>
        <Link to="/jobs" style={styles.btnBrowse}>Browse More Jobs →</Link>
      </div>

      {/* ── Stats Row ── */}
      <div style={styles.statsRow}>
        {['pending', 'reviewed', 'shortlisted', 'approved', 'rejected'].map((s) => (
          <div key={s} style={styles.statPill}>
            <span className={`badge badge-${s}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            <span style={styles.statNum}>{stats[s] || 0}</span>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div style={styles.tabs}>
        {statFilters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ ...styles.tab, ...(filter === f ? styles.tabActive : {}) }}>
            {f}
          </button>
        ))}
      </div>

      {/* ── Applications List ── */}
      {loading ? <Loader /> : (
        <>
          {apps.length === 0 ? (
            <div style={styles.empty}>
              <FaFileAlt size={40} color="#d1d5db" />
              <h3>No applications found</h3>
              <p>{filter === 'All' ? "You haven't applied to any jobs yet" : `No ${filter} applications`}</p>
              <Link to="/jobs" style={styles.btnApply}>Browse Jobs →</Link>
            </div>
          ) : (
            <div style={styles.list}>
              {apps.map((app) => (
                <div key={app._id} style={styles.appCard}>

                  {/* ── Left ── */}
                  <div style={styles.appLeft}>
                    <div style={styles.logoWrap}>
                      {app.job?.companyLogo
                        ? <img src={`http://localhost:5000/${app.job.companyLogo}`}
                            alt="" style={styles.logo} />
                        : <div style={styles.logoPh}>{app.job?.companyName?.charAt(0)}</div>
                      }
                    </div>
                    <div style={styles.appInfo}>
                      <Link to={`/jobs/${app.job?._id}`} style={styles.appTitle}>
                        {app.job?.title}
                      </Link>
                      <p style={styles.appCompany}>{app.job?.companyName}</p>
                      <div style={styles.appMeta}>
                        <span style={styles.metaItem}>
                          <FaMapMarkerAlt size={10} /> {app.job?.location}
                        </span>
                        <span style={styles.metaItem}>
                          <FaBriefcase size={10} /> {app.job?.jobType}
                        </span>
                        <span style={styles.metaItem}>
                          <FaClock size={10} /> Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {/* Skills match */}
                      {app.job?.skills?.length > 0 && (
                        <div className="tag-wrap" style={{ marginTop: 6 }}>
                          {app.job.skills.slice(0, 3).map((s) => (
                            <span key={s} className="tag-item">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Right ── */}
                  <div style={styles.appRight}>
                    <span className={`badge badge-${app.status.toLowerCase()}`} style={{ fontSize: '0.82rem', padding: '5px 12px' }}>
                      {app.status}
                    </span>

                    {/* Recruiter Note */}
                    {app.recruiterNote && (
                      <div style={styles.noteBox}>
                        <p style={styles.noteLabel}>Recruiter Note:</p>
                        <p style={styles.noteText}>{app.recruiterNote}</p>
                      </div>
                    )}

                    <div style={styles.appActions}>
                      {/* Download Resume */}
                      <a href={`http://localhost:5000/${app.resume}`}
                        target="_blank" rel="noreferrer"
                        style={styles.btnDownload}>
                        <FaDownload size={12} /> Resume
                      </a>

                      {/* Withdraw (only if not approved) */}
                      {app.status !== 'Approved' && (
                        <button
                          onClick={() => handleWithdraw(app._id, app.job?.title)}
                          style={styles.btnWithdraw}>
                          <FaTrash size={12} /> Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button onClick={() => fetchApps(page - 1)} disabled={page === 1}
                style={styles.pageBtn}>← Prev</button>
              <span style={{ color: '#6b7280', fontSize: '0.88rem' }}>
                Page {page} of {totalPages}
              </span>
              <button onClick={() => fetchApps(page + 1)} disabled={page >= totalPages}
                style={styles.pageBtn}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  pageHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title:        { fontSize: '1.8rem', fontWeight: 800, color: '#111827' },
  subtitle:     { color: '#6b7280', marginTop: 4 },
  btnBrowse:    { background: '#6366f1', color: '#fff', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: '0.88rem' },
  statsRow:     { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 },
  statPill:     { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 10, padding: '10px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  statNum:      { fontWeight: 800, color: '#111827', fontSize: '1.1rem' },
  tabs:         { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  tab:          { padding: '7px 16px', borderRadius: 20, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#374151' },
  tabActive:    { background: '#6366f1', color: '#fff', border: '1px solid #6366f1' },
  list:         { display: 'flex', flexDirection: 'column', gap: 14 },
  appCard:      { background: '#fff', borderRadius: 14, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', gap: 16, flexWrap: 'wrap' },
  appLeft:      { display: 'flex', gap: 14, flex: 1 },
  logoWrap:     { flexShrink: 0 },
  logo:         { width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '1px solid #f3f4f6' },
  logoPh:       { width: 52, height: 52, borderRadius: 10, background: '#ede9fe', color: '#6366f1', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  appInfo:      { flex: 1 },
  appTitle:     { fontWeight: 700, color: '#111827', fontSize: '1rem', display: 'block', marginBottom: 2 },
  appCompany:   { color: '#6366f1', fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 },
  appMeta:      { display: 'flex', gap: 12, flexWrap: 'wrap' },
  metaItem:     { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#9ca3af' },
  appRight:     { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 },
  noteBox:      { background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, padding: '8px 12px', maxWidth: 220 },
  noteLabel:    { fontSize: '0.72rem', fontWeight: 700, color: '#854d0e', marginBottom: 2 },
  noteText:     { fontSize: '0.78rem', color: '#713f12', lineHeight: 1.4 },
  appActions:   { display: 'flex', gap: 8 },
  btnDownload:  { display: 'flex', alignItems: 'center', gap: 5, background: '#dbeafe', color: '#1e40af', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' },
  btnWithdraw:  { display: 'flex', alignItems: 'center', gap: 5, background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' },
  empty:        { textAlign: 'center', padding: '60px 20px', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  btnApply:     { background: '#6366f1', color: '#fff', padding: '10px 24px', borderRadius: 8, fontWeight: 700 },
  pagination:   { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 },
  pageBtn:      { background: '#fff', border: '1px solid #e5e7eb', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
};

export default MyApplications;