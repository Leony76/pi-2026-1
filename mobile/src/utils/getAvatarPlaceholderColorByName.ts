import { AVATAR_COLORS } from "@/constants/maps/avatarPlaceholderColor.map";

export const getColorByName = (name: string) => {
  const charSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return AVATAR_COLORS[charSum % AVATAR_COLORS.length];
};