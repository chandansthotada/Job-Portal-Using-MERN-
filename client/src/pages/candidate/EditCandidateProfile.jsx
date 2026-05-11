import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader      from '../../components/Loader';
import toast       from 'react-hot-toast';
import { FaPlus, FaTrash, FaTimes, FaUpload } from 'react-icons/fa';

const EditCandidateProfile = () => {
  const { id }     = useParams();
  const { candidate, updateCandidateContext } = useAuth();
  const navigate   = useNavigate();

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [photo,    setPhoto]    = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [activeTab, setActiveTab]   = useState('basic');

  const [form, setForm] = useState({
    name: '', phone: '', dob: '', gender: '', headline: '', bio: '',
    location: '', portfolio: '', jobType: '', expectedSalary: '',
    noticePeriod: '', totalExperience: '', isOpen: true,
    skills: [], preferredRoles: [], preferredLocations: [],
    socialLinks: { linkedin: '', github: '', twitter: '', website: '' },
    education: [], experience: [], certifications: [], projects: [], achievements: [],
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/candidate/profile/${id}`);
        const c = data.candidate;
        setForm({
          name: c.name || '', phone: c.phone || '', dob: c.dob?.split('T')[0] || '',
          gender: c.gender || '', headline: c.headline || '', bio: c.bio || '',
          location: c.location || '', portfolio: c.portfolio || '',
          jobType: c.jobType || '', expectedSalary: c.expectedSalary || '',
          noticePeriod: c.noticePeriod || '', totalExperience: c.totalExperience || '',
          isOpen: c.isOpen ?? true,
          skills: c.skills || [],
          preferredRoles: c.preferredRoles || [],
          preferredLocations: c.preferredLocations || [],
          socialLinks: c.socialLinks || { linkedin: '', github: '', twitter: '', website: '' },
          education: c.education || [],
          experience: c.experience || [],
          certifications: c.certifications || [],
          projects: c.projects || [],
          achievements: c.achievements || [],
        });
        setPreview(c.profilePhoto ? `http://localhost:5000/${c.profilePhoto}` : null);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSocialChange = (e) =>
    setForm({ ...form, socialLinks: { ...form.socialLinks, [e.target.name]: e.target.value } });

  // ── Skills ──
  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!form.skills.includes(skillInput.trim()))
        setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };
  const removeSkill = (s) => setForm({ ...form, skills: form.skills.filter((sk) => sk !== s) });

  // ── Dynamic Section Helpers ──
  const addItem    = (section, template) => setForm({ ...form, [section]: [...form[section], template] });
  const removeItem = (section, i) => setForm({ ...form, [section]: form[section].filter((_, idx) => idx !== i) });
  const updateItem = (section, i, field, value) => {
    const updated = [...form[section]];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, [section]: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      const { skills, preferredRoles, preferredLocations, socialLinks,
        education, experience, certifications, projects, achievements, ...rest } = form;

      Object.entries(rest).forEach(([k, v]) => formData.append(k, v));
      formData.append('skills',              JSON.stringify(skills));
      formData.append('preferredRoles',      JSON.stringify(preferredRoles));
      formData.append('preferredLocations',  JSON.stringify(preferredLocations));
      formData.append('socialLinks',         JSON.stringify(socialLinks));
      formData.append('education',           JSON.stringify(education));
      formData.append('experience',          JSON.stringify(experience));
      formData.append('certifications',      JSON.stringify(certifications));
      formData.append('projects',            JSON.stringify(projects));
      formData.append('achievements',        JSON.stringify(achievements));
      if (photo) formData.append('profilePhoto', photo);

      const { data } = await API.put(`/candidate/profile/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateCandidateContext({ ...candidate, ...data.candidate });
      toast.success('✅ Profile updated!');
      navigate(`/candidate/profile/${id}`);

    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const tabs = ['basic', 'experience', 'education', 'skills', 'projects', 'achievements', 'social'];

  return (
    <div style={styles.wrap}>
      <div style={styles.pageHeader}>
        <h2 style={styles.title}>✏️ Edit Profile</h2>
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

        {/* ══ BASIC ══ */}
        {activeTab === 'basic' && (
          <div>
            {/* Photo */}
            <div style={styles.photoRow}>
              <div style={styles.photoPreview}>
                {preview
                  ? <img src={preview} alt="" style={styles.previewImg} />
                  : <FaUpload size={24} color="#9ca3af" />
                }
              </div>
              <label style={styles.uploadBtn}>
                Change Photo
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => { setPhoto(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); }} />
              </label>
            </div>

            <div style={styles.openRow}>
              <label style={styles.toggleLabel}>
                <input type="checkbox" name="isOpen" checked={form.isOpen}
                  onChange={handleChange} style={{ width: 'auto', marginRight: 8 }} />
                Open to Work
              </label>
            </div>

            <div className="grid-2">
              {[['name','Full Name','text'],['phone','Phone','text'],['dob','Date of Birth','date'],['location','Location','text'],['expectedSalary','Expected Salary','text'],['noticePeriod','Notice Period','text'],['totalExperience','Total Experience','text'],['portfolio','Portfolio URL','text']].map(([name, label, type]) => (
                <div key={name} className="form-group">
                  <label>{label}</label>
                  <input name={name} type={type} value={form[name]} onChange={handleChange} />
                </div>
              ))}
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Job Type</label>
                <select name="jobType" value={form.jobType} onChange={handleChange}>
                  <option value="">Select</option>
                  {['Full-time','Part-time','Remote','Internship','Contract'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Headline</label>
              <input name="headline" value={form.headline} onChange={handleChange}
                placeholder="e.g. Full Stack Developer | 3 years experience" />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} style={{ resize: 'vertical' }} />
            </div>
          </div>
        )}

        {/* ══ EXPERIENCE ══ */}
        {activeTab === 'experience' && (
          <div>
            {form.experience.map((exp, i) => (
              <div key={i} style={styles.itemCard}>
                <div style={styles.itemCardHeader}>
                  <h4 style={styles.itemCardTitle}>Experience {i + 1}</h4>
                  <button onClick={() => removeItem('experience', i)} style={styles.removeBtn}>
                    <FaTrash size={12} /> Remove
                  </button>
                </div>
                <div className="grid-2">
                  {[['title','Job Title'],['company','Company'],['location','Location']].map(([f, l]) => (
                    <div key={f} className="form-group">
                      <label>{l}</label>
                      <input value={exp[f] || ''} onChange={(e) => updateItem('experience', i, f, e.target.value)} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="month" value={exp.startDate || ''} onChange={(e) => updateItem('experience', i, 'startDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input type="month" value={exp.endDate || ''} disabled={exp.current}
                      onChange={(e) => updateItem('experience', i, 'endDate', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 24 }}>
                    <input type="checkbox" checked={exp.current || false} style={{ width: 'auto' }}
                      onChange={(e) => updateItem('experience', i, 'current', e.target.checked)} />
                    <label style={{ margin: 0 }}>Currently working here</label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={exp.description || ''} rows={3} style={{ resize: 'vertical' }}
                    onChange={(e) => updateItem('experience', i, 'description', e.target.value)} />
                </div>
              </div>
            ))}
            <button onClick={() => addItem('experience', { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' })}
              style={styles.addBtn}>
              <FaPlus style={{ marginRight: 6 }} /> Add Experience
            </button>
          </div>
        )}

        {/* ══ EDUCATION ══ */}
        {activeTab === 'education' && (
          <div>
            {form.education.map((edu, i) => (
              <div key={i} style={styles.itemCard}>
                <div style={styles.itemCardHeader}>
                  <h4 style={styles.itemCardTitle}>Education {i + 1}</h4>
                  <button onClick={() => removeItem('education', i)} style={styles.removeBtn}>
                    <FaTrash size={12} /> Remove
                  </button>
                </div>
                <div className="grid-2">
                  {[['degree','Degree'],['institution','Institution'],['field','Field of Study'],['startYear','Start Year'],['endYear','End Year'],['grade','Grade/CGPA']].map(([f, l]) => (
                    <div key={f} className="form-group">
                      <label>{l}</label>
                      <input value={edu[f] || ''} onChange={(e) => updateItem('education', i, f, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => addItem('education', { degree: '', institution: '', field: '', startYear: '', endYear: '', grade: '' })}
              style={styles.addBtn}>
              <FaPlus style={{ marginRight: 6 }} /> Add Education
            </button>
          </div>
        )}

        {/* ══ SKILLS ══ */}
        {activeTab === 'skills' && (
          <div>
            <div className="form-group">
              <label>Skills (Press Enter to add)</label>
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill} placeholder="Type a skill and press Enter..." />
              <div className="tag-wrap" style={{ marginTop: 10 }}>
                {form.skills.map((s) => (
                  <span key={s} className="tag-item">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)}><FaTimes size={10} /></button>
                  </span>
                ))}
              </div>
            </div>

            <p className="section-head">Certifications</p>
            {form.certifications.map((cert, i) => (
              <div key={i} style={styles.itemCard}>
                <div style={styles.itemCardHeader}>
                  <h4 style={styles.itemCardTitle}>Certification {i + 1}</h4>
                  <button onClick={() => removeItem('certifications', i)} style={styles.removeBtn}>
                    <FaTrash size={12} /> Remove
                  </button>
                </div>
                <div className="grid-2">
                  {[['name','Certificate Name'],['issuer','Issuing Organization'],['issueDate','Issue Date'],['expiryDate','Expiry Date'],['credentialId','Credential ID']].map(([f, l]) => (
                    <div key={f} className="form-group">
                      <label>{l}</label>
                      <input value={cert[f] || ''} onChange={(e) => updateItem('certifications', i, f, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => addItem('certifications', { name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '' })}
              style={styles.addBtn}>
              <FaPlus style={{ marginRight: 6 }} /> Add Certification
            </button>
          </div>
        )}

        {/* ══ PROJECTS ══ */}
        {activeTab === 'projects' && (
          <div>
            {form.projects.map((proj, i) => (
              <div key={i} style={styles.itemCard}>
                <div style={styles.itemCardHeader}>
                  <h4 style={styles.itemCardTitle}>Project {i + 1}</h4>
                  <button onClick={() => removeItem('projects', i)} style={styles.removeBtn}>
                    <FaTrash size={12} /> Remove
                  </button>
                </div>
                <div className="form-group">
                  <label>Project Title</label>
                  <input value={proj.title || ''} onChange={(e) => updateItem('projects', i, 'title', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={proj.description || ''} rows={3} style={{ resize: 'vertical' }}
                    onChange={(e) => updateItem('projects', i, 'description', e.target.value)} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Live Link</label>
                    <input value={proj.link || ''} placeholder="https://..."
                      onChange={(e) => updateItem('projects', i, 'link', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>GitHub Link</label>
                    <input value={proj.github || ''} placeholder="https://github.com/..."
                      onChange={(e) => updateItem('projects', i, 'github', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => addItem('projects', { title: '', description: '', techStack: [], link: '', github: '' })}
              style={styles.addBtn}>
              <FaPlus style={{ marginRight: 6 }} /> Add Project
            </button>
          </div>
        )}

        {/* ══ ACHIEVEMENTS ══ */}
        {activeTab === 'achievements' && (
          <div>
            {form.achievements.map((ach, i) => (
              <div key={i} style={styles.itemCard}>
                <div style={styles.itemCardHeader}>
                  <h4 style={styles.itemCardTitle}>Achievement {i + 1}</h4>
                  <button onClick={() => removeItem('achievements', i)} style={styles.removeBtn}>
                    <FaTrash size={12} /> Remove
                  </button>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input value={ach.title || ''} onChange={(e) => updateItem('achievements', i, 'title', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={ach.description || ''} rows={3} style={{ resize: 'vertical' }}
                    onChange={(e) => updateItem('achievements', i, 'description', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="month" value={ach.date || ''}
                    onChange={(e) => updateItem('achievements', i, 'date', e.target.value)} />
                </div>
              </div>
            ))}
            <button onClick={() => addItem('achievements', { title: '', description: '', date: '' })}
              style={styles.addBtn}>
              <FaPlus style={{ marginRight: 6 }} /> Add Achievement
            </button>
          </div>
        )}

        {/* ══ SOCIAL ══ */}
        {activeTab === 'social' && (
          <div>
            <p className="section-head">Social Links</p>
            <div className="grid-2">
              {[['linkedin','LinkedIn URL'],['github','GitHub URL'],['twitter','Twitter URL'],['website','Personal Website']].map(([name, label]) => (
                <div key={name} className="form-group">
                  <label>{label}</label>
                  <input name={name} value={form.socialLinks[name] || ''}
                    onChange={handleSocialChange} placeholder={`https://...`} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Save Button Bottom */}
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
  pageHeader:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title:           { fontSize: '1.6rem', fontWeight: 800, color: '#111827' },
  btnSave:         { background: '#6366f1', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem' },
  btnCancel:       { background: '#f3f4f6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  tabs:            { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 },
  tab:             { padding: '8px 16px', borderRadius: 20, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#374151' },
  tabActive:       { background: '#6366f1', color: '#fff', border: '1px solid #6366f1' },
  card:            { background: '#fff', borderRadius: 16, padding: '28px 32px', boxShadow: '0 2px 14px rgba(0,0,0,0.07)' },
  photoRow:        { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 14, background: '#f9fafb', borderRadius: 10 },
  photoPreview:    { width: 72, height: 72, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '2px solid #c4b5fd' },
  previewImg:      { width: '100%', height: '100%', objectFit: 'cover' },
  uploadBtn:       { display: 'inline-block', background: '#6366f1', color: '#fff', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' },
  openRow:         { marginBottom: 20 },
  toggleLabel:     { display: 'flex', alignItems: 'center', fontWeight: 600, color: '#374151', cursor: 'pointer' },
  itemCard:        { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px', marginBottom: 16 },
  itemCardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  itemCardTitle:   { fontWeight: 700, color: '#6366f1' },
  removeBtn:       { display: 'flex', alignItems: 'center', gap: 5, background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  addBtn:          { display: 'flex', alignItems: 'center', background: '#ede9fe', color: '#6366f1', border: '2px dashed #c4b5fd', width: '100%', padding: '12px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, justifyContent: 'center', marginTop: 4 },
};

export default EditCandidateProfile;