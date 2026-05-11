import { Navigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import Loader       from './Loader';

const RecruiterRoute = ({ children }) => {
  const { recruiter, loading } = useAuth();
  if (loading) return <Loader />;
  return recruiter ? children : <Navigate to="/recruiter/login" />;
};

export default RecruiterRoute;