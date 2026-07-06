import type { ErrorInfo, ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { captureError } from "@/lib/sentry";

import { ErrorFallback } from "./ErrorFallback";

type AppErrorBoundaryProps = {
  children: ReactNode;
  boundaryName?: string;
  fallbackTitle?: string;
  fallbackMessage?: string;
  showBackButton?: boolean;
  resetKeys?: unknown[];
  onReset?: () => void;
};

export function AppErrorBoundary({
  children,
  boundaryName = "app",
  fallbackTitle,
  fallbackMessage,
  showBackButton,
  resetKeys,
  onReset,
}: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      resetKeys={resetKeys}
      onReset={onReset}
      onError={(error: unknown, errorInfo: ErrorInfo) => {
        captureError(error, "react_error_boundary", {
          boundary: boundaryName,
          componentStack: errorInfo.componentStack,
        });
      }}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          title={fallbackTitle}
          message={fallbackMessage}
          showBackButton={showBackButton}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
