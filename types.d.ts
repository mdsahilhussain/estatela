import type { ImageSourcePropType } from "react-native";
declare global {
  interface AppTab {
    name: string;
    title: string;
    icon: ImageSourcePropType;
  }

  interface TabIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
    title?: string;
  }

  interface UserStore {
    isAdmin: boolean;
    setIsAdmin: (value: boolean) => void;
  }

  export interface Property {
    id: string;
    title: string;
    description: string;
    price: number;
    type: string;
    bedrooms: number;
    bathrooms: number;
    area_sqft: number;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    images: string[];
    is_featured: boolean;
    is_sold: boolean;
    created_at: string;
  }
}

export { };

