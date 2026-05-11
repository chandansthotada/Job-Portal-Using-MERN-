import { Navigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import Loader       from './Loader';

const CandidateRoute = ({ children }) => {
  const { candidate, loading } = useAuth();
  if (loading) return <Loader />;
  return candidate ? children : <Navigate to="/candidate/login" />;
};

export default CandidateRoute;