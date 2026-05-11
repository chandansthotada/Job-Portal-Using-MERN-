import { useEffect, useState } from 'react';
import API         from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader      from '../../components/Loader';
import JobCard     from '../../components/JobCard';
import { Link }    from 'react-router-dom';
import { FaBookmark } from 'react-icons/fa';

const Bookmarks = () => {
  const { candidate, updateCandidateContext } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/candidate/bookmarks/${candidate._id}`);
        setBookmarks(data.bookmarks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleBookmarkToggle = (jobId, isBookmarked) => {
    if (!isBookmarked) {
      setBookmarks((prev) => prev.filter((j) => j._id !== jobId));
      // Update context
      const updatedSaved = candidate.savedJobs?.filter((id) => id !== jobId);
      updateCandidateContext({ ...candidate, savedJobs: updatedSaved });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-wrap">
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>🔖 Saved Jobs</h2>
          <p style={styles.subtitle}>{bookmarks.length} jobs saved</p>
        </div>
        <Link to="/jobs" style={styles.btnBrowse}>Browse More Jobs →</Link>
      </div>

      {bookmarks.length === 0 ? (
        <div style={styles.empty}>
          <FaBookmark size={44} color="#d1d5db" />
          <h3 style={{ color: '#374151' }}>No saved jobs yet</h3>
          <p style={{ color: '#9ca3af' }}>Bookmark jobs you're interested in to find them easily later</p>
          <Link to="/jobs" style={styles.btnApply}>Browse Jobs →</Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {bookmarks.map((job) => (
            <JobCard key={job._id} job={job} onBookmarkToggle={handleBookmarkToggle} />
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 },
  title:      { fontSize: '1.8rem', fontWeight: 800, color: '#111827' },
  subtitle:   { color: '#6b7280', marginTop: 4 },
  btnBrowse:  { background: '#6366f1', color: '#fff', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: '0.88rem' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 20 },
  empty:      { textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 },
  btnApply:   { background: '#6366f1', color: '#fff', padding: '11px 28px', borderRadius: 8, fontWeight: 700 },
};

export default Bookmarks;