import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, role: currentRole, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && currentRole !== role) return <Navigate to={currentRole === "admin" ? "/admin/dashboard" : "/student/dashboard"} replace />;

  if (currentRole === "student" && user?.isTempPassword && location.pathname !== "/student/change-password") {
    return <Navigate to="/student/change-password" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
