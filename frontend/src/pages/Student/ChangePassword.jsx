import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Shell from "../../components/Shell";
import JapaneseDivider from "../../components/JapaneseDivider";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { KeyRound, ShieldCheck } from "lucide-react";

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

      const updatedUser = { ...user, isTempPassword: false };
      setUser(updatedUser);
      sessionStorage.setItem("tms_user", JSON.stringify(updatedUser));

      toast.success("Password Updated Successfully");
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
        <form onSubmit={submit} className="card w-full max-w-lg border-amber-500/40 p-8 shadow-samuraiGold">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
              <KeyRound size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black font-display text-white">Update Password Seal</h1>
              <p className="text-xs text-stone-300">Set your permanent password to unlock full access to the Academy.</p>
            </div>
          </div>

          <JapaneseDivider className="my-6" />

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Temporary Password</label>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">New Password</label>
              <input
                className="input"
                type="password"
                placeholder="Minimum 6 characters"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Confirm New Password</label>
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

          <button disabled={loading} className="btn-primary mt-6 w-full font-display uppercase tracking-wider text-xs py-3.5 flex items-center justify-center gap-2">
            <ShieldCheck size={16} /> {loading ? "Updating Password..." : "Save Password & Unlock Dojo"}
          </button>
        </form>
      </div>
    </Shell>
  );
};

export default ChangePassword;
