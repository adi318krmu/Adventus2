import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Brand from "../components/Brand";
import SakuraPetals from "../components/SakuraPetals";
import JapaneseDivider from "../components/JapaneseDivider";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { Shield, KeyRound, ArrowRight } from "lucide-react";

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
    <div className="relative min-h-screen grid place-items-center px-5 py-10 bg-ink shoji-pattern text-white transition-colors duration-300">
      <SakuraPetals />

      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto">
        {showForgot ? (
          <form onSubmit={submitForgot} className="card border-amber-500/40 p-8 shadow-samuraiGold">
            <Brand />
            <JapaneseDivider className="my-6" />
            <h1 className="text-2xl font-black font-display text-white flex items-center gap-2">
              <KeyRound size={22} className="text-amber-400" /> Request Password Reset
            </h1>
            <p className="mt-2 text-xs leading-5 text-stone-300">
              Submit your registered student details to request a password reset from the Academy Grandmaster.
            </p>
            <div className="mt-6 space-y-4">
              <input className="input" placeholder="Student Full Name" value={forgotForm.name} onChange={(e) => setForgotForm({ ...forgotForm, name: e.target.value })} required />
              <input className="input" placeholder="Registered Email Address" type="email" value={forgotForm.email} onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })} required />
              <input className="input" placeholder="Registered Phone Number" value={forgotForm.phone} onChange={(e) => setForgotForm({ ...forgotForm, phone: e.target.value })} required />
            </div>
            <button disabled={forgotLoading} className="btn-primary mt-6 w-full font-display uppercase tracking-wider text-xs py-3.5 flex items-center justify-center gap-2">
              {forgotLoading ? "Submitting Request..." : "Submit Reset Request"}
            </button>
            <button type="button" onClick={() => setShowForgot(false)} className="btn-outline mt-3 w-full font-display uppercase tracking-wider text-xs py-3">
              Back to Portal Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={submit} className="card border-amber-500/40 p-8 shadow-samuraiGold">
            <Brand />
            <JapaneseDivider className="my-6" />
            
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black font-display text-white">Academy Sign In</h1>
              <span className="text-xs font-bold font-display uppercase text-amber-400 tracking-widest flex items-center gap-1">
                <Shield size={14} /> Secure Dojo Gate
              </span>
            </div>

            {/* Role Selection Tabs */}
            <div className="mt-6 grid grid-cols-2 gap-3 p-1 rounded-xl bg-stone-900/60 border border-amber-500/30">
              {["student", "admin"].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setForm({ ...form, role })}
                  className={`rounded-lg py-2.5 text-xs font-bold font-display uppercase tracking-wider transition-all duration-200 ${
                    form.role === role
                      ? "bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md"
                      : "text-stone-300 hover:text-amber-300"
                  }`}
                >
                  {role === "admin" ? "Grandmaster / Admin" : "Student Member"}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Username</label>
                <input className="input" placeholder="Enter your username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Password</label>
                <input className="input" placeholder="Enter your password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>

              {form.role === "student" && (
                <div className="text-right">
                  <button type="button" onClick={() => setShowForgot(true)} className="text-xs font-semibold text-amber-400 hover:underline">
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            <button disabled={loading} className="btn-primary mt-6 w-full font-display uppercase tracking-wider text-xs py-3.5 flex items-center justify-center gap-2">
              {loading ? "Verifying Credentials..." : "Enter Dojo"} <ArrowRight size={16} />
            </button>

            <p className="mt-6 text-center text-xs text-stone-400">
              New Student? <Link className="font-bold text-amber-400 hover:underline" to="/signup">Apply for Academy Account</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
