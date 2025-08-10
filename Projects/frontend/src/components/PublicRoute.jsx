import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If user is logged in, redirect to their dashboard
  if (currentUser) {
    return <Navigate to={`/${currentUser.type}-dashboard`} replace />;
  }

  return children;
};

export default PublicRoute;