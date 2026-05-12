import heart from '@/assets/icons/heart.png';
import home from '@/assets/icons/home.png';
import logo from "@/assets/icons/logo.png";
import search from '@/assets/icons/search.png';
import setting from '@/assets/icons/settings.png';


export const icons = {
home,
search,
heart,
setting,
logo
} as const

export type IconKey = keyof typeof icons;