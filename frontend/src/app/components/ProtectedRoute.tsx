import { Navigate } from "react-router";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const auth = useAuth();

  if (!auth || auth.loading) return null;

  const { user } = auth;

  // Not logged in → redirect to signin
  if (!user) return <Navigate to="/signin" replace />;

  // Admin-only route but user is not admin
  if (adminOnly && user.Member_role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
