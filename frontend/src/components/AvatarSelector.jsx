import { Check } from "lucide-react";
import { avatars } from "../utils/avatarConfig";

const AvatarSelector = ({ selectedId, onSelect, title = "Choose Your Avatar", subtitle = "Select an animated avatar to represent your profile" }) => {
  return (
    <div className="w-full">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
      )}

      {/* Grid: 4 cols on Desktop, 3 cols on Tablet, 2 cols on Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {avatars.map((avatar) => {
          const isSelected = selectedId === avatar.id;
          return (
            <button
              type="button"
              key={avatar.id}
              onClick={() => onSelect(avatar.id)}
              className={`relative flex flex-col items-center justify-between rounded-2xl p-4 transition-all duration-300 cursor-pointer border select-none group ${
                isSelected
                  ? "border-mint bg-mint/10 shadow-[0_0_20px_rgba(0,242,254,0.25)] scale-[1.02]"
                  : "border-line bg-panelSoft/40 hover:border-mint/50 hover:bg-panelSoft/80 hover:scale-105"
              }`}
            >
              {/* Checkmark Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-mint text-ink font-bold shadow-md animate-scale-up">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}

              {/* Animated WebP Image */}
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-xl p-1 flex items-center justify-center">
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  loading="lazy"
                  className={`h-full w-full object-contain transition-transform duration-300 group-hover:scale-110 ${
                    isSelected ? "drop-shadow-[0_0_12px_rgba(0,242,254,0.5)]" : ""
                  }`}
                />
              </div>

              {/* Avatar Name */}
              <span className={`mt-3 text-xs font-bold truncate max-w-full ${isSelected ? "text-mint" : "text-slate-300 group-hover:text-white"}`}>
                {avatar.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarSelector;
