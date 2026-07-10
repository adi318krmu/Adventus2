import { useState } from "react";
import toast from "react-hot-toast";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import api, { fileUrl } from "../utils/api";
import { classes, feeByClass, formatMoney } from "../utils/fees";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    class: user?.class || "4",
    profilePhoto: null
  });
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("phone", form.phone);
      payload.append("class", form.class);
      if (form.profilePhoto) payload.append("profilePhoto", form.profilePhoto);
      const { data } = await api.put("/student/profile", payload, { headers: { "Content-Type": "multipart/form-data" } });
      setUser(data);
      sessionStorage.setItem("tms_user", JSON.stringify(data));
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <form onSubmit={submit} className="card mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-line bg-ink p-5 text-center">
          <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-mint/50 bg-panel text-3xl font-bold text-mint">
            {user?.profilePhoto ? <img className="h-full w-full object-cover" src={fileUrl(user.profilePhoto)} alt="Profile" /> : user?.name?.[0]}
          </div>
          <div>
            <p className="text-sm text-slate-400">Tuition ID</p>
            <p className="text-xl font-bold text-mint">{user?.tuitionId || "Generated after profile save"}</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <input className="input" disabled value={user?.username || ""} />
          <input className="input" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select className="input" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}>
            {classes.map((item) => <option key={item} value={item}>Class {item}</option>)}
          </select>
          <input className="input" type="file" accept="image/*" onChange={(e) => setForm({ ...form, profilePhoto: e.target.files[0] })} />
        </div>
        <div className="mt-5 rounded-xl border border-mint/40 bg-mint/10 p-4 text-mint">
          Fee after class update: <strong>{formatMoney(feeByClass[form.class])}</strong>
        </div>
        <button disabled={loading} className="btn-primary mt-6 w-full">{loading ? "Saving..." : "Save Profile"}</button>
      </form>
    </Shell>
  );
};

export default Profile;
