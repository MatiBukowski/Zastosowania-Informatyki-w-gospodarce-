import { useAuth } from '../services/AuthProvider';
import { LockedPage } from '../pages/LockedPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { accessToken, role } = useAuth();

  // Not logged in
  if (!accessToken) {
    return <LockedPage />;
  }

  // Logged in but doesn't have required role
  if (requiredRole && role !== requiredRole) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};

