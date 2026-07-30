import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Brand from "../components/Brand";
import AvatarSelector from "../components/AvatarSelector";
import api from "../utils/api";
import { classes, feeByClass, formatMoney } from "../utils/fees";

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
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <form onSubmit={submit} className="card w-full max-w-2xl">
        <Brand />
        <h1 className="mt-8 text-3xl font-bold">Create student account</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input className="input" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <select className="input" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}>
            {classes.map((item) => <option key={item} value={item}>Class {item}</option>)}
          </select>
          <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>

        <div className="mt-5 rounded-xl border border-mint/40 bg-mint/10 p-4 text-mint text-sm">
          Monthly fee for Class {form.class}: <strong>{formatMoney(feeByClass[form.class])}</strong>
        </div>

        {/* Step 4: Avatar Selection */}
        <div className="mt-6 border-t border-line pt-6">
          <AvatarSelector
            selectedId={form.avatarId}
            onSelect={(id) => setForm({ ...form, avatarId: id })}
            title="Choose Your Avatar"
            subtitle="Pick an animated avatar to represent your profile across Adventus"
          />
        </div>

        <button disabled={loading} className="btn-primary mt-8 w-full flex items-center justify-center gap-2">
          {loading ? "Creating..." : "Create Account"}
        </button>
        <p className="mt-5 text-center text-sm text-slate-400">
          Already registered? <Link className="font-semibold text-mint" to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
