// Adventus Tuition Center - Avatar Configuration System

// Import all animated WebP files inside assets/avatars
const avatarModules = import.meta.glob('../assets/avatars/*.webp', { eager: true, import: 'default' });

export const avatars = Object.keys(avatarModules).map((filePath, index) => {
  const fileName = filePath.split('/').pop().replace('.webp', '');
  const formattedName = fileName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id: fileName,
    name: formattedName,
    image: avatarModules[filePath]
  };
});

// Fallback default avatar
export const DEFAULT_AVATAR = avatars[0] || {
  id: "avatar-1",
  name: "Avatar 1",
  image: ""
};

// Retrieve avatar object by ID with fallback
export const getAvatarById = (id) => {
  if (!id) return DEFAULT_AVATAR;
  const found = avatars.find((a) => a.id === id);
  return found || DEFAULT_AVATAR;
};
