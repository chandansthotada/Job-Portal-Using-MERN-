import { useEffect, useState } from 'react';
import { useSearchParams }     from 'react-router-dom';
import API      from '../../api/axios';
import JobCard  from '../../components/JobCard';
import Loader   from '../../components/Loader';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const JobSearch = () => {
  const [searchParams]        = useSearchParams();
  const [jobs,     setJobs]   = useState([]);
  const [loading,  setLoading]= useState(true);
  const [total,    setTotal]  = useState(0);
  const [page,     setPage]   = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    search:    searchParams.get('search') || '',
    location:  '',
    jobType:   '',
    skills:    '',
    salaryMin: '',
    salaryMax: '',
    isRemote:  '',
    sortBy:    'createdAt',
  });

  const fetchJobs = async (pg = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page: pg, limit: 9 };
      // Remove empty filters
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await API.get('/jobs', { params });
      setJobs(data.jobs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(pg);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(1); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', location: '', jobType: '', skills: '', salaryMin: '', salaryMax: '', isRemote: '', sortBy: 'createdAt' });
  };

  return (
    <div className="page-wrap">

      {/* ── Search Bar ── */}
      <div style={styles.searchSection}>
        <h2 style={styles.pageTitle}>Find Your Perfect Job</h2>
        <form onSubmit={handleSearch} style={styles.searchBar}>
          <FaSearch color="#9ca3af" style={{ marginLeft: 16, flexShrink: 0 }} />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search by job title, skills, company..."
            style={styles.searchInput}
          />
          <select value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            style={styles.sortSelect}>
            <option value="createdAt">Latest</option>
            <option value="salary">Highest Salary</option>
            <option value="views">Most Viewed</option>
          </select>
          <button type="submit" style={styles.searchBtn}>Search</button>
          <button type="button" onClick={() => setShowFilter(!showFilter)}
            style={styles.filterToggle}>
            <FaFilter size={14} />
          </button>
        </form>

        {/* ── Filters Panel ── */}
        {showFilter && (
          <div style={styles.filtersPanel}>
            <div style={styles.filtersGrid}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Location</label>
                <input value={filters.location} placeholder="e.g. Bengaluru"
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Job Type</label>
                <select value={filters.jobType}
                  onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}>
                  <option value="">All Types</option>
                  {['Full-time','Part-time','Remote','Internship','Contract'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Skills</label>
                <input value={filters.skills} placeholder="e.g. React,Node.js"
                  onChange={(e) => setFilters({ ...filters, skills: e.target.value })} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Min Salary (LPA)</label>
                <input type="number" value={filters.salaryMin} placeholder="e.g. 500000"
                  onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Max Salary (LPA)</label>
                <input type="number" value={filters.salaryMax} placeholder="e.g. 2000000"
                  onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Remote Only</label>
                <select value={filters.isRemote}
                  onChange={(e) => setFilters({ ...filters, isRemote: e.target.value })}>
                  <option value="">All</option>
                  <option value="true">Remote Only</option>
                  <option value="false">On-site Only</option>
                </select>
              </div>
            </div>
            <div style={styles.filterActions}>
              <button onClick={() => fetchJobs(1)} style={styles.applyBtn}>Apply Filters</button>
              <button onClick={clearFilters} style={styles.clearBtn}>
                <FaTimes size={12} style={{ marginRight: 4 }} /> Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Results ── */}
      <div style={styles.resultsHeader}>
        <p style={styles.resultsCount}>
          {loading ? 'Searching...' : `${total} jobs found`}
        </p>
      </div>

      {loading ? <Loader text="Finding jobs..." /> : (
        <>
          {jobs.length === 0 ? (
            <div style={styles.empty}>
              <FaSearch size={40} color="#d1d5db" />
              <h3>No jobs found</h3>
              <p>Try different keywords or clear filters</p>
              <button onClick={clearFilters} className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={styles.jobsGrid}>
              {jobs.map((job) => <JobCard key={job._id} job={job} />)}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button onClick={() => fetchJobs(page - 1)} disabled={page === 1}
                style={styles.pageBtn}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => fetchJobs(p)}
                  style={{ ...styles.pageBtn, ...(page === p ? styles.pageBtnActive : {}) }}>
                  {p}
                </button>
              ))}
              <button onClick={() => fetchJobs(page + 1)} disabled={page >= totalPages}
                style={styles.pageBtn}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  searchSection:  { background: '#fff', borderRadius: 16, padding: '28px', marginBottom: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  pageTitle:      { fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: 16 },
  searchBar:      { display: 'flex', alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', gap: 0 },
  searchInput:    { flex: 1, border: 'none', outline: 'none', padding: '12px 14px', fontSize: '0.92rem' },
  sortSelect:     { border: 'none', borderLeft: '1px solid #e5e7eb', padding: '12px 10px', fontSize: '0.85rem', outline: 'none', color: '#374151', background: '#f9fafb' },
  searchBtn:      { background: '#6366f1', color: '#fff', border: 'none', padding: '12px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem' },
  filterToggle:   { background: '#f3f4f6', border: 'none', padding: '12px 14px', cursor: 'pointer', color: '#6b7280', borderLeft: '1px solid #e5e7eb' },
  filtersPanel:   { background: '#f9fafb', borderRadius: 10, padding: '20px', marginTop: 16, border: '1px solid #e5e7eb' },
  filtersGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0 20px' },
  filterActions:  { display: 'flex', gap: 10, marginTop: 12 },
  applyBtn:       { background: '#6366f1', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' },
  clearBtn:       { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center' },
  resultsHeader:  { marginBottom: 16 },
  resultsCount:   { color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 },
  jobsGrid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 20 },
  empty:          { textAlign: 'center', padding: '60px 20px', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  pagination:     { display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32, flexWrap: 'wrap' },
  pageBtn:        { background: '#fff', border: '1px solid #e5e7eb', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#374151' },
  pageBtnActive:  { background: '#6366f1', color: '#fff', border: '1px solid #6366f1' },
};

export default JobSearch;