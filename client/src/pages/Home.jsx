import { useEffect, useState } from 'react';
import { Link }   from 'react-router-dom';
import API        from '../api/axios';
import JobCard    from '../components/JobCard';
import { useAuth } from '../context/AuthContext';
import {
  FaBriefcase, FaBuilding, FaUsers,
  FaSearch, FaRocket, FaCheckCircle,
  FaFileAlt, FaHandshake
} from 'react-icons/fa';

const Home = () => {
  const { candidate, recruiter } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [stats,        setStats]        = useState({ jobs: 0, companies: 0, candidates: 0 });
  const [search,       setSearch]       = useState('');
  const navigate = (path) => window.location.href = path;

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await API.get('/jobs?limit=6&sortBy=views');
        setFeaturedJobs(data.jobs);
        setStats({
          jobs:       data.total,
          companies:  Math.floor(data.total / 3),
          candidates: data.total * 12,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/jobs?search=${search}`;
  };

  return (
    <div>

      {/* ── Hero ── */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>🚀 India's Smartest Job Portal</div>
          <h1 style={styles.heroTitle}>
            Find Your Dream Job<br />
            <span style={styles.heroAccent}>or Perfect Candidate</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Connect with top companies and talented professionals.
            Your next big opportunity is just one click away.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={styles.searchBar}>
            <FaSearch color="#9ca3af" style={{ marginLeft: 16, flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, skills, companies..."
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchBtn}>Search Jobs</button>
          </form>

          {/* Popular Searches */}
          <div style={styles.popularSearch}>
            <span style={{ color: '#d1d5db', fontSize: '0.85rem' }}>Popular:</span>
            {['React Developer', 'Node.js', 'Python', 'UI/UX Designer', 'Data Analyst'].map((s) => (
              <a key={s} href={`/jobs?search=${s}`} style={styles.popularTag}>{s}</a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <StatItem icon={<FaBriefcase size={28} color="#6366f1" />}
            value={`${stats.jobs}+`}     label="Active Jobs" />
          <StatItem icon={<FaBuilding size={28} color="#8b5cf6" />}
            value={`${stats.companies}+`} label="Companies" />
          <StatItem icon={<FaUsers size={28} color="#06b6d4" />}
            value={`${stats.candidates}+`} label="Job Seekers" />
          <StatItem icon={<FaHandshake size={28} color="#22c55e" />}
            value="95%"                  label="Placement Rate" />
        </div>
      </section>

      {/* ── Featured Jobs ── */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Featured Jobs</h2>
            <p style={styles.sectionSubtitle}>Handpicked opportunities from top companies</p>
          </div>
          <Link to="/jobs" style={styles.viewAll}>View All Jobs →</Link>
        </div>
        <div style={styles.jobsGrid}>
          {featuredJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
        {featuredJobs.length === 0 && (
          <div style={styles.empty}>No jobs posted yet. Check back soon!</div>
        )}
      </section>

      {/* ── How it Works ── */}
      <section style={styles.howSection}>
        <h2 style={{ ...styles.sectionTitle, textAlign: 'center', marginBottom: 8 }}>
          How It Works
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 48 }}>
          Get hired or hire in 3 simple steps
        </p>
        <div style={styles.howGrid}>

          <div style={styles.howCol}>
            <h3 style={styles.howColTitle}>
              <FaUsers style={{ marginRight: 8 }} color="#6366f1" /> For Candidates
            </h3>
            {[
              { icon: <FaFileAlt />, title: 'Create Profile',  desc: 'Build your LinkedIn-style profile with skills, experience & portfolio' },
              { icon: <FaSearch />,  title: 'Search Jobs',     desc: 'Browse thousands of jobs filtered by skills, location & salary' },
              { icon: <FaRocket />,  title: 'Apply & Get Hired', desc: 'Apply with your resume, track status and land your dream job' },
            ].map((s, i) => <HowStep key={i} step={s} index={i} />)}
          </div>

          <div style={styles.howDivider} />

          <div style={styles.howCol}>
            <h3 style={styles.howColTitle}>
              <FaBuilding style={{ marginRight: 8 }} color="#8b5cf6" /> For Recruiters
            </h3>
            {[
              { icon: <FaBuilding />,  title: 'Setup Company',   desc: 'Create your company profile with logo, photos and details' },
              { icon: <FaBriefcase />, title: 'Post Jobs',        desc: 'Post detailed job listings with hiring process and requirements' },
              { icon: <FaCheckCircle />, title: 'Hire Talent',   desc: 'Review applications, shortlist candidates and approve the best fit' },
            ].map((s, i) => <HowStep key={i} step={s} index={i} color="#8b5cf6" />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={styles.cta}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
          Ready to get started?
        </h2>
        <p style={{ opacity: 0.85, marginBottom: 32, fontSize: '1.05rem' }}>
          Join thousands of professionals and companies on JobPortal
        </p>
        <div style={styles.ctaButtons}>
          {!candidate && (
            <Link to="/candidate/register" style={styles.ctaBtnWhite}>
              Find Jobs →
            </Link>
          )}
          {!recruiter && (
            <Link to="/recruiter/register" style={styles.ctaBtnOutline}>
              Post a Job →
            </Link>
          )}
        </div>
      </section>

    </div>
  );
};

// ── Sub Components ──
const StatItem = ({ icon, value, label }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ marginBottom: 8 }}>{icon}</div>
    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827' }}>{value}</h3>
    <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: 2 }}>{label}</p>
  </div>
);

const HowStep = ({ step, index, color = '#6366f1' }) => (
  <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
      {index + 1}
    </div>
    <div>
      <h4 style={{ fontWeight: 700, color: '#111827', marginBottom: 4 }}>{step.title}</h4>
      <p style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.6 }}>{step.desc}</p>
    </div>
  </div>
);

const styles = {
  hero:          { background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #7c3aed 100%)', padding: '80px 20px 100px', textAlign: 'center', color: '#fff' },
  heroContent:   { maxWidth: 780, margin: '0 auto' },
  heroBadge:     { display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: '0.85rem', fontWeight: 600, marginBottom: 20 },
  heroTitle:     { fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: 16 },
  heroAccent:    { color: '#a5b4fc' },
  heroSubtitle:  { fontSize: '1.1rem', opacity: 0.85, lineHeight: 1.7, marginBottom: 36 },
  searchBar:     { display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 12, overflow: 'hidden', maxWidth: 620, margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  searchInput:   { flex: 1, border: 'none', outline: 'none', padding: '14px 16px', fontSize: '0.95rem', color: '#111827' },
  searchBtn:     { background: '#6366f1', color: '#fff', border: 'none', padding: '14px 24px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', flexShrink: 0 },
  popularSearch: { display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  popularTag:    { background: 'rgba(255,255,255,0.15)', color: '#e0e7ff', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.2)' },
  statsSection:  { background: '#fff', padding: '40px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  statsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, maxWidth: 900, margin: '0 auto' },
  section:       { maxWidth: 1100, margin: '0 auto', padding: '60px 20px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 10 },
  sectionTitle:  { fontSize: '1.6rem', fontWeight: 800, color: '#111827' },
  sectionSubtitle:{ color: '#6b7280', marginTop: 4, fontSize: '0.92rem' },
  viewAll:       { color: '#6366f1', fontWeight: 600, fontSize: '0.92rem', border: '1px solid #6366f1', padding: '8px 16px', borderRadius: 8 },
  jobsGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 },
  empty:         { textAlign: 'center', padding: 60, color: '#9ca3af' },
  howSection:    { background: '#f5f3ff', padding: '80px 20px' },
  howGrid:       { display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 40, maxWidth: 900, margin: '0 auto' },
  howCol:        { },
  howColTitle:   { display: 'flex', alignItems: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: 28 },
  howDivider:    { background: '#ddd6fe' },
  cta:           { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', textAlign: 'center', padding: '80px 20px' },
  ctaButtons:    { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  ctaBtnWhite:   { background: '#fff', color: '#6366f1', padding: '13px 32px', borderRadius: 10, fontWeight: 700, fontSize: '1rem' },
  ctaBtnOutline: { border: '2px solid #fff', color: '#fff', padding: '13px 32px', borderRadius: 10, fontWeight: 700, fontSize: '1rem' },
};

export default Home;