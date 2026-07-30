import { getAvatarById } from "../utils/avatarConfig";
import { fileUrl } from "../utils/api";

const UserAvatar = ({ user, className = "h-10 w-10 text-sm", fallbackName }) => {
  const profilePhoto = user?.profilePhoto;
  const avatarId = user?.avatarId;

  // 1. Uploaded profile photo takes precedence if present
  if (profilePhoto) {
    return (
      <div className={`relative grid place-items-center overflow-hidden rounded-full border border-mint/50 bg-ink flex-shrink-0 ${className}`}>
        <img src={fileUrl(profilePhoto)} alt="User avatar" className="h-full w-full object-cover" />
      </div>
    );
  }

  // 2. Animated WebP avatar from avatarConfig
  const avatarObj = getAvatarById(avatarId || "avatar-1");
  if (avatarObj && avatarObj.image) {
    return (
      <div className={`relative grid place-items-center overflow-hidden rounded-full border border-mint/50 bg-ink/80 p-0.5 flex-shrink-0 ${className}`}>
        <img src={avatarObj.image} alt={avatarObj.name} className="h-full w-full object-contain" />
      </div>
    );
  }

  // 3. Text initial fallback
  const initial = user?.name?.[0] || user?.username?.[0] || fallbackName?.[0] || "A";
  return (
    <div className={`grid place-items-center rounded-full border border-mint/50 bg-ink font-bold text-mint flex-shrink-0 ${className}`}>
      {initial.toUpperCase()}
    </div>
  );
};

export default UserAvatar;
