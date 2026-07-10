import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FeeManagement from "./pages/FeeManagement";
import PaymentPage from "./pages/PaymentPage";
import Profile from "./pages/Profile";
import StudentAccountManagement from "./pages/StudentAccountManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import CreatorBranding from "./components/CreatorBranding";

// Study Materials & Password Reset views
import StudentStudyMaterials from "./pages/Student/StudyMaterials";
import MaterialViewer from "./pages/Student/MaterialViewer";
import ChangePassword from "./pages/Student/ChangePassword";
import AdminStudyMaterials from "./pages/Admin/StudyMaterials";
import UploadMaterial from "./pages/Admin/UploadMaterial";
import PasswordRequests from "./pages/Admin/PasswordRequests";

const App = () => (
  <>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute role="student" />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/student/materials" element={<StudentStudyMaterials />} />
        <Route path="/student/materials/:id" element={<MaterialViewer />} />
        <Route path="/student/change-password" element={<ChangePassword />} />
      </Route>
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/fees" element={<FeeManagement />} />
        <Route path="/admin/accounts" element={<StudentAccountManagement />} />
        <Route path="/admin/materials" element={<AdminStudyMaterials />} />
        <Route path="/admin/materials/upload" element={<UploadMaterial />} />
        <Route path="/admin/password-requests" element={<PasswordRequests />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <CreatorBranding />
  </>
);

export default App;
