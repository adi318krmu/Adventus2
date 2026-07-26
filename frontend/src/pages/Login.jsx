import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Brand from "../components/Brand";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", role: "student" });

  const [showForgot, setShowForgot] = useState(false);
  const [forgotForm, setForgotForm] = useState({ name: "", email: "", phone: "" });
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const submitForgot = async (event) => {
    event.preventDefault();
    setForgotLoading(true);
    try {
      const { data } = await api.post("/password-request", forgotForm);
      toast.success(data.message || "Your password reset request has been sent to the administrator.");
      setForgotForm({ name: "", email: "", phone: "" });
      setShowForgot(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed");
    } finally {
      setForgotLoading(false);
    }
  };



  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-xl mx-auto">
        {showForgot ? (
          <form onSubmit={submitForgot} className="card">
            <Brand />
            <h1 className="mt-10 text-3xl font-bold">Reset Password</h1>
            <p className="mt-2 text-sm text-slate-400">Enter your registered details to submit a password reset request to the administrator.</p>
            <div className="mt-6 space-y-4">
              <input className="input" placeholder="Student Name" value={forgotForm.name} onChange={(e) => setForgotForm({ ...forgotForm, name: e.target.value })} required />
              <input className="input" placeholder="Registered Email" type="email" value={forgotForm.email} onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })} required />
              <input className="input" placeholder="Registered Phone Number" value={forgotForm.phone} onChange={(e) => setForgotForm({ ...forgotForm, phone: e.target.value })} required />
            </div>
            <button disabled={forgotLoading} className="btn-primary mt-6 w-full">{forgotLoading ? "Submitting..." : "Submit Request"}</button>
            <button type="button" onClick={() => setShowForgot(false)} className="btn-outline mt-3 w-full">Back to Sign In</button>
          </form>
        ) : (
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
              {form.role === "student" && (
                <div className="text-right">
                  <button type="button" onClick={() => setShowForgot(true)} className="text-sm font-semibold text-mint hover:underline">Forgot Password?</button>
                </div>
              )}
            </div>
            <button disabled={loading} className="btn-primary mt-6 w-full">{loading ? "Signing in..." : "Sign In"}</button>
            <p className="mt-5 text-center text-sm text-slate-400">New student? <Link className="font-semibold text-mint" to="/signup">Create account</Link></p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
