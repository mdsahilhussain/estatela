import { SplashScreen, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import type { FallbackProps } from "react-error-boundary";

import { ErrorScreen } from "./ErrorScreen";

export type ErrorFallbackProps = FallbackProps & {
  title?: string;
  message?: string;
  showBackButton?: boolean;
};

export function ErrorFallback({
  error,
  resetErrorBoundary,
  title,
  message,
  showBackButton = true,
}: ErrorFallbackProps) {
  const router = useRouter();

  useEffect(() => {
    SplashScreen.hideAsync().catch((err) => {
      console.error("Failed to hide splash screen:", error)
    });
  }, []);

  const canGoBack = useMemo(() => {
    if (!showBackButton) return false;
    return router.canGoBack();
  }, [router, showBackButton]);

  return (
    <ErrorScreen
      error={error}
      title={title}
      message={message}
      onRetry={resetErrorBoundary}
      canGoBack={canGoBack}
      onGoBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)");
        }
      }}
    />
  );
}
