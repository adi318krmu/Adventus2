import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, role: currentRole } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && currentRole !== role) return <Navigate to={currentRole === "admin" ? "/admin/dashboard" : "/student/dashboard"} replace />;
  return <Outlet />;
};

export default ProtectedRoute;
