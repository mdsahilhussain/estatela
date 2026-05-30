import { icons } from "./icons";

export const MIN_PRICE = 1;
export const MAX_PRICE = 999_999_999;
export const TYPES_LIST = ["apartment", "house", "villa", "studio"] as const; 

export const tabs: AppTab[] = [
  { name: "index", title: "Home", icon: icons.home },
  { name: "search", title: "Search", icon: icons.search },
  { name: "create", title: "Add Property", icon: icons.add },
  { name: "favorite", title: "Favorite", icon: icons.heart },
  { name: "setting", title: "Setting", icon: icons.setting },
];

export const TYPES: { label: string; value: PropertyType }[] = [
  { label: "All", value: null },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Villa", value: "villa" },
  { label: "Studio", value: "studio" },
];

export const BEDS = [
  { label: "Any", value: null },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

export const PRICE_PRESETS = [
  { label: "Under ₹50L", min: null, max: 5000000 },
  { label: "₹50L – ₹1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr – ₹2Cr", min: 10000000, max: 20000000 },
  { label: "Above ₹2Cr", min: 20000000, max: null },
];