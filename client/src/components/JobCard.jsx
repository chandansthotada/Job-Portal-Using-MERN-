import { Link }    from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API         from '../api/axios';
import toast       from 'react-hot-toast';
import {
  FaMapMarkerAlt, FaBriefcase, FaRupeeSign,
  FaClock, FaBookmark, FaRegBookmark, FaUsers
} from 'react-icons/fa';

const JobCard = ({ job, onBookmarkToggle }) => {
  const { candidate } = useAuth();

  const isBookmarked = candidate?.savedJobs?.includes(job._id);

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!candidate) return toast.error('Login to bookmark jobs');
    try {
      const { data } = await API.post(`/candidate/bookmark/${candidate._id}/${job._id}`);
      toast.success(data.message);
      if (onBookmarkToggle) onBookmarkToggle(job._id, data.bookmarked);
    } catch (err) {
      toast.error('Failed to bookmark');
    }
  };

  const formatSalary = (salary) => {
    if (!salary || salary.isHidden) return 'Not Disclosed';
    const inLPA = (val) => val >= 100000 ? `${(val / 100000).toFixed(1)} LPA` : `₹${val}`;
    if (salary.min && salary.max) return `${inLPA(salary.min)} - ${inLPA(salary.max)}`;
    if (salary.max) return `Up to ${inLPA(salary.max)}`;
    return 'Not Disclosed';
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7)   return `${days} days ago`;
    if (days < 30)  return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <Link to={`/jobs/${job._id}`} style={styles.card}>

      {/* ── Header ── */}
      <div style={styles.cardHeader}>
        <div style={styles.logoWrap}>
          {job.companyLogo
            ? <img src={`http://localhost:5000/${job.companyLogo}`}
                alt={job.companyName} style={styles.logo} />
            : <div style={styles.logoPlaceholder}>
                {job.companyName?.charAt(0)}
              </div>
          }
        </div>
        <div style={styles.companyInfo}>
          <h3 style={styles.jobTitle}>{job.title}</h3>
          <p style={styles.companyName}>{job.companyName}</p>
        </div>
        <button onClick={handleBookmark} style={styles.bookmarkBtn}>
          {isBookmarked
            ? <FaBookmark color="#6366f1" size={18} />
            : <FaRegBookmark color="#9ca3af" size={18} />
          }
        </button>
      </div>

      {/* ── Tags ── */}
      <div style={styles.tags}>
        <span style={styles.tag}>
          <FaBriefcase size={11} style={{ marginRight: 4 }} />
          {job.jobType}
        </span>
        <span style={styles.tag}>
          <FaMapMarkerAlt size={11} style={{ marginRight: 4 }} />
          {job.isRemote ? 'Remote' : job.location}
        </span>
        {job.experience && (
          <span style={styles.tag}>
            <FaClock size={11} style={{ marginRight: 4 }} />
            {job.experience}
          </span>
        )}
      </div>

      {/* ── Skills ── */}
      <div style={styles.skills}>
        {job.skills?.slice(0, 4).map((skill, i) => (
          <span key={i} style={styles.skill}>{skill}</span>
        ))}
        {job.skills?.length > 4 && (
          <span style={styles.skillMore}>+{job.skills.length - 4}</span>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={styles.cardFooter}>
        <div style={styles.salary}>
          <FaRupeeSign size={12} color="#6366f1" />
          <span>{formatSalary(job.salary)}</span>
        </div>
        <div style={styles.footerRight}>
          {job.vacancy && (
            <span style={styles.vacancy}>
              <FaUsers size={11} style={{ marginRight: 4 }} />
              {job.vacancy} openings
            </span>
          )}
          <span style={styles.timeAgo}>{timeAgo(job.createdAt)}</span>
        </div>
      </div>

    </Link>
  );
};

const styles = {
  card:             { display: 'block', background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #f3f4f6', transition: 'all 0.2s', textDecoration: 'none', color: 'inherit' },
  cardHeader:       { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  logoWrap:         { flexShrink: 0 },
  logo:             { width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '1px solid #f3f4f6' },
  logoPlaceholder:  { width: 52, height: 52, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  companyInfo:      { flex: 1 },
  jobTitle:         { fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 3, lineHeight: 1.3 },
  companyName:      { fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 },
  bookmarkBtn:      { background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 },
  tags:             { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  tag:              { display: 'flex', alignItems: 'center', background: '#f9fafb', color: '#374151', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 500, border: '1px solid #e5e7eb' },
  skills:           { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 },
  skill:            { background: '#ede9fe', color: '#6d28d9', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 },
  skillMore:        { background: '#f3f4f6', color: '#6b7280', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 },
  cardFooter:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f3f4f6' },
  salary:           { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', fontWeight: 600, color: '#374151' },
  footerRight:      { display: 'flex', alignItems: 'center', gap: 10 },
  vacancy:          { display: 'flex', alignItems: 'center', fontSize: '0.78rem', color: '#6b7280' },
  timeAgo:          { fontSize: '0.78rem', color: '#9ca3af' },
};

export default JobCard;