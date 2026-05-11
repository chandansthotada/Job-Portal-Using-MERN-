import { useEffect, useState } from 'react';
import { useParams, Link }     from 'react-router-dom';
import API         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader      from '../../components/Loader';
import JobCard     from '../../components/JobCard';
import {
  FaMapMarkerAlt, FaGlobe, FaBuilding,
  FaUsers, FaCalendar, FaEdit,
  FaLinkedin, FaTwitter, FaFacebook,
  FaEnvelope, FaPhone
} from 'react-icons/fa';

const RecruiterProfile = () => {
  const { id }       = useParams();
  const { recruiter } = useAuth();
  const [profile,  setProfile]  = useState(null);
  const [jobs,     setJobs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const isOwner = recruiter?._id === id;

  useEffect(() => {
    const fetch = async () => {
      try {
        const [profileRes, jobsRes] = await Promise.all([
          API.get(`/recruiter/profile/${id}`),
          API.get(`/jobs/recruiter/${id}?status=active&limit=4`),
        ]);
        setProfile(profileRes.data.recruiter);
        setJobs(jobsRes.data.jobs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <Loader />;
  if (!profile) return <div style={{ textAlign: 'center', padding: 60 }}>Profile not found</div>;

  return (
    <div style={styles.wrap}>

      {/* ── Hero ── */}
      <div style={styles.heroCard}>
        {/* Cover */}
        <div style={styles.cover} />

        <div style={styles.heroBody}>
          <div style={styles.logoSection}>
            {profile.companyLogo
              ? <img src={`http://localhost:5000/${profile.companyLogo}`}
                  alt="" style={styles.companyLogo} />
              : <div style={styles.companyLogoPh}>{profile.companyName?.charAt(0)}</div>
            }
          </div>

          <div style={styles.heroInfo}>
            <div style={styles.heroTop}>
              <div>
                <h1 style={styles.companyName}>{profile.companyName}</h1>
                <p style={styles.industry}>{profile.industry}</p>
                <div style={styles.metaRow}>
                  {profile.headquarters && (
                    <span style={styles.meta}><FaMapMarkerAlt size={12} /> {profile.headquarters}</span>
                  )}
                  {profile.companySize && (
                    <span style={styles.meta}><FaUsers size={12} /> {profile.companySize} employees</span>
                  )}
                  {profile.founded && (
                    <span style={styles.meta}><FaCalendar size={12} /> Founded {profile.founded}</span>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noreferrer" style={styles.metaLink}>
                      <FaGlobe size={12} /> {profile.website}
                    </a>
                  )}
                </div>
              </div>
              {isOwner && (
                <Link to={`/recruiter/profile/${id}/edit`} style={styles.editBtn}>
                  <FaEdit style={{ marginRight: 6 }} /> Edit Profile
                </Link>
              )}
            </div>

            {/* Social */}
            <div style={styles.socialRow}>
              {profile.socialLinks?.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer"
                  style={{ ...styles.socialBtn, background: '#0077b5' }}>
                  <FaLinkedin size={14} />
                </a>
              )}
              {profile.socialLinks?.twitter && (
                <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer"
                  style={{ ...styles.socialBtn, background: '#1da1f2' }}>
                  <FaTwitter size={14} />
                </a>
              )}
              {profile.socialLinks?.facebook && (
                <a href={profile.socialLinks.facebook} target="_blank" rel="noreferrer"
                  style={{ ...styles.socialBtn, background: '#1877f2' }}>
                  <FaFacebook size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.mainCol}>

          {/* ── About Company ── */}
          {profile.companyBio && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}><FaBuilding style={{ marginRight: 8 }} color="#6366f1" />About the Company</h2>
              <p style={styles.bioText}>{profile.companyBio}</p>
            </div>
          )}

          {/* ── Company Photos ── */}
          {profile.companyImages?.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>📸 Company Photos</h2>
              <div style={styles.photosGrid}>
                {profile.companyImages.map((img, i) => (
                  <img key={i} src={`http://localhost:5000/${img}`}
                    alt={`Company ${i + 1}`} style={styles.companyPhoto} />
                ))}
              </div>
            </div>
          )}

          {/* ── Active Jobs ── */}
          <div style={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
                💼 Active Jobs ({jobs.length})
              </h2>
              {isOwner && (
                <Link to="/recruiter/post-job" style={styles.postJobBtn}>+ Post Job</Link>
              )}
            </div>
            {jobs.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>
                No active jobs posted yet.
              </p>
            ) : (
              <div style={styles.jobsGrid}>
                {jobs.map((job) => <JobCard key={job._id} job={job} />)}
              </div>
            )}
          </div>

        </div>

        {/* ── Sidebar ── */}
        <div style={styles.sidebar}>

          {/* Recruiter Info */}
          <div style={styles.sideCard}>
            <h3 style={styles.sideTitle}>Posted by</h3>
            <div style={styles.recruiterRow}>
              {profile.recruiterPhoto
                ? <img src={`http://localhost:5000/${profile.recruiterPhoto}`}
                    alt="" style={styles.recruiterAvatar} />
                : <div style={styles.recruiterAvatarPh}>{profile.name?.charAt(0)}</div>
              }
              <div>
                <p style={styles.recruiterName}>{profile.name}</p>
                <p style={styles.recruiterDesig}>{profile.designation}</p>
              </div>
            </div>
            {profile.bio && <p style={styles.recruiterBio}>{profile.bio}</p>}
            <div style={styles.contactList}>
              {profile.email && (
                <a href={`mailto:${profile.email}`} style={styles.contactItem}>
                  <FaEnvelope size={12} color="#6366f1" /> {profile.email}
                </a>
              )}
              {profile.phone && (
                <span style={styles.contactItem}>
                  <FaPhone size={12} color="#6366f1" /> {profile.phone}
                </span>
              )}
            </div>
          </div>

          {/* Company Overview */}
          <div style={styles.sideCard}>
            <h3 style={styles.sideTitle}>Company Overview</h3>
            {[
              { label: 'Industry',    value: profile.industry },
              { label: 'Company Size',value: profile.companySize ? `${profile.companySize} employees` : null },
              { label: 'Founded',     value: profile.founded },
              { label: 'Location',    value: profile.headquarters },
            ].filter((i) => i.value).map(({ label, value }) => (
              <div key={label} style={styles.overviewRow}>
                <span style={styles.overviewLabel}>{label}</span>
                <span style={styles.overviewValue}>{value}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  wrap:              { maxWidth: 1000, margin: '0 auto', padding: '0 20px 40px' },
  heroCard:          { background: '#fff', borderRadius: '0 0 16px 16px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' },
  cover:             { height: 140, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' },
  heroBody:          { padding: '0 32px 28px' },
  logoSection:       { marginTop: -44, marginBottom: 14 },
  companyLogo:       { width: 88, height: 88, borderRadius: 14, objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' },
  companyLogoPh:     { width: 88, height: 88, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #fff' },
  heroInfo:          { },
  heroTop:           { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
  companyName:       { fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: 2 },
  industry:          { color: '#6366f1', fontWeight: 600, marginBottom: 10 },
  metaRow:           { display: 'flex', gap: 14, flexWrap: 'wrap' },
  meta:              { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: '#6b7280' },
  metaLink:          { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: '#6366f1', fontWeight: 600 },
  editBtn:           { display: 'flex', alignItems: 'center', background: '#6366f1', color: '#fff', padding: '9px 18px', borderRadius: 8, fontWeight: 600, fontSize: '0.88rem' },
  socialRow:         { display: 'flex', gap: 8, marginTop: 14 },
  socialBtn:         { color: '#fff', width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  body:              { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 },
  mainCol:           { display: 'flex', flexDirection: 'column', gap: 16 },
  sidebar:           { display: 'flex', flexDirection: 'column', gap: 16 },
  section:           { background: '#fff', borderRadius: 14, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionTitle:      { fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center' },
  bioText:           { color: '#4b5563', lineHeight: 1.7, fontSize: '0.92rem' },
  photosGrid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 },
  companyPhoto:      { width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, border: '1px solid #f3f4f6' },
  jobsGrid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 },
  postJobBtn:        { background: '#6366f1', color: '#fff', padding: '7px 16px', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem' },
  sideCard:          { background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sideTitle:         { fontSize: '0.92rem', fontWeight: 700, color: '#111827', marginBottom: 14 },
  recruiterRow:      { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  recruiterAvatar:   { width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' },
  recruiterAvatarPh: { width: 48, height: 48, borderRadius: '50%', background: '#6366f1', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  recruiterName:     { fontWeight: 700, color: '#111827', fontSize: '0.92rem' },
  recruiterDesig:    { color: '#6b7280', fontSize: '0.78rem' },
  recruiterBio:      { color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: 12, paddingTop: 8, borderTop: '1px solid #f3f4f6' },
  contactList:       { display: 'flex', flexDirection: 'column', gap: 6 },
  contactItem:       { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#374151', fontWeight: 500 },
  overviewRow:       { display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.82rem' },
  overviewLabel:     { color: '#9ca3af', fontWeight: 500 },
  overviewValue:     { color: '#111827', fontWeight: 600, textAlign: 'right' },
};

export default RecruiterProfile;