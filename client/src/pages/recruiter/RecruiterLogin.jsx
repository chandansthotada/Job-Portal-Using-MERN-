import { useState }          from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API                   from '../../api/axios';
import toast                 from 'react-hot-toast';
import { useAuth }           from '../../context/AuthContext';
import { FaBuilding }        from 'react-icons/fa';

const RecruiterLogin = () => {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginRecruiter }    = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/recruiter/login', form);
      loginRecruiter(data.recruiter);
      toast.success(`Welcome back, ${data.recruiter.name}! 👋`);
      navigate('/recruiter/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={styles.iconWrap}>
            <FaBuilding size={28} color="#8b5cf6" />
          </div>
          <h2 style={styles.title}>Recruiter Login</h2>
          <p style={styles.subtitle}>Login to manage your job postings</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="priya@company.com" required />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password" required />
          </div>
          <button type="submit" className="btn-primary"
            disabled={loading}
            style={{ marginTop: 4, background: '#7c3aed' }}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <div style={styles.links}>
          <p>Don't have an account?{' '}
            <Link to="/recruiter/register" style={styles.link}>Register here</Link>
          </p>
          <p style={{ marginTop: 8 }}>Looking for a job?{' '}
            <Link to="/candidate/login" style={{ ...styles.link, color: '#6366f1' }}>Candidate Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrap:     { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', padding: 20 },
  card:     { background: '#fff', borderRadius: 16, padding: '40px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: 420 },
  iconWrap: { width: 60, height: 60, background: '#ede9fe', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  title:    { fontSize: '1.6rem', fontWeight: 800, color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 6, fontSize: '0.92rem' },
  links:    { textAlign: 'center', marginTop: 20, fontSize: '0.9rem', color: '#6b7280' },
  link:     { color: '#7c3aed', fontWeight: 600 },
};

export default RecruiterLogin;