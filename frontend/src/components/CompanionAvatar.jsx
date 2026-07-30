import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Sparkles, EyeOff, X } from "lucide-react";
import toast from "react-hot-toast";
import { useCompanion } from "../hooks/useCompanion";
import { getAvatarById } from "../utils/avatarConfig";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const CompanionAvatar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { posX, direction, isWalking, idleAction } = useCompanion();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Return null if companion is disabled by student
  if (user?.companionEnabled === false) return null;

  const avatarObj = getAvatarById(user?.avatarId || "avatar-1");

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHideCompanion = async () => {
    setShowMenu(false);
    try {
      const payload = new FormData();
      payload.append("companionEnabled", "false");
      const { data } = await api.put("/student/profile", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUser(data);
      sessionStorage.setItem("tms_user", JSON.stringify(data));
      toast("Companion hidden. Re-enable anytime in Profile Settings!", { icon: "👋" });
    } catch {
      toast.error("Failed to update companion settings");
    }
  };

  // Determine CSS animation class for idle actions
  let actionClass = "";
  if (idleAction === "jump") actionClass = "animate-jump";
  else if (idleAction === "bounce") actionClass = "animate-bounce-gentle";
  else if (idleAction === "wave") actionClass = "animate-tilt";

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 pointer-events-none select-none">
      <div
        className="absolute bottom-0 transition-transform duration-75 ease-linear pointer-events-auto"
        style={{
          transform: `translateX(${posX}px)`
        }}
      >
        {/* Floating Menu Popup */}
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 rounded-2xl border border-mint/40 bg-ink/95 p-3 shadow-2xl backdrop-blur-md animate-fade-in z-50 text-white"
          >
            <div className="flex items-center justify-between border-b border-line pb-2 mb-2">
              <span className="text-xs font-bold text-mint flex items-center gap-1">
                <Sparkles size={12} /> {avatarObj.name}
              </span>
              <button
                onClick={() => setShowMenu(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded-full"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-mint/15 hover:text-mint transition"
              >
                <User size={14} /> My Profile
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-mint/15 hover:text-mint transition"
              >
                <Sparkles size={14} /> Change Avatar
              </button>

              <button
                onClick={handleHideCompanion}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/15 transition"
              >
                <EyeOff size={14} /> Hide Companion
              </button>
            </div>
          </div>
        )}

        {/* Companion Avatar Body */}
        <div
          onClick={() => setShowMenu((prev) => !prev)}
          className={`relative cursor-pointer group transition-transform duration-300 hover:scale-110 ${actionClass}`}
        >
          {/* Subtle Glow Aura on Hover */}
          <div className="absolute inset-0 rounded-full bg-mint/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Avatar Container */}
          <div
            className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-full border border-mint/40 bg-ink/80 p-1 shadow-glow backdrop-blur-sm flex items-center justify-center"
            style={{
              transform: `scaleX(${direction})`
            }}
          >
            <img
              src={avatarObj.image}
              alt={avatarObj.name}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Walking Indicator Shadow */}
          <div className="mx-auto mt-0.5 h-1.5 w-8 rounded-full bg-black/40 blur-[1px]" />
        </div>
      </div>
    </div>
  );
};

export default CompanionAvatar;
