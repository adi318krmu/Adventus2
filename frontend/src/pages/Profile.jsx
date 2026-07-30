import { useState } from "react";
import { Camera, Crop } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../components/Shell";
import ImageCropperModal from "../components/ImageCropperModal";
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
  const [previewUrl, setPreviewUrl] = useState("");
  const [rawImageSrc, setRawImageSrc] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = (croppedFile, croppedPreviewUrl) => {
    setForm((prev) => ({ ...prev, profilePhoto: croppedFile }));
    setPreviewUrl(croppedPreviewUrl);
    setShowCropper(false);
    toast.success("Photo cropped! Click 'Save Profile' to apply changes.");
  };

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
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const displayAvatar = previewUrl || (user?.profilePhoto ? fileUrl(user.profilePhoto) : null);

  return (
    <Shell>
      <form onSubmit={submit} className="card mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Profile Settings</h1>

        <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-line bg-ink/70 p-6 text-center">
          <div className="relative group">
            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-2 border-mint bg-panel text-4xl font-bold text-mint shadow-glow">
              {displayAvatar ? (
                <img className="h-full w-full object-cover" src={displayAvatar} alt="Profile" />
              ) : (
                user?.name?.[0]
              )}
            </div>
            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]">
              <Camera size={24} className="text-mint" />
              <span className="text-[10px] text-white font-semibold mt-1">Change Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          <div>
            <p className="text-sm text-slate-400">Tuition ID</p>
            <p className="text-xl font-bold text-mint">{user?.tuitionId || "Generated after profile save"}</p>
          </div>

          <label className="btn-outline flex items-center gap-2 text-xs !py-2 !px-4 cursor-pointer">
            <Crop size={14} className="text-mint" />
            <span>Upload & Crop Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium ml-1">Username (Read-only)</label>
            <input className="input mt-1 bg-panel/40 cursor-not-allowed" disabled value={user?.username || ""} />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium ml-1">Full Name</label>
            <input className="input mt-1" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium ml-1">Email Address</label>
            <input className="input mt-1" placeholder="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium ml-1">Phone Number</label>
            <input className="input mt-1" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium ml-1">Assigned Class</label>
            <select className="input mt-1" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}>
              {classes.map((item) => <option key={item} value={item}>Class {item}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-mint/40 bg-mint/10 p-4 text-mint text-sm">
          Fee after class update: <strong>{formatMoney(feeByClass[form.class])}</strong>
        </div>

        <button disabled={loading} className="btn-primary mt-6 w-full flex items-center justify-center gap-2">
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>

      {showCropper && (
        <ImageCropperModal
          imageSrc={rawImageSrc}
          onCropComplete={handleCropComplete}
          onClose={() => setShowCropper(false)}
        />
      )}
    </Shell>
  );
};

export default Profile;
