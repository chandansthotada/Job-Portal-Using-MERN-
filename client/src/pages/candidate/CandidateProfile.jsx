import { useEffect, useState } from 'react';
import { useParams, Link }     from 'react-router-dom';
import API         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader      from '../../components/Loader';
import {
  FaMapMarkerAlt, FaEnvelope, FaPhone,
  FaLinkedin, FaGithub, FaGlobe, FaTwitter,
  FaEdit, FaBriefcase, FaGraduationCap,
  FaCertificate, FaCode, FaTrophy,
  FaCheckCircle
} from 'react-icons/fa';

const CandidateProfile = () => {
  const { id }        = useParams();
  const { candidate } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isOwner = candidate?._id === id;

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/candidate/profile/${id}`);
        setProfile(data.candidate);
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

      {/* ── Hero Card ── */}
      <div style={styles.heroCard}>
        <div style={styles.heroInner}>
          <div style={styles.avatarWrap}>
            {profile.profilePhoto
              ? <img src={`http://localhost:5000/${profile.profilePhoto}`}
                  alt="" style={styles.avatar} />
              : <div style={styles.avatarPh}>{profile.name?.charAt(0)}</div>
            }
            {profile.isOpen && (
              <span style={styles.openBadge}>
                <FaCheckCircle size={10} style={{ marginRight: 3 }} /> Open to Work
              </span>
            )}
          </div>
          <div style={styles.heroInfo}>
            <h1 style={styles.name}>{profile.name}</h1>
            {profile.headline && <p style={styles.headline}>{profile.headline}</p>}
            <div style={styles.metaRow}>
              {profile.location && (
                <span style={styles.meta}><FaMapMarkerAlt size={12} /> {profile.location}</span>
              )}
              {profile.totalExperience && (
                <span style={styles.meta}><FaBriefcase size={12} /> {profile.totalExperience}</span>
              )}
              {profile.jobType && (
                <span style={styles.meta}>🔍 {profile.jobType}</span>
              )}
            </div>
            {/* Contact */}
            <div style={styles.contactRow}>
              {profile.email && (
                <a href={`mailto:${profile.email}`} style={styles.contactLink}>
                  <FaEnvelope size={13} /> {profile.email}
                </a>
              )}
              {profile.phone && (
                <span style={styles.contactLink}>
                  <FaPhone size={13} /> {profile.phone}
                </span>
              )}
            </div>
            {/* Social Links */}
            <div style={styles.socialRow}>
              {profile.socialLinks?.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" style={{ ...styles.socialBtn, background: '#0077b5' }}>
                  <FaLinkedin size={14} />
                </a>
              )}
              {profile.socialLinks?.github && (
                <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" style={{ ...styles.socialBtn, background: '#24292e' }}>
                  <FaGithub size={14} />
                </a>
              )}
              {profile.socialLinks?.twitter && (
                <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" style={{ ...styles.socialBtn, background: '#1da1f2' }}>
                  <FaTwitter size={14} />
                </a>
              )}
              {profile.socialLinks?.website && (
                <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" style={{ ...styles.socialBtn, background: '#6366f1' }}>
                  <FaGlobe size={14} />
                </a>
              )}
            </div>
          </div>
          {isOwner && (
            <Link to={`/candidate/profile/${id}/edit`} style={styles.editBtn}>
              <FaEdit style={{ marginRight: 6 }} /> Edit Profile
            </Link>
          )}
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.mainCol}>

          {/* ── About ── */}
          {profile.bio && (
            <Section title="About" icon={<FaGlobe />}>
              <p style={styles.bioText}>{profile.bio}</p>
            </Section>
          )}

          {/* ── Experience ── */}
          {profile.experience?.length > 0 && (
            <Section title="Experience" icon={<FaBriefcase />}>
              {profile.experience.map((exp, i) => (
                <div key={i} style={styles.timelineItem}>
                  <div style={styles.timelineDot} />
                  <div style={styles.timelineContent}>
                    <h4 style={styles.itemTitle}>{exp.title}</h4>
                    <p style={styles.itemSub}>{exp.company} {exp.location && `• ${exp.location}`}</p>
                    <p style={styles.itemDate}>
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                    </p>
                    {exp.description && <p style={styles.itemDesc}>{exp.description}</p>}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {/* ── Education ── */}
          {profile.education?.length > 0 && (
            <Section title="Education" icon={<FaGraduationCap />}>
              {profile.education.map((edu, i) => (
                <div key={i} style={styles.timelineItem}>
                  <div style={styles.timelineDot} />
                  <div style={styles.timelineContent}>
                    <h4 style={styles.itemTitle}>{edu.degree} — {edu.field}</h4>
                    <p style={styles.itemSub}>{edu.institution}</p>
                    <p style={styles.itemDate}>{edu.startYear} — {edu.endYear}</p>
                    {edu.grade && <p style={styles.itemDesc}>Grade: {edu.grade}</p>}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {/* ── Projects ── */}
          {profile.projects?.length > 0 && (
            <Section title="Projects" icon={<FaCode />}>
              {profile.projects.map((proj, i) => (
                <div key={i} style={styles.projectCard}>
                  <h4 style={styles.itemTitle}>{proj.title}</h4>
                  <p style={styles.itemDesc}>{proj.description}</p>
                  {proj.techStack?.length > 0 && (
                    <div className="tag-wrap" style={{ marginTop: 8 }}>
                      {proj.techStack.map((t) => (
                        <span key={t} className="tag-item">{t}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" style={styles.projLink}>
                        <FaGlobe size={12} /> Live Demo
                      </a>
                    )}
                    {proj.github && (
                      <a href={proj.github} target="_blank" rel="noreferrer" style={styles.projLink}>
                        <FaGithub size={12} /> GitHub
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {/* ── Achievements ── */}
          {profile.achievements?.length > 0 && (
            <Section title="Achievements" icon={<FaTrophy />}>
              {profile.achievements.map((ach, i) => (
                <div key={i} style={styles.achieveItem}>
                  <FaTrophy color="#f59e0b" size={16} style={{ flexShrink: 0 }} />
                  <div>
                    <h4 style={styles.itemTitle}>{ach.title}</h4>
                    <p style={styles.itemDesc}>{ach.description}</p>
                    {ach.date && <p style={styles.itemDate}>{ach.date}</p>}
                  </div>
                </div>
              ))}
            </Section>
          )}

        </div>

        {/* ── Right Sidebar ── */}
        <div style={styles.sidebar}>

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>Skills</h3>
              <div className="tag-wrap">
                {profile.skills.map((s) => (
                  <span key={s} className="tag-item">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {profile.certifications?.length > 0 && (
            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}><FaCertificate style={{ marginRight: 6 }} color="#f59e0b" />Certifications</h3>
              {profile.certifications.map((cert, i) => (
                <div key={i} style={styles.certItem}>
                  <h4 style={styles.itemTitle}>{cert.name}</h4>
                  <p style={styles.itemSub}>{cert.issuer}</p>
                  <p style={styles.itemDate}>{cert.issueDate}</p>
                </div>
              ))}
            </div>
          )}

          {/* Job Preferences */}
          <div style={styles.sideCard}>
            <h3 style={styles.sideTitle}>Job Preferences</h3>
            {profile.jobType && <InfoRow label="Job Type"       value={profile.jobType} />}
            {profile.expectedSalary && <InfoRow label="Expected"  value={profile.expectedSalary} />}
            {profile.noticePeriod && <InfoRow label="Notice"     value={profile.noticePeriod} />}
            {profile.preferredLocations?.length > 0 && (
              <InfoRow label="Locations" value={profile.preferredLocations.join(', ')} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      <span style={styles.sectionIcon}>{icon}</span> {title}
    </h3>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={styles.infoRow}>
    <span style={styles.infoLabel}>{label}</span>
    <span style={styles.infoValue}>{value}</span>
  </div>
);

const styles = {
  wrap:            { maxWidth: 1000, margin: '0 auto', padding: '40px 20px' },
  heroCard:        { background: '#fff', borderRadius: 16, padding: '32px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  heroInner:       { display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' },
  avatarWrap:      { position: 'relative', flexShrink: 0 },
  avatar:          { width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', border: '4px solid #ede9fe' },
  avatarPh:        { width: 110, height: 110, borderRadius: '50%', background: '#6366f1', color: '#fff', fontSize: '2.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  openBadge:       { position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' },
  heroInfo:        { flex: 1 },
  name:            { fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: 4 },
  headline:        { color: '#6b7280', fontSize: '1rem', marginBottom: 10 },
  metaRow:         { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 },
  meta:            { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: '#6b7280' },
  contactRow:      { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 },
  contactLink:     { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: '#6366f1', fontWeight: 500 },
  socialRow:       { display: 'flex', gap: 8 },
  socialBtn:       { color: '#fff', width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  editBtn:         { display: 'flex', alignItems: 'center', background: '#6366f1', color: '#fff', padding: '9px 18px', borderRadius: 8, fontWeight: 600, fontSize: '0.88rem', height: 'fit-content', flexShrink: 0 },
  body:            { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 },
  mainCol:         { display: 'flex', flexDirection: 'column', gap: 16 },
  sidebar:         { display: 'flex', flexDirection: 'column', gap: 16 },
  section:         { background: '#fff', borderRadius: 14, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionTitle:    { fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 },
  sectionIcon:     { color: '#6366f1' },
  timelineItem:    { display: 'flex', gap: 14, marginBottom: 20 },
  timelineDot:     { width: 12, height: 12, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: 5 },
  timelineContent: { flex: 1, borderBottom: '1px solid #f3f4f6', paddingBottom: 16 },
  itemTitle:       { fontWeight: 700, color: '#111827', fontSize: '0.95rem', marginBottom: 2 },
  itemSub:         { color: '#6b7280', fontSize: '0.85rem', marginBottom: 2 },
  itemDate:        { color: '#9ca3af', fontSize: '0.78rem', marginBottom: 4 },
  itemDesc:        { color: '#4b5563', fontSize: '0.88rem', lineHeight: 1.6 },
  projectCard:     { background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid #f3f4f6' },
  projLink:        { display: 'flex', alignItems: 'center', gap: 5, color: '#6366f1', fontSize: '0.82rem', fontWeight: 600 },
  achieveItem:     { display: 'flex', gap: 12, marginBottom: 14 },
  sideCard:        { background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sideTitle:       { fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: 14, display: 'flex', alignItems: 'center' },
  certItem:        { marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' },
  infoRow:         { display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' },
  infoLabel:       { color: '#9ca3af', fontWeight: 500 },
  infoValue:       { color: '#111827', fontWeight: 600 },
  bioText:         { color: '#4b5563', lineHeight: 1.7, fontSize: '0.92rem' },
};

export default CandidateProfile;