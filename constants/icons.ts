import add from '@/assets/icons/add.png';
import bed from '@/assets/icons/bed.png';
import filter from '@/assets/icons/filter.png';
import heart from '@/assets/icons/heart.png';
import home from '@/assets/icons/home.png';
import input_search from '@/assets/icons/input-search.png';
import location from '@/assets/icons/location.png';
import logo from "@/assets/icons/logo.png";
import search from '@/assets/icons/search.png';
import setting from '@/assets/icons/settings.png';
import water from '@/assets/icons/water.png';


export const icons = {
home,
input_search,
search,
heart,
setting,
logo,
add,
filter,
water,
location,
bed
} as const

export type IconKey = keyof typeof icons;