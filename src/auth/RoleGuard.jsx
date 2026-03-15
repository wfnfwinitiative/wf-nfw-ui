import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const RoleGuard = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ngo-light">
        <div className="text-ngo-orange text-xl font-medium">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = user.roles || [user.role];
  if (allowedRoles && !allowedRoles.some(r => userRoles.includes(r))) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};
