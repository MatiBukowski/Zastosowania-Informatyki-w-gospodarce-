import { useAuth } from '../services/AuthProvider';
import { LockedPage } from '../pages/LockedPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { accessToken, role } = useAuth();

  // Not logged in
  if (!accessToken) {
    return <LockedPage />;
  }

  // Logged in but doesn't have required role
  if (requiredRoles && requiredRoles.length > 0) {
    const hasPermission = role && requiredRoles.includes(role);

    if (!hasPermission) {
      return <UnauthorizedPage />;
    }
  }

  return <>{children}</>;
};
