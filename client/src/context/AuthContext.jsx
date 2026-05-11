import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [candidate,  setCandidate]  = useState(null);
  const [recruiter,  setRecruiter]  = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const storedCandidate = localStorage.getItem('candidate');
    const storedRecruiter = localStorage.getItem('recruiter');
    if (storedCandidate) setCandidate(JSON.parse(storedCandidate));
    if (storedRecruiter) setRecruiter(JSON.parse(storedRecruiter));
    setLoading(false);
  }, []);

  // ── Candidate Auth ──
  const loginCandidate = (data) => {
    setCandidate(data);
    localStorage.setItem('candidate', JSON.stringify(data));
  };
  const logoutCandidate = () => {
    setCandidate(null);
    localStorage.removeItem('candidate');
  };
  const updateCandidateContext = (data) => {
    setCandidate(data);
    localStorage.setItem('candidate', JSON.stringify(data));
  };

  // ── Recruiter Auth ──
  const loginRecruiter = (data) => {
    setRecruiter(data);
    localStorage.setItem('recruiter', JSON.stringify(data));
  };
  const logoutRecruiter = () => {
    setRecruiter(null);
    localStorage.removeItem('recruiter');
  };
  const updateRecruiterContext = (data) => {
    setRecruiter(data);
    localStorage.setItem('recruiter', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider value={{
      candidate, recruiter, loading,
      loginCandidate, logoutCandidate, updateCandidateContext,
      loginRecruiter, logoutRecruiter, updateRecruiterContext,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);