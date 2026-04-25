import "@/global.css";
import { Link } from "expo-router";
import { Text } from "react-native";

import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text className="text-5xl font-sans-extrabold text-primary">
        Home
      </Text>

      <Link href="/onboarding" className="mt-4 rounded bg-primary px-4 py-2">
        Get to onboarding
      </Link>
      <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary px-4 py-2">
        Sign In
      </Link>
      <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary px-4 py-2">
        Sign Up
      </Link>
    </SafeAreaView>
  );
}