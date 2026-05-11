import { useState }          from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API                   from '../../api/axios';
import toast                 from 'react-hot-toast';
import { FaUpload, FaTimes } from 'react-icons/fa';

const CandidateRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [photo,   setPhoto]   = useState(null);
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', dob: '', gender: '',
    headline: '', bio: '', location: '',
    jobType: '', expectedSalary: '', noticePeriod: '', totalExperience: '',
    skills: [],
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!form.skills.includes(skillInput.trim())) {
        setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const formData = new FormData();
      const { confirmPassword, skills, ...rest } = form;
      Object.entries(rest).forEach(([k, v]) => formData.append(k, v));
      formData.append('skills', JSON.stringify(skills));
      if (photo) formData.append('profilePhoto', photo);

      await API.post('/candidate/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('✅ Registration successful! Please login.');
      navigate('/candidate/login');

    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.title}>👤 Candidate Registration</h2>
          <p style={styles.subtitle}>Create your profile and start applying for jobs</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Profile Photo ── */}
          <div style={styles.photoSection}>
            <div style={styles.photoPreview}>
              {preview
                ? <img src={preview} alt="" style={styles.previewImg} />
                : <FaUpload size={24} color="#9ca3af" />
              }
            </div>
            <div>
              <label style={styles.uploadBtn}>
                Upload Photo
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => {
                    setPhoto(e.target.files[0]);
                    setPreview(URL.createObjectURL(e.target.files[0]));
                  }} />
              </label>
              <p style={styles.photoHint}>JPG, PNG — Max 5MB</p>
            </div>
          </div>

          {/* ── Basic Info ── */}
          <p className="section-head">Basic Information</p>
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Arjun Kumar" required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="arjun@gmail.com" required />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword}
                onChange={handleChange} placeholder="Re-enter password" required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="9876543210" />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input name="dob" type="date" value={form.dob} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange}
                placeholder="Bengaluru, Karnataka" />
            </div>
          </div>

          {/* ── Professional Info ── */}
          <p className="section-head">Professional Information</p>
          <div className="form-group">
            <label>Headline</label>
            <input name="headline" value={form.headline} onChange={handleChange}
              placeholder="e.g. Full Stack Developer | 3 years experience" />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange}
              placeholder="Tell recruiters about yourself..." rows={3}
              style={{ resize: 'vertical' }} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Total Experience</label>
              <input name="totalExperience" value={form.totalExperience}
                onChange={handleChange} placeholder="e.g. 3 years" />
            </div>
            <div className="form-group">
              <label>Job Type Preference</label>
              <select name="jobType" value={form.jobType} onChange={handleChange}>
                <option value="">Select</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Remote</option>
                <option>Internship</option>
                <option>Contract</option>
              </select>
            </div>
            <div className="form-group">
              <label>Expected Salary</label>
              <input name="expectedSalary" value={form.expectedSalary}
                onChange={handleChange} placeholder="e.g. 12 LPA" />
            </div>
            <div className="form-group">
              <label>Notice Period</label>
              <input name="noticePeriod" value={form.noticePeriod}
                onChange={handleChange} placeholder="e.g. 30 days" />
            </div>
          </div>

          {/* ── Skills ── */}
          <p className="section-head">Skills</p>
          <div className="form-group">
            <label>Add Skills (Press Enter)</label>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              placeholder="Type a skill and press Enter..."
            />
            <div className="tag-wrap">
              {form.skills.map((s) => (
                <span key={s} className="tag-item">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)}>
                    <FaTimes size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>

          <p style={styles.loginLink}>
            Already have an account?{' '}
            <Link to="/candidate/login" style={{ color: '#6366f1', fontWeight: 600 }}>Login here</Link>
          </p>
          <p style={{ ...styles.loginLink, marginTop: 8 }}>
            Are you a recruiter?{' '}
            <Link to="/recruiter/register" style={{ color: '#8b5cf6', fontWeight: 600 }}>Register as Recruiter</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrap:        { padding: '40px 20px', maxWidth: 760, margin: '0 auto' },
  card:        { background: '#fff', borderRadius: 16, padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  cardHeader:  { marginBottom: 28 },
  title:       { fontSize: '1.8rem', fontWeight: 800, color: '#111827' },
  subtitle:    { color: '#6b7280', marginTop: 6 },
  photoSection:{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, padding: 16, background: '#f9fafb', borderRadius: 12 },
  photoPreview:{ width: 80, height: 80, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '2px solid #c4b5fd' },
  previewImg:  { width: '100%', height: '100%', objectFit: 'cover' },
  uploadBtn:   { display: 'inline-block', background: '#6366f1', color: '#fff', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' },
  photoHint:   { fontSize: '0.78rem', color: '#9ca3af', marginTop: 6 },
  loginLink:   { textAlign: 'center', marginTop: 16, fontSize: '0.9rem', color: '#6b7280' },
};

export default CandidateRegister;