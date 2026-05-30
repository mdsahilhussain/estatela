import add from '@/assets/icons/add.png';
import back_arrow from '@/assets/icons/back-arrow.png';
import bed from '@/assets/icons/bed.png';
import bin from '@/assets/icons/bin.png';
import camera from '@/assets/icons/camera.png';
import check_background from '@/assets/icons/check-background.png';
import check from '@/assets/icons/check.png';
import close_accent from '@/assets/icons/close-accent.png';
import close_white from '@/assets/icons/close-white.png';
import filter from '@/assets/icons/filter.png';
import full_heart from '@/assets/icons/full-heart.png';
import heart from '@/assets/icons/heart.png';
import home from '@/assets/icons/home.png';
import close_foreground from '@/assets/icons/input-close.png';
import input_search from '@/assets/icons/input-search.png';
import location_background from '@/assets/icons/location-background.png';
import location from '@/assets/icons/location.png';
import logo from "@/assets/icons/logo.png";
import remove from '@/assets/icons/remove.png';
import search from '@/assets/icons/search.png';
import setting from '@/assets/icons/settings.png';
import size from '@/assets/icons/size.png';
import water from '@/assets/icons/water.png';
import whatsapp from '@/assets/icons/whatsapp.png';

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
location_background,
bed,
close_foreground,
close_accent,
close_white,
full_heart,
back_arrow,
size,
whatsapp,
bin,
check,
check_background,
camera,
remove
} as const

export type IconKey = keyof typeof icons;