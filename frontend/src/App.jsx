import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FeeManagement from "./pages/FeeManagement";
import PaymentPage from "./pages/PaymentPage";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route element={<ProtectedRoute role="student" />}>
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
    <Route element={<ProtectedRoute role="admin" />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/fees" element={<FeeManagement />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
