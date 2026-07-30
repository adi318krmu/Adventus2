import { useState } from "react";
import { Camera, Crop, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../components/Shell";
import UserAvatar from "../components/UserAvatar";
import AvatarSelector from "../components/AvatarSelector";
import ImageCropperModal from "../components/ImageCropperModal";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { classes, feeByClass, formatMoney } from "../utils/fees";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    class: user?.class || "4",
    avatarId: user?.avatarId || "avatar-1",
    profilePhoto: null
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
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
    toast.success("Custom photo cropped! Click 'Save Profile' to apply changes.");
  };

  const handleAvatarSelect = (avatarId) => {
    setForm((prev) => ({ ...prev, avatarId }));
    setShowAvatarModal(false);
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
      payload.append("avatarId", form.avatarId);
      if (form.profilePhoto) payload.append("profilePhoto", form.profilePhoto);

      const { data } = await api.put("/student/profile", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUser(data);
      sessionStorage.setItem("tms_user", JSON.stringify(data));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <form onSubmit={submit} className="card mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Profile Settings</h1>

        {/* Current Avatar & Photo Controls */}
        <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-line bg-ink/70 p-6 text-center">
          <div className="relative group">
            <UserAvatar
              user={previewUrl ? { ...user, profilePhoto: null, avatarId: form.avatarId } : { ...user, avatarId: form.avatarId }}
              className="h-28 w-28 text-4xl shadow-glow border-2 border-mint"
            />
            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]">
              <Camera size={24} className="text-mint" />
              <span className="text-[10px] text-white font-semibold mt-1">Custom Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>
          </div>

          <div>
            <p className="text-sm text-slate-400">Tuition ID</p>
            <p className="text-xl font-bold text-mint">{user?.tuitionId || "Generated after profile save"}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowAvatarModal((prev) => !prev)}
              className="btn-primary flex items-center gap-2 text-xs !py-2 !px-4"
            >
              <Sparkles size={14} />
              <span>{showAvatarModal ? "Close Avatars" : "Change Animated Avatar"}</span>
            </button>

            <label className="btn-outline flex items-center gap-2 text-xs !py-2 !px-4 cursor-pointer">
              <Crop size={14} className="text-mint" />
              <span>Upload Custom Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>
          </div>
        </div>

        {/* Avatar Selection Accordion / Grid */}
        {showAvatarModal && (
          <div className="mt-6 rounded-2xl border border-mint/40 bg-panelSoft/50 p-5 animate-fade-in">
            <AvatarSelector
              selectedId={form.avatarId}
              onSelect={handleAvatarSelect}
              title="Select Animated Avatar"
              subtitle="Choose your favorite animated WebP avatar to represent you across the tuition platform"
            />
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium ml-1">Username (Read-only)</label>
            <input className="input mt-1 bg-panel/40 cursor-not-allowed" disabled value={user?.username || ""} />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium ml-1">Full Name</label>
            <input
              className="input mt-1"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium ml-1">Email Address</label>
            <input
              className="input mt-1"
              placeholder="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium ml-1">Phone Number</label>
            <input
              className="input mt-1"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium ml-1">Assigned Class</label>
            <select className="input mt-1" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}>
              {classes.map((item) => (
                <option key={item} value={item}>
                  Class {item}
                </option>
              ))}
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
