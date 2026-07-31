import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Brand from "../components/Brand";
import AvatarSelector from "../components/AvatarSelector";
import SakuraPetals from "../components/SakuraPetals";
import JapaneseDivider from "../components/JapaneseDivider";
import ThemeToggle from "../components/ThemeToggle";
import api from "../utils/api";
import { classes, feeByClass, formatMoney } from "../utils/fees";
import { Scroll, ArrowRight } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    class: "4",
    password: "",
    avatarId: "avatar-1"
  });

  const submit = async (event) => {
    event.preventDefault();
    if (!form.username || !form.name || !form.email || !form.phone || !form.password) {
      return toast.error("All fields are required");
    }
    if (!form.avatarId) {
      return toast.error("Please choose an avatar to continue");
    }
    setLoading(true);
    try {
      const { data } = await api.post("/signup", form);
      toast.success(data.message || "Account created. Please wait for admin enrollment approval.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen grid place-items-center px-5 py-10 bg-ink shoji-pattern text-white transition-colors duration-300">
      <SakuraPetals />

      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      <form onSubmit={submit} className="relative z-10 card w-full max-w-2xl border-amber-500/40 p-8 shadow-samuraiGold">
        <Brand />
        <JapaneseDivider className="my-6" />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black font-display text-white">Student Enrollment Application</h1>
            <p className="mt-1 text-xs text-stone-300">Register to join the Adventus Samurai Academy hall of learning.</p>
          </div>
          <span className="text-xs font-bold font-display uppercase text-amber-400 tracking-widest flex items-center gap-1">
            <Scroll size={16} /> Academy Register
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Username</label>
            <input className="input" placeholder="Desired Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Full Name</label>
            <input className="input" placeholder="Your Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Email Address</label>
            <input className="input" placeholder="Your Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Phone Number</label>
            <input className="input" placeholder="Contact Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Academic Class</label>
            <select className="input" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}>
              {classes.map((item) => <option key={item} value={item} className="bg-stone-900 text-white">Class {item}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1.5">Account Password</label>
            <input className="input" placeholder="Set Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-300 text-xs font-semibold flex items-center justify-between">
          <span>Standard Monthly Fee for <strong>Class {form.class}</strong>:</span>
          <strong className="text-sm font-display text-amber-400">{formatMoney(feeByClass[form.class])}</strong>
        </div>

        {/* Step 4: Avatar Selection */}
        <div className="mt-6 border-t border-amber-500/30 pt-6">
          <AvatarSelector
            selectedId={form.avatarId}
            onSelect={(id) => setForm({ ...form, avatarId: id })}
            title="Choose Your Academy Avatar Companion"
            subtitle="Pick an animated avatar to represent your profile across Adventus Samurai Academy"
          />
        </div>

        <button disabled={loading} className="btn-primary mt-8 w-full font-display uppercase tracking-wider text-xs py-3.5 flex items-center justify-center gap-2">
          {loading ? "Submitting Application..." : "Submit Enrollment Application"} <ArrowRight size={16} />
        </button>
        <p className="mt-5 text-center text-xs text-stone-400">
          Already registered? <Link className="font-bold text-amber-400 hover:underline" to="/login">Sign in to Dojo Portal</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
