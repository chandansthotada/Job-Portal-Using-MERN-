import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader      from '../../components/Loader';
import toast       from 'react-hot-toast';
import { FaUpload, FaBuilding, FaTimes } from 'react-icons/fa';

const EditRecruiterProfile = () => {
  const { id }      = useParams();
  const { recruiter, updateRecruiterContext } = useAuth();
  const navigate    = useNavigate();

  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [recruiterPhoto,  setRecruiterPhoto]  = useState(null);
  const [recruiterPreview,setRecruiterPreview]= useState(null);
  const [companyLogo,     setCompanyLogo]     = useState(null);
  const [logoPreview,     setLogoPreview]     = useState(null);
  const [newImages,       setNewImages]       = useState([]);
  const [newImagePreviews,setNewImagePreviews]= useState([]);
  const [existingImages,  setExistingImages]  = useState([]);
  const [activeTab,       setActiveTab]       = useState('personal');

  const [form, setForm] = useState({
    name:        '',
    phone:       '',
    designation: '',
    bio:         '',
    companyName: '',
    companyBio:  '',
    industry:    '',
    companySize: '',
    founded:     '',
    headquarters:'',
    website:     '',
    socialLinks: { linkedin: '', twitter: '', facebook: '' },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get(`/recruiter/profile/${id}`);
        const r = data.recruiter;
        setForm({
          name:         r.name         || '',
          phone:        r.phone        || '',
          designation:  r.designation  || '',
          bio:          r.bio          || '',
          companyName:  r.companyName  || '',
          companyBio:   r.companyBio   || '',
          industry:     r.industry     || '',
          companySize:  r.companySize  || '',
          founded:      r.founded      || '',
          headquarters: r.headquarters || '',
          website:      r.website      || '',
          socialLinks:  r.socialLinks  || { linkedin: '', twitter: '', facebook: '' },
        });
        setRecruiterPreview(r.recruiterPhoto ? `http://localhost:5000/${r.recruiterPhoto}` : null);
        setLogoPreview(r.companyLogo ? `http://localhost:5000/${r.companyLogo}` : null);
        setExistingImages(r.companyImages || []);
      } catch (err) {
        toast.error('Failed to load profile');
        navigate('/recruiter/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSocialChange = (e) =>
    setForm({ ...form, socialLinks: { ...form.socialLinks, [e.target.name]: e.target.value } });

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    setNewImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeNewImage = (i) => {
    setNewImages((prev) => prev.filter((_, idx) => idx !== i));
    setNewImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const removeExistingImage = async (index) => {
    if (!window.confirm('Remove this company photo?')) return;
    try {
      await API.delete(`/recruiter/profile/${id}/image/${index}`);
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      toast.success('Image removed');
    } catch (err) {
      toast.error('Failed to remove image');
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.companyName) {
      return toast.error('Name and Company Name are required');
    }
    setSaving(true);
    try {
      const formData = new FormData();
      const { socialLinks, ...rest } = form;
      Object.entries(rest).forEach(([k, v]) => formData.append(k, v));
      formData.append('socialLinks', JSON.stringify(socialLinks));
      if (recruiterPhoto) formData.append('recruiterPhoto', recruiterPhoto);
      if (companyLogo)    formData.append('companyLogo',    companyLogo);
      newImages.forEach((img) => formData.append('companyImages', img));

      const { data } = await API.put(`/recruiter/profile/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateRecruiterContext({ ...recruiter, ...data.recruiter });
      toast.success('✅ Profile updated!');
      navigate(`/recruiter/profile/${id}`);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const tabs = ['personal', 'company', 'photos', 'social'];

  return (
    <div style={styles.wrap}>

      {/* ── Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>✏️ Edit Recruiter Profile</h2>
          <p style={styles.subtitle}>Update your personal and company information</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate(-1)} style={styles.btnCancel}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={styles.btnSave}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={styles.tabs}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.card}>

        {/* ══ PERSONAL ══ */}
        {activeTab === 'personal' && (
          <div>
            <p className="section-head">Your Photo</p>
            <div style={styles.photoRow}>
              <div style={styles.photoPreview}>
                {recruiterPreview
                  ? <img src={recruiterPreview} alt="" style={styles.previewImg} />
                  : <FaUpload size={22} color="#9ca3af" />
                }
              </div>
              <div>
                <label style={styles.uploadBtn}>
                  Change Photo
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={(e) => {
                      setRecruiterPhoto(e.target.files[0]);
                      setRecruiterPreview(URL.createObjectURL(e.target.files[0]));
                    }} />
                </label>
                <p style={styles.hint}>JPG, PNG — Max 5MB</p>
              </div>
            </div>

            <p className="section-head">Personal Information</p>
            <div className="grid-2">
              <div className="form-group">
                <label>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  placeholder="9876543210" />
              </div>
              <div className="form-group">
                <label>Designation</label>
                <input name="designation" value={form.designation} onChange={handleChange}
                  placeholder="e.g. HR Manager" />
              </div>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange}
                placeholder="Tell candidates about yourself..." rows={4}
                style={{ resize: 'vertical' }} />
            </div>
          </div>
        )}

        {/* ══ COMPANY ══ */}
        {activeTab === 'company' && (
          <div>
            {/* Company Logo */}
            <p className="section-head">Company Logo</p>
            <div style={styles.logoRow}>
              <div style={styles.logoPreview}>
                {logoPreview
                  ? <img src={logoPreview} alt="" style={styles.previewImg} />
                  : <FaBuilding size={26} color="#9ca3af" />
                }
              </div>
              <div>
                <label style={styles.uploadBtn}>
                  Change Logo
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={(e) => {
                      setCompanyLogo(e.target.files[0]);
                      setLogoPreview(URL.createObjectURL(e.target.files[0]));
                    }} />
                </label>
                <p style={styles.hint}>Square image recommended</p>
              </div>
            </div>

            <p className="section-head">Company Information</p>
            <div className="grid-2">
              <div className="form-group">
                <label>Company Name *</label>
                <input name="companyName" value={form.companyName} onChange={handleChange}
                  placeholder="TechCorp Solutions" required />
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
                <input name="headquarters" value={form.headquarters} onChange={handleChange}
                  placeholder="Bengaluru, Karnataka" />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input name="website" value={form.website} onChange={handleChange}
                  placeholder="https://company.com" />
              </div>
            </div>
            <div className="form-group">
              <label>Company Bio</label>
              <textarea name="companyBio" value={form.companyBio} onChange={handleChange}
                placeholder="Describe your company culture, mission and vision..."
                rows={4} style={{ resize: 'vertical' }} />
            </div>
          </div>
        )}

        {/* ══ PHOTOS ══ */}
        {activeTab === 'photos' && (
          <div>
            <p className="section-head">Existing Company Photos</p>
            {existingImages.length === 0 ? (
              <p style={{ color: '#9ca3af', marginBottom: 16 }}>No existing photos.</p>
            ) : (
              <div style={styles.imageGrid}>
                {existingImages.map((img, i) => (
                  <div key={i} style={styles.imageItem}>
                    <img src={`http://localhost:5000/${img}`}
                      alt={`Company ${i + 1}`} style={styles.companyImg} />
                    <button type="button" onClick={() => removeExistingImage(i)}
                      style={styles.removeImgBtn} title="Remove">
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="section-head">Add New Company Photos</p>
            <label style={styles.uploadBtn}>
              Upload Photos (Max 5)
              <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={handleNewImages} />
            </label>
            {newImagePreviews.length > 0 && (
              <div style={{ ...styles.imageGrid, marginTop: 12 }}>
                {newImagePreviews.map((src, i) => (
                  <div key={i} style={styles.imageItem}>
                    <img src={src} alt={`New ${i + 1}`} style={styles.companyImg} />
                    <button type="button" onClick={() => removeNewImage(i)}
                      style={styles.removeImgBtn}>
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: 8 }}>
              New photos will be added to existing ones when you save.
            </p>
          </div>
        )}

        {/* ══ SOCIAL ══ */}
        {activeTab === 'social' && (
          <div>
            <p className="section-head">Social Media Links</p>
            <div className="grid-2">
              {[
                ['linkedin', 'LinkedIn Company Page'],
                ['twitter',  'Twitter / X'],
                ['facebook', 'Facebook Page'],
              ].map(([name, label]) => (
                <div key={name} className="form-group">
                  <label>{label}</label>
                  <input name={name} value={form.socialLinks[name] || ''}
                    onChange={handleSocialChange} placeholder="https://..." />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Bottom Save ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, gap: 10 }}>
        <button onClick={() => navigate(-1)} style={styles.btnCancel}>Cancel</button>
        <button onClick={handleSave} disabled={saving} style={styles.btnSave}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrap:            { maxWidth: 860, margin: '0 auto', padding: '32px 20px' },
  pageHeader:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title:           { fontSize: '1.6rem', fontWeight: 800, color: '#111827' },
  subtitle:        { color: '#6b7280', marginTop: 4, fontSize: '0.92rem' },
  btnSave:         { background: '#6366f1', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem' },
  btnCancel:       { background: '#f3f4f6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  tabs:            { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 },
  tab:             { padding: '8px 18px', borderRadius: 20, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#374151' },
  tabActive:       { background: '#6366f1', color: '#fff', border: '1px solid #6366f1' },
  card:            { background: '#fff', borderRadius: 16, padding: '28px 32px', boxShadow: '0 2px 14px rgba(0,0,0,0.07)' },
  photoRow:        { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 14, background: '#f9fafb', borderRadius: 10 },
  logoRow:         { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 14, background: '#f9fafb', borderRadius: 10 },
  photoPreview:    { width: 72, height: 72, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '2px solid #c4b5fd' },
  logoPreview:     { width: 72, height: 72, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '2px solid #c4b5fd' },
  previewImg:      { width: '100%', height: '100%', objectFit: 'cover' },
  uploadBtn:       { display: 'inline-block', background: '#6366f1', color: '#fff', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' },
  hint:            { fontSize: '0.75rem', color: '#9ca3af', marginTop: 5 },
  imageGrid:       { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 },
  imageItem:       { position: 'relative' },
  companyImg:      { width: 110, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb', display: 'block' },
  removeImgBtn:    { position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export default EditRecruiterProfile;