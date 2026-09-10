import { Navigate, useLocation } from "react-router-dom";
import useAuth from "app/hooks/useAuth";

export default function AuthGuard({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const { pathname } = useLocation();

  if (!isInitialized) {
    return null;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return <Navigate replace to="/session/signin" state={{ from: pathname }} />;
}
