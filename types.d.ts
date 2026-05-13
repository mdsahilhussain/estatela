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
    title: string;
  }

  interface UserStore {
    isAdmin: boolean;
    setIsAdmin: (value: boolean) => void;
  }
}

export { };

