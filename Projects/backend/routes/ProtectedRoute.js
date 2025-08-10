import { Navigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext'; // Create this contex

const ProtectedRoute = ({ children, allowedRoles }) => {
   const { currentUser, loading } = useAuth(); // Get from context

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <p>Loading authentication state...</p>
    </div>;
  }

   if (!currentUser) {
    // User not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

    return children;
};

export default ProtectedRoute;