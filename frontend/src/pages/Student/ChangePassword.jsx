import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Shell from "../../components/Shell";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tempPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const submit = async (event) => {
    event.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    if (form.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }

    setLoading(true);
    try {
      await api.post("/change-password", {
        tempPassword: form.tempPassword,
        newPassword: form.newPassword
      });

      // Update local state and storage to clear isTempPassword
      const updatedUser = { ...user, isTempPassword: false };
      setUser(updatedUser);
      sessionStorage.setItem("tms_user", JSON.stringify(updatedUser));

      toast.success("Password Changed");
      navigate("/student/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="grid min-h-[60vh] place-items-center">
        <form onSubmit={submit} className="card w-full max-w-lg">
          <h1 className="text-3xl font-bold text-mint">Change Password</h1>
          <p className="mt-2 text-sm text-slate-400">
            For security reasons, you must update your password before you can browse the tuition center application.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Temporary Password</label>
              <input
                className="input"
                type="password"
                placeholder="Enter temporary password"
                value={form.tempPassword}
                onChange={(e) => setForm({ ...form, tempPassword: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">New Password</label>
              <input
                className="input"
                type="password"
                placeholder="Enter at least 6 characters"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Confirm New Password</label>
              <input
                className="input"
                type="password"
                placeholder="Re-type new password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <button disabled={loading} className="btn-primary mt-6 w-full">
            {loading ? "Updating Password..." : "Update & Log In"}
          </button>
        </form>
      </div>
    </Shell>
  );
};

export default ChangePassword;
