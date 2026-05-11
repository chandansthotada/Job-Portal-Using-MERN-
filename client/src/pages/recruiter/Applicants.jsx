import { useEffect, useState } from 'react';
import { useParams, Link }     from 'react-router-dom';
import API         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader      from '../../components/Loader';
import toast       from 'react-hot-toast';
import {
  FaDownload, FaCheck, FaTimes,
  FaStar, FaEye, FaArrowLeft,
  FaMapMarkerAlt, FaBriefcase
} from 'react-icons/fa';

const Applicants = () => {
  const { id }       = useParams();        // jobId
  const { recruiter } = useAuth();

  const [job,      setJob]      = useState(null);
  const [apps,     setApps]     = useState([]);
  const [stats,    setStats]    = useState({});
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('All');
  const [selected, setSelected] = useState(null);
  const [note,     setNote]     = useState('');
  const [updating, setUpdating] = useState(false);
  const [page,     setPage]     = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchApps = async (pg = 1) => {
    setLoading(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        API.get(`/jobs/${id}`),
        API.get(`/applications/job/${id}`, {
          params: { status: filter === 'All' ? '' : filter, page: pg, limit: 8 },
        }),
      ]);
      setJob(jobRes.data.job);
      setApps(appsRes.data.applications);
      setStats(appsRes.data.stats);
      setTotalPages(appsRes.data.totalPages);
      setPage(pg);
    } catch (err) {
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(1); }, [filter]);

  const handleStatusUpdate = async (appId, status) => {
    setUpdating(true);
    try {
      await API.patch(`/applications/${appId}/status`, {
        recruiterId:  recruiter._id,
        status,
        recruiterNote: note,
      });
      toast.success(`✅ Application ${status.toLowerCase()}`);
      setSelected(null);
      setNote('');
      fetchApps(page);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const statusFilters = ['All', 'Pending', 'Reviewed', 'Shortlisted', 'Approved', 'Rejected'];

  if (loading && !job) return <Loader />;

  return (
    <div className="page-wrap">

      {/* ── Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <Link to="/recruiter/jobs" style={styles.backLink}>
            <FaArrowLeft style={{ marginRight: 6 }} /> Back to Jobs
          </Link>
          <h2 style={styles.title}>{job?.title}</h2>
          <p style={styles.subtitle}>{job?.companyName} • {job?.location} • {job?.jobType}</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total',       value: Object.values(stats).reduce((a, b) => a + b, 0), color: '#6366f1' },
          { label: 'Pending',     value: stats.pending     || 0, color: '#f59e0b' },
          { label: 'Reviewed',    value: stats.reviewed    || 0, color: '#3b82f6' },
          { label: 'Shortlisted', value: stats.shortlisted || 0, color: '#8b5cf6' },
          { label: 'Approved',    value: stats.approved    || 0, color: '#22c55e' },
          { label: 'Rejected',    value: stats.rejected    || 0, color: '#ef4444' },
        ].map((s) => (
          <div key={s.label} style={styles.statPill}>
            <span style={{ ...styles.statValue, color: s.color }}>{s.value}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div style={styles.tabs}>
        {statusFilters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ ...styles.tab, ...(filter === f ? styles.tabActive : {}) }}>
            {f}
          </button>
        ))}
      </div>

      {/* ── Applicants List ── */}
      {loading ? <Loader /> : apps.length === 0 ? (
        <div style={styles.empty}>
          <p>No {filter === 'All' ? '' : filter.toLowerCase()} applicants found.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {apps.map((app) => (
            <div key={app._id} style={styles.appCard}>

              {/* Candidate Info */}
              <div style={styles.candidateRow}>
                <div style={styles.avatarWrap}>
                  {app.candidate?.profilePhoto
                    ? <img src={`http://localhost:5000/${app.candidate.profilePhoto}`}
                        alt="" style={styles.avatar} />
                    : <div style={styles.avatarPh}>{app.candidate?.name?.charAt(0)}</div>
                  }
                </div>

                <div style={styles.candidateInfo}>
                  <h3 style={styles.candidateName}>{app.candidate?.name}</h3>
                  <p style={styles.candidateHeadline}>{app.candidate?.headline}</p>
                  <div style={styles.metaRow}>
                    {app.candidate?.location && (
                      <span style={styles.meta}><FaMapMarkerAlt size={10} /> {app.candidate.location}</span>
                    )}
                    {app.candidate?.totalExperience && (
                      <span style={styles.meta}><FaBriefcase size={10} /> {app.candidate.totalExperience}</span>
                    )}
                    <span style={styles.meta}>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                  {/* Skills */}
                  {app.candidate?.skills?.length > 0 && (
                    <div className="tag-wrap" style={{ marginTop: 6 }}>
                      {app.candidate.skills.slice(0, 4).map((s) => (
                        <span key={s} className="tag-item">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.cardRight}>
                  <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                  {app.recruiterNote && (
                    <div style={styles.noteBox}>
                      <p style={styles.noteText}>{app.recruiterNote}</p>
                    </div>
                  )}
                  <div style={styles.actionBtns}>
                    {/* View Profile */}
                    <Link to={`/candidate/profile/${app.candidate?._id}`}
                      target="_blank" style={styles.btnViewProfile}>
                      <FaEye size={12} /> Profile
                    </Link>
                    {/* Download Resume */}
                    <a href={`http://localhost:5000/${app.resume}`}
                      target="_blank" rel="noreferrer" style={styles.btnDownload}>
                      <FaDownload size={12} /> Resume
                    </a>
                    {/* Manage */}
                    <button onClick={() => { setSelected(app); setNote(app.recruiterNote || ''); }}
                      style={styles.btnManage}>
                      Manage
                    </button>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {app.coverLetter && (
                <div style={styles.coverLetterBox}>
                  <p style={styles.coverLetterLabel}>Cover Letter:</p>
                  <p style={styles.coverLetterText}>{app.coverLetter}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button onClick={() => fetchApps(page - 1)} disabled={page === 1}
            style={styles.pageBtn}>← Prev</button>
          <span style={{ color: '#6b7280', fontSize: '0.88rem' }}>Page {page} of {totalPages}</span>
          <button onClick={() => fetchApps(page + 1)} disabled={page >= totalPages}
            style={styles.pageBtn}>Next →</button>
        </div>
      )}

      {/* ── Manage Modal ── */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} style={styles.closeBtn}>✕</button>

            <h3 style={styles.modalTitle}>Manage Application</h3>
            <div style={styles.modalCandidate}>
              {selected.candidate?.profilePhoto
                ? <img src={`http://localhost:5000/${selected.candidate.profilePhoto}`}
                    alt="" style={styles.modalAvatar} />
                : <div style={styles.modalAvatarPh}>{selected.candidate?.name?.charAt(0)}</div>
              }
              <div>
                <p style={{ fontWeight: 700, color: '#111827' }}>{selected.candidate?.name}</p>
                <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>{selected.candidate?.headline}</p>
              </div>
            </div>

            <p style={styles.currentStatus}>
              Current Status: <span className={`badge badge-${selected.status.toLowerCase()}`}>{selected.status}</span>
            </p>

            <div className="form-group">
              <label>Recruiter Note (Optional)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note visible to the candidate..." rows={3}
                style={{ resize: 'vertical' }} />
            </div>

            <p style={styles.updateLabel}>Update Status:</p>
            <div style={styles.statusBtns}>
              <button onClick={() => handleStatusUpdate(selected._id, 'Reviewed')}
                disabled={updating} style={styles.btnReviewed}>
                <FaEye size={13} /> Reviewed
              </button>
              <button onClick={() => handleStatusUpdate(selected._id, 'Shortlisted')}
                disabled={updating} style={styles.btnShortlisted}>
                <FaStar size={13} /> Shortlist
              </button>
              <button onClick={() => handleStatusUpdate(selected._id, 'Approved')}
                disabled={updating} style={styles.btnApproved}>
                <FaCheck size={13} /> Approve
              </button>
              <button onClick={() => handleStatusUpdate(selected._id, 'Rejected')}
                disabled={updating} style={styles.btnRejected}>
                <FaTimes size={13} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageHeader:        { marginBottom: 24 },
  backLink:          { display: 'flex', alignItems: 'center', color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 },
  title:             { fontSize: '1.6rem', fontWeight: 800, color: '#111827' },
  subtitle:          { color: '#6b7280', marginTop: 4, fontSize: '0.88rem' },
  statsRow:          { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 },
  statPill:          { background: '#fff', borderRadius: 10, padding: '12px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', textAlign: 'center', minWidth: 80 },
  statValue:         { display: 'block', fontSize: '1.5rem', fontWeight: 800 },
  statLabel:         { fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' },
  tabs:              { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  tab:               { padding: '7px 16px', borderRadius: 20, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#374151' },
  tabActive:         { background: '#6366f1', color: '#fff', border: '1px solid #6366f1' },
  list:              { display: 'flex', flexDirection: 'column', gap: 14 },
  appCard:           { background: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  candidateRow:      { display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' },
  avatarWrap:        { flexShrink: 0 },
  avatar:            { width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ede9fe' },
  avatarPh:          { width: 56, height: 56, borderRadius: '50%', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  candidateInfo:     { flex: 1 },
  candidateName:     { fontWeight: 700, color: '#111827', fontSize: '1rem', marginBottom: 2 },
  candidateHeadline: { color: '#6b7280', fontSize: '0.85rem', marginBottom: 6 },
  metaRow:           { display: 'flex', gap: 10, flexWrap: 'wrap' },
  meta:              { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#9ca3af' },
  cardRight:         { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 },
  noteBox:           { background: '#fef9c3', border: '1px solid #fde047', borderRadius: 6, padding: '6px 10px', maxWidth: 200 },
  noteText:          { fontSize: '0.75rem', color: '#713f12' },
  actionBtns:        { display: 'flex', gap: 6, flexWrap: 'wrap' },
  btnViewProfile:    { display: 'flex', alignItems: 'center', gap: 4, background: '#f3f4f6', color: '#374151', padding: '5px 10px', borderRadius: 6, fontWeight: 600, fontSize: '0.75rem' },
  btnDownload:       { display: 'flex', alignItems: 'center', gap: 4, background: '#dbeafe', color: '#1e40af', padding: '5px 10px', borderRadius: 6, fontWeight: 600, fontSize: '0.75rem' },
  btnManage:         { background: '#6366f1', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' },
  coverLetterBox:    { marginTop: 14, padding: '12px 16px', background: '#f9fafb', borderRadius: 8, borderLeft: '3px solid #6366f1' },
  coverLetterLabel:  { fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', marginBottom: 4, textTransform: 'uppercase' },
  coverLetterText:   { fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.6 },
  empty:             { textAlign: 'center', padding: '60px 20px', color: '#9ca3af' },
  pagination:        { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 },
  pageBtn:           { background: '#fff', border: '1px solid #e5e7eb', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  overlay:           { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: 20 },
  modal:             { background: '#fff', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 480, position: 'relative', maxHeight: '90vh', overflowY: 'auto' },
  closeBtn:          { position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#6b7280' },
  modalTitle:        { fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginBottom: 16 },
  modalCandidate:    { display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', borderRadius: 10, padding: '12px 14px', marginBottom: 16 },
  modalAvatar:       { width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' },
  modalAvatarPh:     { width: 44, height: 44, borderRadius: '50%', background: '#6366f1', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  currentStatus:     { marginBottom: 14, fontSize: '0.88rem', color: '#374151' },
  updateLabel:       { fontWeight: 700, color: '#374151', marginBottom: 10, fontSize: '0.88rem' },
  statusBtns:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  btnReviewed:       { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#dbeafe', color: '#1e40af', border: 'none', padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' },
  btnShortlisted:    { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#ede9fe', color: '#5b21b6', border: 'none', padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' },
  btnApproved:       { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#dcfce7', color: '#14532d', border: 'none', padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' },
  btnRejected:       { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fee2e2', color: '#7f1d1d', border: 'none', padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' },
};

export default Applicants;