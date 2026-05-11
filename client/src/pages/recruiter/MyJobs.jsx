import { useEffect, useState } from 'react';
import { Link }    from 'react-router-dom';
import API         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader      from '../../components/Loader';
import toast       from 'react-hot-toast';
import {
  FaPlus, FaEye, FaEdit, FaTrash,
  FaToggleOn, FaToggleOff, FaUsers
} from 'react-icons/fa';

const MyJobs = () => {
  const { recruiter } = useAuth();
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [page,    setPage]    = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,   setTotal]   = useState(0);

  const fetchJobs = async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 8 };
      if (filter !== 'all') params.status = filter;
      const { data } = await API.get(`/jobs/recruiter/${recruiter._id}`, { params });
      setJobs(data.jobs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setPage(pg);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(1); }, [filter]);

  const handleToggle = async (jobId, current) => {
    try {
      const { data } = await API.patch(`/jobs/${jobId}/toggle`, { recruiterId: recruiter._id });
      toast.success(data.message);
      fetchJobs(page);
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (jobId, title) => {
    if (!window.confirm(`Delete "${title}"? This will also delete all applications.`)) return;
    try {
      await API.delete(`/jobs/${jobId}`, { data: { recruiterId: recruiter._id } });
      toast.success('Job deleted');
      fetchJobs(page);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="page-wrap">
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>💼 My Jobs</h2>
          <p style={styles.subtitle}>{total} total jobs posted</p>
        </div>
        <Link to="/recruiter/post-job" style={styles.btnPost}>
          <FaPlus style={{ marginRight: 6 }} /> Post New Job
        </Link>
      </div>

      {/* Filters */}
      <div style={styles.tabs}>
        {['all', 'active', 'inactive'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ ...styles.tab, ...(filter === f ? styles.tabActive : {}) }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <>
          {jobs.length === 0 ? (
            <div style={styles.empty}>
              <p>No jobs found. Post your first job!</p>
              <Link to="/recruiter/post-job" style={styles.btnPost}>Post Job</Link>
            </div>
          ) : (
            <div style={styles.list}>
              {jobs.map((job) => (
                <div key={job._id} style={styles.jobCard}>
                  <div style={styles.jobLeft}>
                    <div>
                      <h3 style={styles.jobTitle}>{job.title}</h3>
                      <div style={styles.jobMeta}>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.jobType}</span>
                        <span>•</span>
                        <span>{job.vacancy} vacancies</span>
                        {job.deadline && (
                          <>
                            <span>•</span>
                            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      {/* Skills */}
                      <div className="tag-wrap" style={{ marginTop: 8 }}>
                        {job.skills?.slice(0, 4).map((s) => (
                          <span key={s} className="tag-item">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={styles.jobRight}>
                    <span className={`badge ${job.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div style={styles.appCount}>
                      <FaUsers size={13} color="#6366f1" />
                      <span>{job.applicationCount} applicants</span>
                    </div>
                    <p style={styles.postedDate}>
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    <div style={styles.actions}>
                      <Link to={`/recruiter/jobs/${job._id}/applicants`} style={styles.btnView}>
                        <FaEye size={12} /> Applicants
                      </Link>
                      <button onClick={() => handleToggle(job._id, job.isActive)}
                        style={styles.btnToggle} title={job.isActive ? 'Deactivate' : 'Activate'}>
                        {job.isActive
                          ? <FaToggleOn size={18} color="#22c55e" />
                          : <FaToggleOff size={18} color="#9ca3af" />
                        }
                      </button>
                      <button onClick={() => handleDelete(job._id, job.title)}
                        style={styles.btnDelete}>
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button onClick={() => fetchJobs(page - 1)} disabled={page === 1}
                style={styles.pageBtn}>← Prev</button>
              <span style={{ color: '#6b7280', fontSize: '0.88rem' }}>
                Page {page} of {totalPages}
              </span>
              <button onClick={() => fetchJobs(page + 1)} disabled={page >= totalPages}
                style={styles.pageBtn}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  pageHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title:       { fontSize: '1.8rem', fontWeight: 800, color: '#111827' },
  subtitle:    { color: '#6b7280', marginTop: 4 },
  btnPost:     { display: 'flex', alignItems: 'center', background: '#6366f1', color: '#fff', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: '0.88rem' },
  tabs:        { display: 'flex', gap: 8, marginBottom: 20 },
  tab:         { padding: '7px 20px', borderRadius: 20, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#374151' },
  tabActive:   { background: '#6366f1', color: '#fff', border: '1px solid #6366f1' },
  list:        { display: 'flex', flexDirection: 'column', gap: 14 },
  jobCard:     { background: '#fff', borderRadius: 14, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', gap: 16, flexWrap: 'wrap' },
  jobLeft:     { flex: 1 },
  jobTitle:    { fontWeight: 700, color: '#111827', fontSize: '1rem', marginBottom: 4 },
  jobMeta:     { display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: '0.78rem', color: '#6b7280' },
  jobRight:    { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 },
  appCount:    { display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, color: '#374151', fontSize: '0.85rem' },
  postedDate:  { fontSize: '0.75rem', color: '#9ca3af' },
  actions:     { display: 'flex', gap: 6, alignItems: 'center' },
  btnView:     { display: 'flex', alignItems: 'center', gap: 5, background: '#ede9fe', color: '#6366f1', padding: '6px 12px', borderRadius: 6, fontWeight: 600, fontSize: '0.78rem' },
  btnToggle:   { background: '#f9fafb', border: '1px solid #e5e7eb', width: 32, height: 32, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnDelete:   { background: '#fee2e2', color: '#dc2626', border: 'none', width: 32, height: 32, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  empty:       { textAlign: 'center', padding: '60px 20px', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  pagination:  { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 },
  pageBtn:     { background: '#fff', border: '1px solid #e5e7eb', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
};

export default MyJobs;