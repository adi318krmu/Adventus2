import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Brand from "../components/Brand";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, adminSignup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", role: "student" });
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      navigate(data.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (event) => {
    event.preventDefault();
    setAdminLoading(true);
    try {
      await adminSignup(adminForm);
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin signup failed");
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <form onSubmit={submit} className="card">
          <Brand />
          <h1 className="mt-10 text-3xl font-bold">Sign in</h1>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {["student", "admin"].map((role) => (
              <button type="button" key={role} onClick={() => setForm({ ...form, role })} className={form.role === role ? "btn-primary" : "btn-outline"}>
                {role === "admin" ? "Admin" : "Student"}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button disabled={loading} className="btn-primary mt-6 w-full">{loading ? "Signing in..." : "Sign In"}</button>
          <p className="mt-5 text-center text-sm text-slate-400">New student? <Link className="font-semibold text-mint" to="/signup">Create account</Link></p>
        </form>

        <form onSubmit={createAdmin} className="card">
          <p className="text-mint">Admin Create Account</p>
          <h2 className="mt-2 text-3xl font-bold">Create admin access</h2>
          <p className="mt-3 text-slate-400">Use this section to create a new admin login for managing students and fee approvals.</p>
          <div className="mt-8 space-y-4">
            <input className="input" placeholder="Admin username" value={adminForm.username} onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })} />
            <input className="input" placeholder="Admin password" type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} />
          </div>
          <button disabled={adminLoading} className="btn-outline mt-6 w-full">{adminLoading ? "Creating..." : "Create Admin Account"}</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
