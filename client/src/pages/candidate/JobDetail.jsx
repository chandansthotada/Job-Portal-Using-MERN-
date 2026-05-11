import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader      from '../../components/Loader';
import JobCard     from '../../components/JobCard';
import toast       from 'react-hot-toast';
import {
  FaMapMarkerAlt, FaBriefcase, FaRupeeSign,
  FaUsers, FaCalendarAlt, FaBuilding,
  FaGlobe, FaBookmark, FaRegBookmark,
  FaCheckCircle, FaArrowLeft
} from 'react-icons/fa';

const JobDetail = () => {
  const { id }       = useParams();
  const { candidate } = useAuth();
  const navigate      = useNavigate();

  const [job,          setJob]          = useState(null);
  const [similar,      setSimilar]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [appStatus,    setAppStatus]    = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [appCount,     setAppCount]     = useState(0);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const [jobRes, simRes] = await Promise.all([
          API.get(`/jobs/${id}`),
          API.get(`/jobs/${id}/similar`),
        ]);
        setJob(jobRes.data.job);
        setAppCount(jobRes.data.applicationCount);
        setSimilar(simRes.data.similar);

        if (candidate) {
          const check = await API.get(`/applications/check/${candidate._id}/${id}`);
          setAppStatus(check.data);
          setIsBookmarked(candidate.savedJobs?.includes(id));
        }
      } catch (err) {
        toast.error('Job not found');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleBookmark = async () => {
    if (!candidate) return toast.error('Login to bookmark');
    try {
      const { data } = await API.post(`/candidate/bookmark/${candidate._id}/${id}`);
      setIsBookmarked(data.bookmarked);
      toast.success(data.message);
    } catch (err) {
      toast.error('Failed');
    }
  };

  const formatSalary = (salary) => {
    if (!salary || salary.isHidden) return 'Not Disclosed';
    const inLPA = (v) => v >= 100000 ? `${(v / 100000).toFixed(1)} LPA` : `₹${v}`;
    return `${inLPA(salary.min)} - ${inLPA(salary.max)}`;
  };

  if (loading) return <Loader />;
  if (!job)    return null;

  const recruiter = job.recruiter;

  return (
    <div style={styles.wrap}>

      {/* ── Back ── */}
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        <FaArrowLeft style={{ marginRight: 6 }} /> Back to Jobs
      </button>

      <div style={styles.layout}>
        {/* ── Main ── */}
        <div style={styles.main}>

          {/* ── Job Header ── */}
          <div style={styles.headerCard}>
            <div style={styles.headerTop}>
              <div style={styles.logoWrap}>
                {job.companyLogo
                  ? <img src={`http://localhost:5000/${job.companyLogo}`} alt="" style={styles.logo} />
                  : <div style={styles.logoPh}>{job.companyName?.charAt(0)}</div>
                }
              </div>
              <div style={styles.headerInfo}>
                <h1 style={styles.jobTitle}>{job.title}</h1>
                <p style={styles.companyName}>{job.companyName}</p>
                <div style={styles.metaRow}>
                  <span style={styles.meta}><FaMapMarkerAlt size={12} />{job.isRemote ? 'Remote' : job.location}</span>
                  <span style={styles.meta}><FaBriefcase size={12} />{job.jobType}</span>
                  <span style={styles.meta}><FaUsers size={12} />{job.vacancy} openings</span>
                  <span style={styles.meta}><FaUsers size={12} />{appCount} applicants</span>
                  {job.deadline && (
                    <span style={styles.meta}><FaCalendarAlt size={12} />Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <button onClick={handleBookmark} style={styles.bookmarkBtn}>
                {isBookmarked
                  ? <FaBookmark color="#6366f1" size={20} />
                  : <FaRegBookmark color="#9ca3af" size={20} />
                }
              </button>
            </div>

            {/* Salary + Skills */}
            <div style={styles.salaryRow}>
              <span style={styles.salary}>
                <FaRupeeSign size={14} color="#6366f1" />
                {formatSalary(job.salary)}
              </span>
              {job.experience && (
                <span style={styles.expBadge}>⏱ {job.experience}</span>
              )}
            </div>

            <div style={styles.skillsRow}>
              {job.skills?.map((s) => (
                <span key={s} style={styles.skill}>{s}</span>
              ))}
            </div>

            {/* Apply Button */}
            <div style={styles.applyRow}>
              {appStatus?.hasApplied ? (
                <div style={styles.appliedBox}>
                  <FaCheckCircle color="#22c55e" size={18} />
                  <div>
                    <p style={{ fontWeight: 600, color: '#111827' }}>Application Submitted</p>
                    <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                      Status: <span className={`badge badge-${appStatus.status?.toLowerCase()}`}>{appStatus.status}</span>
                    </p>
                  </div>
                </div>
              ) : candidate ? (
                <Link to={`/candidate/apply/${id}`} style={styles.applyBtn}>
                  Apply Now →
                </Link>
              ) : (
                <Link to="/candidate/login" style={styles.applyBtn}>
                  Login to Apply →
                </Link>
              )}
              <span style={styles.postedOn}>
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* ── Description ── */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>About the Role</h2>
            <p style={styles.desc}>{job.description}</p>
          </div>

          {/* ── Responsibilities ── */}
          {job.responsibilities?.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Responsibilities</h2>
              <ul style={styles.list}>
                {job.responsibilities.map((r, i) => (
                  <li key={i} style={styles.listItem}>
                    <FaCheckCircle size={12} color="#6366f1" style={{ flexShrink: 0, marginTop: 3 }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Requirements ── */}
          {job.requirements?.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Requirements</h2>
              <ul style={styles.list}>
                {job.requirements.map((r, i) => (
                  <li key={i} style={styles.listItem}>
                    <FaCheckCircle size={12} color="#6366f1" style={{ flexShrink: 0, marginTop: 3 }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Hiring Process ── */}
          {job.hiringProcess?.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Hiring Process</h2>
              <div style={styles.hiringSteps}>
                {job.hiringProcess.map((step, i) => (
                  <div key={i} style={styles.hiringStep}>
                    <div style={styles.stepNum}>{step.step || i + 1}</div>
                    <div style={styles.stepContent}>
                      <h4 style={styles.stepTitle}>{step.title}</h4>
                      {step.description && <p style={styles.stepDesc}>{step.description}</p>}
                    </div>
                    {i < job.hiringProcess.length - 1 && (
                      <div style={styles.stepArrow}>→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Perks ── */}
          {job.perks?.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Perks & Benefits</h2>
              <div style={styles.perksGrid}>
                {job.perks.map((perk, i) => (
                  <div key={i} style={styles.perkItem}>
                    <FaCheckCircle color="#22c55e" size={14} />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Similar Jobs ── */}
          {similar.length > 0 && (
            <div>
              <h2 style={{ ...styles.sectionTitle, padding: 0, background: 'none', boxShadow: 'none', marginBottom: 16 }}>
                Similar Jobs
              </h2>
              <div style={styles.similarGrid}>
                {similar.map((j) => <JobCard key={j._id} job={j} />)}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div style={styles.sidebar}>

          {/* Recruiter Card */}
          <div style={styles.sideCard}>
            <h3 style={styles.sideTitle}>About the Recruiter</h3>
            <div style={styles.recruiterInfo}>
              {recruiter?.recruiterPhoto
                ? <img src={`http://localhost:5000/${recruiter.recruiterPhoto}`}
                    alt="" style={styles.recruiterAvatar} />
                : <div style={styles.recruiterAvatarPh}>{recruiter?.name?.charAt(0)}</div>
              }
              <div>
                <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{recruiter?.name}</p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{recruiter?.designation}</p>
              </div>
            </div>
          </div>

          {/* Company Card */}
          <div style={styles.sideCard}>
            <h3 style={styles.sideTitle}>
              <FaBuilding style={{ marginRight: 6 }} color="#6366f1" /> Company Info
            </h3>
            <div style={styles.companyCard}>
              {job.companyLogo && (
                <img src={`http://localhost:5000/${job.companyLogo}`}
                  alt="" style={styles.companyLogo} />
              )}
              <h4 style={{ fontWeight: 700, color: '#111827', marginBottom: 6 }}>{job.companyName}</h4>
              {job.companyBio && <p style={styles.companyBio}>{job.companyBio}</p>}
              {recruiter?.headquarters && (
                <p style={styles.companyMeta}><FaMapMarkerAlt size={11} /> {recruiter.headquarters}</p>
              )}
              {recruiter?.website && (
                <a href={recruiter.website} target="_blank" rel="noreferrer" style={styles.websiteLink}>
                  <FaGlobe size={11} /> {recruiter.website}
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  wrap:             { maxWidth: 1100, margin: '0 auto', padding: '30px 20px' },
  backBtn:          { display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontWeight: 600, marginBottom: 20, fontSize: '0.9rem' },
  layout:           { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 },
  main:             { display: 'flex', flexDirection: 'column', gap: 16 },
  headerCard:       { background: '#fff', borderRadius: 16, padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  headerTop:        { display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-start' },
  logoWrap:         { flexShrink: 0 },
  logo:             { width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '1px solid #f3f4f6' },
  logoPh:           { width: 72, height: 72, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerInfo:       { flex: 1 },
  jobTitle:         { fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: 4 },
  companyName:      { color: '#6366f1', fontWeight: 600, marginBottom: 10 },
  metaRow:          { display: 'flex', gap: 12, flexWrap: 'wrap' },
  meta:             { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: '#6b7280' },
  bookmarkBtn:      { background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 },
  salaryRow:        { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  salary:           { display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, color: '#111827', fontSize: '1.1rem' },
  expBadge:         { background: '#f3f4f6', color: '#374151', padding: '4px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600 },
  skillsRow:        { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 },
  skill:            { background: '#ede9fe', color: '#6d28d9', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 },
  applyRow:         { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  applyBtn:         { background: '#6366f1', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: '1rem' },
  appliedBox:       { display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px 16px' },
  postedOn:         { color: '#9ca3af', fontSize: '0.82rem' },
  section:          { background: '#fff', borderRadius: 14, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionTitle:     { fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: 16 },
  desc:             { color: '#4b5563', lineHeight: 1.7, fontSize: '0.92rem' },
  list:             { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 },
  listItem:         { display: 'flex', alignItems: 'flex-start', gap: 8, color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.5 },
  hiringSteps:      { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  hiringStep:       { display: 'flex', alignItems: 'center', gap: 8 },
  stepNum:          { width: 32, height: 32, borderRadius: '50%', background: '#6366f1', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 },
  stepContent:      { },
  stepTitle:        { fontWeight: 700, color: '#111827', fontSize: '0.88rem' },
  stepDesc:         { color: '#6b7280', fontSize: '0.78rem' },
  stepArrow:        { color: '#9ca3af', fontSize: '1.2rem', fontWeight: 300 },
  perksGrid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 10 },
  perkItem:         { display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', fontSize: '0.85rem', color: '#374151', fontWeight: 500 },
  similarGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  sidebar:          { display: 'flex', flexDirection: 'column', gap: 16 },
  sideCard:         { background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sideTitle:        { fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center' },
  recruiterInfo:    { display: 'flex', alignItems: 'center', gap: 12 },
  recruiterAvatar:  { width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' },
  recruiterAvatarPh:{ width: 48, height: 48, borderRadius: '50%', background: '#6366f1', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  companyCard:      { display: 'flex', flexDirection: 'column', gap: 8 },
  companyLogo:      { width: 60, height: 60, borderRadius: 10, objectFit: 'cover', border: '1px solid #f3f4f6' },
  companyBio:       { fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6 },
  companyMeta:      { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#6b7280' },
  websiteLink:      { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#6366f1', fontWeight: 600 },
};

export default JobDetail;