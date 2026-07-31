import { useState } from "react";
import { Camera, Crop, Sparkles, Award } from "lucide-react";
import toast from "react-hot-toast";
import Shell from "../components/Shell";
import UserAvatar from "../components/UserAvatar";
import AvatarSelector from "../components/AvatarSelector";
import ImageCropperModal from "../components/ImageCropperModal";
import JapaneseDivider from "../components/JapaneseDivider";
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
    companionEnabled: user?.companionEnabled !== false,
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
      payload.append("companionEnabled", form.companionEnabled);
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
      <form onSubmit={submit} className="card mx-auto max-w-2xl border-amber-500/40 p-8 shadow-samuraiGold">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display flex items-center gap-1.5">
              <Award size={14} /> Apprentice Ledger
            </p>
            <h1 className="mt-1 text-2xl font-black font-display text-white">Student Profile Settings</h1>
          </div>
          <span className="text-xs font-bold font-display uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300">
            Class {user?.class}
          </span>
        </div>

        <JapaneseDivider className="my-6" />

        {/* Current Avatar & Photo Controls */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-amber-500/30 bg-stone-950/80 p-6 text-center shadow-inner">
          <div className="relative group">
            <div className="p-1 rounded-full border-2 border-amber-500/60 shadow-samuraiGold">
              <UserAvatar
                user={previewUrl ? { ...user, profilePhoto: null, avatarId: form.avatarId } : { ...user, avatarId: form.avatarId }}
                className="h-28 w-28 text-4xl"
              />
            </div>
            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]">
              <Camera size={24} className="text-amber-400" />
              <span className="text-[10px] text-white font-bold font-display mt-1">Custom Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 font-display">Academy Tuition ID</p>
            <p className="text-xl font-black font-display text-amber-400">{user?.tuitionId || "Generated on Save"}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowAvatarModal((prev) => !prev)}
              className="btn-primary flex items-center gap-2 text-xs font-display uppercase tracking-wider !py-2 !px-4"
            >
              <Sparkles size={14} />
              <span>{showAvatarModal ? "Close Avatars" : "Change Companion Avatar"}</span>
            </button>

            <label className="btn-outline flex items-center gap-2 text-xs font-display uppercase tracking-wider !py-2 !px-4 cursor-pointer">
              <Crop size={14} className="text-amber-400" />
              <span>Upload Custom Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>
          </div>
        </div>

        {/* Avatar Selection Grid */}
        {showAvatarModal && (
          <div className="mt-6 rounded-2xl border border-amber-500/40 bg-stone-950/90 p-5 animate-fade-in">
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
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1">Username (Read-only)</label>
            <input className="input bg-stone-900/40 cursor-not-allowed text-stone-400" disabled value={user?.username || ""} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1">Full Name</label>
            <input
              className="input"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1">Email Address</label>
            <input
              className="input"
              placeholder="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1">Phone Number</label>
            <input
              className="input"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400/90 font-display mb-1">Assigned Class Rank</label>
            <select className="input" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}>
              {classes.map((item) => (
                <option key={item} value={item} className="bg-stone-900">
                  Class {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Companion Setting Toggle */}
        <div className="mt-5 rounded-xl border border-amber-500/30 bg-stone-950/60 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-amber-400" size={20} />
            <div>
              <p className="text-xs font-bold font-display uppercase tracking-wider text-white">Interactive Companion</p>
              <p className="text-[11px] text-stone-400">Show walking animated avatar at the bottom of student pages</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={form.companionEnabled}
              onChange={(e) => setForm({ ...form, companionEnabled: e.target.checked })}
            />
            <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
          </label>
        </div>

        <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-300 text-xs font-semibold flex items-center justify-between">
          <span>Monthly fee rate after class update:</span>
          <strong className="text-sm font-display text-amber-400">{formatMoney(feeByClass[form.class])}</strong>
        </div>

        <button disabled={loading} className="btn-primary mt-6 w-full font-display uppercase tracking-wider text-xs py-3.5 flex items-center justify-center gap-2">
          {loading ? "Saving Profile..." : "Save Profile Settings"}
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
