import default_avatar_female from "@/assets/images/avatar-female.png";
import default_avatar_male from "@/assets/images/avatar-male.png";

export const images = {
  default_avatar_male,
  default_avatar_female,
} as const;

export type imageKey = keyof typeof images;
