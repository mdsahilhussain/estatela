import { useNetworkStatus } from "@/providers/network";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <View
      accessibilityRole="alert"
      className="absolute left-0 right-0 z-50 border-b border-destructive/20 bg-destructive px-4 pb-3 pt-2"
      style={{ paddingTop: Math.max(insets.top, 8) }}
    >
      <Text className="text-center font-sans-semibold text-sm text-background">
        You are offline. Showing available cached data.
      </Text>
    </View>
  );
}
