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

  export type PropertyType = "apartment" | "house" | "villa" | "studio" | null;

  export interface FilterState {
    search: string;
    type: PropertyType;
    bedrooms: number | null;
    minPrice: number | null;
    maxPrice: number | null;

    setSearch: (value: string) => void;
    setType: (value: PropertyType) => void;
    setBedrooms: (value: number | null) => void;
    setMinPrice: (value: number | null) => void;
    setMaxPrice: (value: number | null) => void;
    resetFilters: () => void;
  }

  interface SavedProperty {
    id: string;
    property_id: string;
    properties: Property;
  }

  interface FormState {
    title: string;
    description: string;
    price: string;
    type: PropertyType;
    bedrooms: number;
    bathrooms: number;
    areaSqft: string;
    address: string;
    city: string;
    latitude: string;
    longitude: string;
    isFeatured: boolean;
    images: string[];
    localImages: string[];
  }
}

export { };

