import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import type { ComponentType } from "react";

type SentryUserContext = {
  id?: string | null;
  email?: string | null;
};

type BreadcrumbData = Record<string, string | number | boolean | null | undefined>;

let initialized = false;
const reportedErrors = new WeakSet<object>();

const appVersion =
  Constants.expoConfig?.version ??
  Constants.nativeAppVersion ??
  "unknown";

const buildVersion =
  Constants.nativeBuildVersion ??
  Constants.expoConfig?.ios?.buildNumber ??
  Constants.expoConfig?.android?.versionCode?.toString() ??
  "development";

export const sentryEnvironment =
  process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ??
  process.env.EXPO_PUBLIC_APP_ENV ??
  (__DEV__ ? "development" : "production");

export const sentryRelease =
  process.env.EXPO_PUBLIC_SENTRY_RELEASE ??
  `${Constants.expoConfig?.slug ?? "estatela"}@${appVersion}`;

export const sentryDist =
  process.env.EXPO_PUBLIC_SENTRY_DIST ?? buildVersion;

export function initSentry() {
  if (initialized) return;

  initialized = true;

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.warn("Sentry DSN is not set. Sentry will not be initialized.");
    return;
  }

  Sentry.init({
    dsn,
    enabled: Boolean(dsn),
    debug: __DEV__ && process.env.EXPO_PUBLIC_SENTRY_DEBUG === "true",
    environment: sentryEnvironment,
    release: sentryRelease,
    dist: sentryDist,
    sendDefaultPii: false,
    enableAutoSessionTracking: true,
    enableNativeCrashHandling: true,
    enableAppHangTracking: !__DEV__,
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
  
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
        delete event.user.username;
      }
  
      if (event.extra) {
        delete event.extra.email;
        delete event.extra.identifier;
        delete event.extra.token;
        delete event.extra.phone;
      }
  
      return event;
    },
  });

  Sentry.setTag("app.version", appVersion);
  Sentry.setTag("app.build", buildVersion);
}

export function wrapWithSentry<T extends ComponentType<Record<string, unknown>>>(
  RootComponent: T
) {
  return Sentry.wrap(RootComponent);
}

export function setSentryUser(user: SentryUserContext) {
  Sentry.setUser({
    id: user.id ?? undefined,
    email: user.email ?? undefined,
  });
}

export function clearSentryUser() {
  Sentry.setUser(null);
}

export function captureError(
  error: unknown,
  context?: string,
  data?: BreadcrumbData
) {
  if (typeof error === "object" && error !== null) {
    if (reportedErrors.has(error)) return;
    reportedErrors.add(error);
  }

  const exception =
    error instanceof Error
      ? error
      : new Error(
          typeof error === "string"
            ? error
            : "A non-error exception was captured"
        );

  Sentry.captureException(exception, {
    tags: context ? { error_context: context } : undefined,
    extra: {
      ...data,
      originalError: error instanceof Error ? undefined : error,
    },
  });
}

export function addSentryBreadcrumb(
  message: string,
  category: string,
  data?: BreadcrumbData,
  level: Sentry.SeverityLevel = "info"
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
  });
}

export const sentryBreadcrumbs = {
  login: (method: string) =>
    addSentryBreadcrumb("Login attempted", "auth.login", { method }),
  logout: () => addSentryBreadcrumb("Logout requested", "auth.logout"),
  propertyView: (propertyId?: string) =>
    addSentryBreadcrumb("Property viewed", "property.view", { propertyId }),
  propertyCreation: (stage: "start" | "success" | "failure", data?: BreadcrumbData) =>
    addSentryBreadcrumb("Property creation", "property.create", { stage, ...data }),
  search: (data?: BreadcrumbData) =>
    addSentryBreadcrumb("Property search", "search", data),
  contactSubmission: (propertyId?: string) =>
    addSentryBreadcrumb("Contact submission", "contact", { propertyId }),
  favorites: (action: "save" | "unsave", propertyId?: string) =>
    addSentryBreadcrumb("Favorite property", "favorites", { action, propertyId }),
};

export function testSentryCrash(): never {
  throw new Error("Test Sentry Crash");
}
