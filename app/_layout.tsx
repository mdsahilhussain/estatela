import "@/global.css";
import { useUserSync } from "@/hooks/useUserSync";
import { initSentry, wrapWithSentry } from "@/lib/sentry";
import { AppErrorBoundary } from "@/providers/error-boundary";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";

import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { useErrorBoundary } from "react-error-boundary";
import { LogBox, Pressable, Text, View } from "react-native";

initSentry();

if (__DEV__) {
  LogBox.ignoreLogs(["Test Error Boundary"]);
}

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

const RootLayoutContent = () => {
  const { isLoaded: authLoaded } = useAuth();
  const [fontLoaded] = useFonts({
    "sans-thin": require("../assets/fonts/Mulish-ExtraLight.ttf"),
    "sans-light": require("../assets/fonts/Mulish-Light.ttf"),
    "sans-regular": require("../assets/fonts/Mulish-Regular.ttf"),
    "sans-medium": require("../assets/fonts/Mulish-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/Mulish-SemiBold.ttf"),
    "sans-bold": require("../assets/fonts/Mulish-Bold.ttf"),
    "sans-extrabold": require("../assets/fonts/Mulish-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontLoaded && authLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded, authLoaded]);

  // sync Clerk user -> supabase
  useUserSync();

  if (!fontLoaded || !authLoaded) return null;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      {__DEV__ && <DevErrorBoundaryTrigger />}
    </>
  );
};

function DevErrorBoundaryTrigger() {
  const { showBoundary } = useErrorBoundary();

  return (
    <View className="absolute bottom-24 right-4 z-50">
      <Pressable
        accessibilityRole="button"
        onPress={() => showBoundary(new Error("Test Error Boundary"))}
        className="rounded-2xl bg-destructive px-4 py-3"
      >
        <Text className="font-sans-semibold text-background">
          Test Error Boundary
        </Text>
      </Pressable>
    </View>
  );
}

function RootLayout() {
  return (
    <AppErrorBoundary
      boundaryName="root"
      showBackButton={false}
      fallbackMessage="The app hit an unexpected problem. Please try again."
    >
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <RootLayoutContent />
      </ClerkProvider>
    </AppErrorBoundary>
  );
}

export default wrapWithSentry(RootLayout);
