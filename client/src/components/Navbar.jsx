import { useState }        from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth }         from '../context/AuthContext';
import toast               from 'react-hot-toast';
import {
  FaBriefcase, FaUser, FaSignOutAlt,
  FaTachometerAlt, FaBars, FaTimes,
  FaBookmark, FaFileAlt, FaPlusCircle
} from 'react-icons/fa';

const Navbar = () => {
  const { candidate, recruiter, logoutCandidate, logoutRecruiter } = useAuth();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    if (candidate) {
      logoutCandidate();
      toast.success('Logged out successfully');
      navigate('/candidate/login');
    } else if (recruiter) {
      logoutRecruiter();
      toast.success('Logged out successfully');
      navigate('/recruiter/login');
    }
    setOpen(false);
  };

  return (
    <nav style={styles.nav}>
      {/* ── Brand ── */}
      <Link to="/" style={styles.brand}>
        <FaBriefcase style={{ marginRight: 8 }} size={22} />
        JobPortal
      </Link>

      {/* ── Mobile toggle ── */}
      <button onClick={() => setOpen(!open)} style={styles.toggle}>
        {open ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* ── Links ── */}
      <div style={{ ...styles.links, ...(open ? styles.linksOpen : {}) }}>

        <Link to="/jobs" style={styles.link} onClick={() => setOpen(false)}>
          Browse Jobs
        </Link>

        {/* ── Candidate Links ── */}
        {candidate && (
          <>
            <Link to="/candidate/dashboard" style={styles.link} onClick={() => setOpen(false)}>
              <FaTachometerAlt style={{ marginRight: 4 }} /> Dashboard
            </Link>
            <Link to="/candidate/applications" style={styles.link} onClick={() => setOpen(false)}>
              <FaFileAlt style={{ marginRight: 4 }} /> Applications
            </Link>
            <Link to="/candidate/bookmarks" style={styles.link} onClick={() => setOpen(false)}>
              <FaBookmark style={{ marginRight: 4 }} /> Saved
            </Link>
            <Link to={`/candidate/profile/${candidate._id}`} style={styles.avatarLink} onClick={() => setOpen(false)}>
              {candidate.profilePhoto
                ? <img src={`http://localhost:5000/${candidate.profilePhoto}`}
                    alt="" style={styles.avatar} />
                : <div style={styles.avatarPh}>{candidate.name?.charAt(0)}</div>
              }
            </Link>
          </>
        )}

        {/* ── Recruiter Links ── */}
        {recruiter && (
          <>
            <Link to="/recruiter/dashboard" style={styles.link} onClick={() => setOpen(false)}>
              <FaTachometerAlt style={{ marginRight: 4 }} /> Dashboard
            </Link>
            <Link to="/recruiter/jobs" style={styles.link} onClick={() => setOpen(false)}>
              <FaBriefcase style={{ marginRight: 4 }} /> My Jobs
            </Link>
            <Link to="/recruiter/post-job" style={styles.btnPost} onClick={() => setOpen(false)}>
              <FaPlusCircle style={{ marginRight: 6 }} /> Post Job
            </Link>
            <Link to={`/recruiter/profile/${recruiter._id}`} style={styles.avatarLink} onClick={() => setOpen(false)}>
              {recruiter.recruiterPhoto
                ? <img src={`http://localhost:5000/${recruiter.recruiterPhoto}`}
                    alt="" style={styles.avatar} />
                : <div style={styles.avatarPh}>{recruiter.name?.charAt(0)}</div>
              }
            </Link>
          </>
        )}

        {/* ── Not logged in ── */}
        {!candidate && !recruiter && (
          <div style={styles.authLinks}>
            <Link to="/candidate/login"  style={styles.link}       onClick={() => setOpen(false)}>Candidate Login</Link>
            <Link to="/recruiter/login"  style={styles.link}       onClick={() => setOpen(false)}>Recruiter Login</Link>
            <Link to="/candidate/register" style={styles.btnPost}  onClick={() => setOpen(false)}>Sign Up</Link>
          </div>
        )}

        {/* ── Logout ── */}
        {(candidate || recruiter) && (
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <FaSignOutAlt style={{ marginRight: 4 }} /> Logout
          </button>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px', height: 64, background: '#fff', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 },
  brand:      { display: 'flex', alignItems: 'center', color: '#6366f1', fontWeight: 800, fontSize: '1.3rem', textDecoration: 'none' },
  toggle:     { display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#374151' },
  links:      { display: 'flex', alignItems: 'center', gap: 8 },
  linksOpen:  {},
  link:       { display: 'flex', alignItems: 'center', color: '#374151', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', padding: '6px 12px', borderRadius: 8, transition: 'background 0.2s' },
  authLinks:  { display: 'flex', alignItems: 'center', gap: 8 },
  btnPost:    { display: 'flex', alignItems: 'center', background: '#6366f1', color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' },
  avatarLink: { textDecoration: 'none' },
  avatar:     { width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ede9fe' },
  avatarPh:   { width: 36, height: 36, borderRadius: '50%', background: '#6366f1', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' },
  logoutBtn:  { display: 'flex', alignItems: 'center', background: 'none', border: '1px solid #e5e7eb', color: '#6b7280', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' },
};

export default Navbar;