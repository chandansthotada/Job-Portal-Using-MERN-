import { useState }          from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API                   from '../../api/axios';
import toast                 from 'react-hot-toast';
import { FaUpload, FaTimes, FaBuilding } from 'react-icons/fa';

const RecruiterRegister = () => {
  const navigate = useNavigate();
  const [loading,       setLoading]       = useState(false);
  const [recruiterPhoto,setRecruiterPhoto]= useState(null);
  const [recruiterPreview,setRecruiterPreview] = useState(null);
  const [companyLogo,   setCompanyLogo]   = useState(null);
  const [logoPreview,   setLogoPreview]   = useState(null);
  const [companyImages, setCompanyImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', designation: '', bio: '',
    companyName: '', companyBio: '', industry: '',
    companySize: '', founded: '', headquarters: '', website: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCompanyImages = (e) => {
    const files = Array.from(e.target.files);
    setCompanyImages(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeCompanyImage = (i) => {
    setCompanyImages((prev) => prev.filter((_, idx) => idx !== i));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const formData = new FormData();
      const { confirmPassword, ...rest } = form;
      Object.entries(rest).forEach(([k, v]) => formData.append(k, v));
      if (recruiterPhoto)         formData.append('recruiterPhoto', recruiterPhoto);
      if (companyLogo)            formData.append('companyLogo', companyLogo);
      companyImages.forEach((img) => formData.append('companyImages', img));

      await API.post('/recruiter/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('✅ Registration successful! Please login.');
      navigate('/recruiter/login');

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
          <h2 style={styles.title}>🏢 Recruiter Registration</h2>
          <p style={styles.subtitle}>Setup your company profile and start hiring</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Recruiter Photo ── */}
          <p className="section-head">Your Photo</p>
          <div style={styles.photoRow}>
            <div style={styles.photoPreview}>
              {recruiterPreview
                ? <img src={recruiterPreview} alt="" style={styles.previewImg} />
                : <FaUpload size={20} color="#9ca3af" />
              }
            </div>
            <label style={styles.uploadBtn}>
              Upload Your Photo
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => {
                  setRecruiterPhoto(e.target.files[0]);
                  setRecruiterPreview(URL.createObjectURL(e.target.files[0]));
                }} />
            </label>
          </div>

          {/* ── Basic Info ── */}
          <p className="section-head">Personal Information</p>
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Priya Sharma" required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="priya@company.com" required />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input name="password" type="password" value={form.password}
                onChange={handleChange} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword}
                onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="9876543210" />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input name="designation" value={form.designation}
                onChange={handleChange} placeholder="HR Manager" />
            </div>
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange}
              placeholder="Tell candidates about yourself..." rows={2}
              style={{ resize: 'vertical' }} />
          </div>

          {/* ── Company Info ── */}
          <p className="section-head">Company Information</p>

          {/* Company Logo */}
          <div style={styles.logoRow}>
            <div style={styles.logoPreview}>
              {logoPreview
                ? <img src={logoPreview} alt="" style={styles.previewImg} />
                : <FaBuilding size={24} color="#9ca3af" />
              }
            </div>
            <div>
              <label style={styles.uploadBtn}>
                Upload Company Logo
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => {
                    setCompanyLogo(e.target.files[0]);
                    setLogoPreview(URL.createObjectURL(e.target.files[0]));
                  }} />
              </label>
              <p style={styles.hint}>Recommended: Square image, min 200x200px</p>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Company Name *</label>
              <input name="companyName" value={form.companyName}
                onChange={handleChange} placeholder="TechCorp Solutions" required />
            </div>
            <div className="form-group">
              <label>Industry</label>
              <select name="industry" value={form.industry} onChange={handleChange}>
                <option value="">Select Industry</option>
                {['Information Technology','Finance','Healthcare','Education',
                  'E-commerce','Manufacturing','Media','Consulting','Other'].map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Company Size</label>
              <select name="companySize" value={form.companySize} onChange={handleChange}>
                <option value="">Select Size</option>
                {['1-10','11-50','51-200','201-500','501-1000','1000+'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Founded Year</label>
              <input name="founded" value={form.founded} onChange={handleChange}
                placeholder="2015" />
            </div>
            <div className="form-group">
              <label>Headquarters</label>
              <input name="headquarters" value={form.headquarters}
                onChange={handleChange} placeholder="Bengaluru, Karnataka" />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input name="website" value={form.website} onChange={handleChange}
                placeholder="https://company.com" />
            </div>
          </div>
          <div className="form-group">
            <label>Company Bio</label>
            <textarea name="companyBio" value={form.companyBio}
              onChange={handleChange}
              placeholder="Tell candidates about your company culture, mission..."
              rows={3} style={{ resize: 'vertical' }} />
          </div>

          {/* ── Company Images ── */}
          <p className="section-head">Company Photos (Office, Team, etc.)</p>
          <label style={styles.uploadBtn}>
            Upload Photos (Max 5)
            <input type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={handleCompanyImages} />
          </label>
          {imagePreviews.length > 0 && (
            <div style={styles.imageGrid}>
              {imagePreviews.map((src, i) => (
                <div key={i} style={styles.imageItem}>
                  <img src={src} alt="" style={styles.companyImg} />
                  <button type="button" onClick={() => removeCompanyImage(i)}
                    style={styles.removeImg}>
                    <FaTimes size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="btn-primary"
            disabled={loading} style={{ marginTop: 24 }}>
            {loading ? 'Creating Account...' : 'Create Recruiter Account →'}
          </button>

          <p style={styles.loginLink}>
            Already have an account?{' '}
            <Link to="/recruiter/login" style={{ color: '#6366f1', fontWeight: 600 }}>Login here</Link>
          </p>
          <p style={{ ...styles.loginLink, marginTop: 8 }}>
            Looking for a job?{' '}
            <Link to="/candidate/register" style={{ color: '#8b5cf6', fontWeight: 600 }}>Register as Candidate</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrap:        { padding: '40px 20px', maxWidth: 800, margin: '0 auto' },
  card:        { background: '#fff', borderRadius: 16, padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  cardHeader:  { marginBottom: 28 },
  title:       { fontSize: '1.8rem', fontWeight: 800, color: '#111827' },
  subtitle:    { color: '#6b7280', marginTop: 6 },
  photoRow:    { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 14, background: '#f9fafb', borderRadius: 10 },
  photoPreview:{ width: 72, height: 72, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '2px solid #c4b5fd' },
  logoRow:     { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 14, background: '#f9fafb', borderRadius: 10 },
  logoPreview: { width: 72, height: 72, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '2px solid #c4b5fd' },
  previewImg:  { width: '100%', height: '100%', objectFit: 'cover' },
  uploadBtn:   { display: 'inline-block', background: '#6366f1', color: '#fff', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' },
  hint:        { fontSize: '0.78rem', color: '#9ca3af', marginTop: 4 },
  imageGrid:   { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 },
  imageItem:   { position: 'relative' },
  companyImg:  { width: 90, height: 70, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' },
  removeImg:   { position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loginLink:   { textAlign: 'center', marginTop: 16, fontSize: '0.9rem', color: '#6b7280' },
};

export default RecruiterRegister;