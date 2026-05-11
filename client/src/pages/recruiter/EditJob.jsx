import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader      from '../../components/Loader';
import toast       from 'react-hot-toast';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';

const EditJob = () => {
  const { id }       = useParams();
  const { recruiter } = useAuth();
  const navigate      = useNavigate();

  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [perkInput,  setPerkInput]  = useState('');
  const [reqInput,   setReqInput]   = useState('');
  const [respInput,  setRespInput]  = useState('');

  const [form, setForm] = useState({
    title:            '',
    description:      '',
    location:         '',
    isRemote:         false,
    jobType:          '',
    experience:       '',
    salaryMin:        '',
    salaryMax:        '',
    isSalaryHidden:   false,
    vacancy:          1,
    deadline:         '',
    isActive:         true,
    skills:           [],
    responsibilities: [],
    requirements:     [],
    perks:            [],
    hiringProcess:    [],
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await API.get(`/jobs/${id}`);
        const job = data.job;

        // Verify ownership
        if (job.recruiter?._id !== recruiter._id && job.recruiter !== recruiter._id) {
          toast.error('Unauthorized');
          navigate('/recruiter/jobs');
          return;
        }

        setForm({
          title:            job.title            || '',
          description:      job.description      || '',
          location:         job.location         || '',
          isRemote:         job.isRemote         || false,
          jobType:          job.jobType          || '',
          experience:       job.experience       || '',
          salaryMin:        job.salary?.min      || '',
          salaryMax:        job.salary?.max      || '',
          isSalaryHidden:   job.salary?.isHidden || false,
          vacancy:          job.vacancy          || 1,
          deadline:         job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
          isActive:         job.isActive         ?? true,
          skills:           job.skills           || [],
          responsibilities: job.responsibilities || [],
          requirements:     job.requirements     || [],
          perks:            job.perks            || [],
          hiringProcess:    job.hiringProcess    || [],
        });
      } catch (err) {
        toast.error('Failed to load job');
        navigate('/recruiter/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  // ── Tag helpers ──
  const addTag = (field, value, setter) => {
    if (value.trim() && !form[field].includes(value.trim())) {
      setForm({ ...form, [field]: [...form[field], value.trim()] });
    }
    setter('');
  };
  const removeTag = (field, val) =>
    setForm({ ...form, [field]: form[field].filter((v) => v !== val) });

  // ── Hiring Process ──
  const addStep = () =>
    setForm({
      ...form,
      hiringProcess: [
        ...form.hiringProcess,
        { step: form.hiringProcess.length + 1, title: '', description: '' },
      ],
    });

  const updateStep = (i, field, value) => {
    const updated = [...form.hiringProcess];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, hiringProcess: updated });
  };

  const removeStep = (i) =>
    setForm({ ...form, hiringProcess: form.hiringProcess.filter((_, idx) => idx !== i) });

  const handleSave = async () => {
    if (!form.title || !form.description || !form.location || !form.jobType) {
      return toast.error('Please fill all required fields');
    }
    setSaving(true);
    try {
      await API.put(`/jobs/${id}`, {
        recruiterId:      recruiter._id,
        title:            form.title,
        description:      form.description,
        location:         form.location,
        isRemote:         String(form.isRemote),
        jobType:          form.jobType,
        experience:       form.experience,
        salaryMin:        form.salaryMin,
        salaryMax:        form.salaryMax,
        isSalaryHidden:   String(form.isSalaryHidden),
        vacancy:          form.vacancy,
        deadline:         form.deadline,
        isActive:         String(form.isActive),
        skills:           JSON.stringify(form.skills),
        responsibilities: JSON.stringify(form.responsibilities),
        requirements:     JSON.stringify(form.requirements),
        perks:            JSON.stringify(form.perks),
        hiringProcess:    JSON.stringify(form.hiringProcess),
      });
      toast.success('✅ Job updated successfully!');
      navigate('/recruiter/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>

        {/* ── Header ── */}
        <div style={styles.pageHeader}>
          <div>
            <h2 style={styles.title}>✏️ Edit Job</h2>
            <p style={styles.subtitle}>Update your job posting details</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate(-1)} style={styles.btnCancel}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={styles.btnSave}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>

        {/* ── Job Status ── */}
        <div style={styles.statusRow}>
          <label style={styles.checkLabel}>
            <input type="checkbox" name="isActive" checked={form.isActive}
              onChange={handleChange} style={{ width: 'auto', marginRight: 8 }} />
            Job is Active (visible to candidates)
          </label>
        </div>

        {/* ── Basic Info ── */}
        <p className="section-head">Job Details</p>
        <div className="form-group">
          <label>Job Title *</label>
          <input name="title" value={form.title} onChange={handleChange}
            placeholder="e.g. Senior React Developer" required />
        </div>
        <div className="form-group">
          <label>Job Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            placeholder="Describe the role..." rows={5} style={{ resize: 'vertical' }} required />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Location *</label>
            <input name="location" value={form.location} onChange={handleChange}
              placeholder="e.g. Bengaluru" required />
          </div>
          <div className="form-group">
            <label>Job Type *</label>
            <select name="jobType" value={form.jobType} onChange={handleChange} required>
              <option value="">Select Type</option>
              {['Full-time','Part-time','Remote','Internship','Contract'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Experience Required</label>
            <input name="experience" value={form.experience} onChange={handleChange}
              placeholder="e.g. 2-4 years" />
          </div>
          <div className="form-group">
            <label>Number of Vacancies</label>
            <input name="vacancy" type="number" min={1} value={form.vacancy}
              onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Application Deadline</label>
            <input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
          </div>
        </div>

        <div style={styles.checkRow}>
          <label style={styles.checkLabel}>
            <input type="checkbox" name="isRemote" checked={form.isRemote}
              onChange={handleChange} style={{ width: 'auto', marginRight: 8 }} />
            Remote Position
          </label>
        </div>

        {/* ── Salary ── */}
        <p className="section-head">Salary</p>
        <div style={styles.checkRow}>
          <label style={styles.checkLabel}>
            <input type="checkbox" name="isSalaryHidden" checked={form.isSalaryHidden}
              onChange={handleChange} style={{ width: 'auto', marginRight: 8 }} />
            Hide salary from candidates
          </label>
        </div>
        {!form.isSalaryHidden && (
          <div className="grid-2">
            <div className="form-group">
              <label>Min Salary (₹/year)</label>
              <input name="salaryMin" type="number" value={form.salaryMin}
                onChange={handleChange} placeholder="e.g. 800000" />
            </div>
            <div className="form-group">
              <label>Max Salary (₹/year)</label>
              <input name="salaryMax" type="number" value={form.salaryMax}
                onChange={handleChange} placeholder="e.g. 1500000" />
            </div>
          </div>
        )}

        {/* ── Skills ── */}
        <p className="section-head">Required Skills</p>
        <div className="form-group">
          <div style={styles.tagInputRow}>
            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('skills', skillInput, setSkillInput))}
              placeholder="Type skill and press Enter or click Add" />
            <button type="button" onClick={() => addTag('skills', skillInput, setSkillInput)}
              style={styles.addTagBtn}>Add</button>
          </div>
          <div className="tag-wrap">
            {form.skills.map((s) => (
              <span key={s} className="tag-item">
                {s}
                <button type="button" onClick={() => removeTag('skills', s)}>
                  <FaTimes size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* ── Responsibilities ── */}
        <p className="section-head">Responsibilities</p>
        <div className="form-group">
          <div style={styles.tagInputRow}>
            <input value={respInput} onChange={(e) => setRespInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('responsibilities', respInput, setRespInput))}
              placeholder="Add a responsibility and press Enter" />
            <button type="button" onClick={() => addTag('responsibilities', respInput, setRespInput)}
              style={styles.addTagBtn}>Add</button>
          </div>
          <div style={styles.listItems}>
            {form.responsibilities.map((r, i) => (
              <div key={i} style={styles.listItem}>
                <span>• {r}</span>
                <button type="button" onClick={() => removeTag('responsibilities', r)}
                  style={styles.removeListBtn}><FaTimes size={11} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Requirements ── */}
        <p className="section-head">Requirements</p>
        <div className="form-group">
          <div style={styles.tagInputRow}>
            <input value={reqInput} onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('requirements', reqInput, setReqInput))}
              placeholder="Add a requirement and press Enter" />
            <button type="button" onClick={() => addTag('requirements', reqInput, setReqInput)}
              style={styles.addTagBtn}>Add</button>
          </div>
          <div style={styles.listItems}>
            {form.requirements.map((r, i) => (
              <div key={i} style={styles.listItem}>
                <span>• {r}</span>
                <button type="button" onClick={() => removeTag('requirements', r)}
                  style={styles.removeListBtn}><FaTimes size={11} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Hiring Process ── */}
        <p className="section-head">Hiring Process</p>
        {form.hiringProcess.map((step, i) => (
          <div key={i} style={styles.stepCard}>
            <div style={styles.stepNum}>{step.step || i + 1}</div>
            <div style={{ flex: 1 }}>
              <div className="grid-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <input value={step.title || ''} placeholder="Step title (e.g. Resume Screening)"
                    onChange={(e) => updateStep(i, 'title', e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <input value={step.description || ''} placeholder="Brief description (optional)"
                    onChange={(e) => updateStep(i, 'description', e.target.value)} />
                </div>
              </div>
            </div>
            <button type="button" onClick={() => removeStep(i)} style={styles.removeStepBtn}>
              <FaTrash size={12} />
            </button>
          </div>
        ))}
        <button type="button" onClick={addStep} style={styles.addDashedBtn}>
          <FaPlus style={{ marginRight: 6 }} /> Add Hiring Step
        </button>

        {/* ── Perks ── */}
        <p className="section-head">Perks & Benefits</p>
        <div className="form-group">
          <div style={styles.tagInputRow}>
            <input value={perkInput} onChange={(e) => setPerkInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('perks', perkInput, setPerkInput))}
              placeholder="e.g. Health Insurance, Stock Options..." />
            <button type="button" onClick={() => addTag('perks', perkInput, setPerkInput)}
              style={styles.addTagBtn}>Add</button>
          </div>
          <div className="tag-wrap">
            {form.perks.map((p) => (
              <span key={p} className="tag-item">
                {p}
                <button type="button" onClick={() => removeTag('perks', p)}>
                  <FaTimes size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* ── Bottom Save ── */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button onClick={() => navigate(-1)} style={styles.btnCancel}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={styles.btnSave}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};

const styles = {
  wrap:          { maxWidth: 800, margin: '0 auto', padding: '40px 20px' },
  card:          { background: '#fff', borderRadius: 16, padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  pageHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title:         { fontSize: '1.8rem', fontWeight: 800, color: '#111827' },
  subtitle:      { color: '#6b7280', marginTop: 4, fontSize: '0.92rem' },
  btnSave:       { background: '#6366f1', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem' },
  btnCancel:     { background: '#f3f4f6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  statusRow:     { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px 16px', marginBottom: 20 },
  checkRow:      { marginBottom: 14 },
  checkLabel:    { display: 'flex', alignItems: 'center', fontWeight: 600, color: '#374151', cursor: 'pointer', fontSize: '0.9rem' },
  tagInputRow:   { display: 'flex', gap: 8 },
  addTagBtn:     { background: '#6366f1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', flexShrink: 0 },
  listItems:     { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 },
  listItem:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderRadius: 6, padding: '8px 12px', fontSize: '0.88rem', color: '#374151' },
  removeListBtn: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' },
  stepCard:      { display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', borderRadius: 10, padding: '14px', marginBottom: 10, border: '1px solid #e5e7eb' },
  stepNum:       { width: 32, height: 32, borderRadius: '50%', background: '#6366f1', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.88rem' },
  removeStepBtn: { background: '#fee2e2', color: '#dc2626', border: 'none', width: 30, height: 30, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  addDashedBtn:  { display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ff', color: '#6366f1', border: '2px dashed #c4b5fd', width: '100%', padding: '11px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, marginBottom: 4 },
};

export default EditJob;