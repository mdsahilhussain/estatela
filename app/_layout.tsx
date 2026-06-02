import "@/global.css";
import { useUserSync } from "@/hooks/useUserSync";
import { AppErrorBoundary } from "@/src/components/AppErrorBoundary";
import { initSentry, wrapWithSentry } from "@/src/lib/sentry";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from 'expo-font';

import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

initSentry();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

const RootLayoutContent = () => {
  const { isLoaded: authLoaded } = useAuth();
  const [fontLoaded] = useFonts({
    'sans-thin': require('../assets/fonts/Mulish-ExtraLight.ttf'),
    'sans-light': require('../assets/fonts/Mulish-Light.ttf'),
    'sans-regular': require('../assets/fonts/Mulish-Regular.ttf'),
    'sans-medium': require('../assets/fonts/Mulish-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/Mulish-SemiBold.ttf'),
    'sans-bold': require('../assets/fonts/Mulish-Bold.ttf'),
    'sans-extrabold': require('../assets/fonts/Mulish-ExtraBold.ttf'),
  })

  useEffect(() => {
    if (fontLoaded && authLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded, authLoaded]);

  // sync Clerk user -> supabase
  useUserSync()

  if (!fontLoaded || !authLoaded) return null

  return (
    <>
      <Stack screenOptions={{
        headerShown: false,
      }} />
      {/* Don't remove this line  ------
      {__DEV__ && (
        <View className="absolute bottom-24 right-4 z-50">
          <Pressable
            accessibilityRole="button"
            onPress={testSentryCrash}
            className="rounded-2xl bg-destructive px-4 py-3"
          >
            <Text className="font-semibold text-background">Test Sentry Crash</Text>
          </Pressable>
        </View>
      )} */}
    </>
  );
}

function RootLayout() {
  return <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
    <AppErrorBoundary>
      <RootLayoutContent />
    </AppErrorBoundary>
  </ClerkProvider>;
}

export default wrapWithSentry(RootLayout);
