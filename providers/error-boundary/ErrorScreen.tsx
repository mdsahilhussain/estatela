import { Ionicons } from "@expo/vector-icons";
import { getErrorMessage } from "react-error-boundary";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

type ErrorScreenProps = {
  error: unknown;
  onRetry: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  title?: string;
  message?: string;
};

function getStack(error: unknown) {
  return error instanceof Error ? error.stack : undefined;
}

export function ErrorScreen({
  error,
  onRetry,
  onGoBack,
  canGoBack = false,
  title = "Something went wrong",
  message = "We could not load this screen. Please try again.",
}: ErrorScreenProps) {
  const errorMessage = getErrorMessage(error);
  const stack = getStack(error);

  return (
    <View className="flex-1 bg-background px-6 py-10">
      <View className="flex-1 justify-center">
        <View className="self-center size-16 items-center justify-center rounded-full bg-destructive/10">
          <Ionicons name="alert-circle-outline" size={34} color="#dc2626" />
        </View>

        <Text className="mt-6 text-center text-2xl font-sans-bold text-foreground">
          {title}
        </Text>
        <Text className="mt-3 text-center text-base font-sans-medium text-muted-foreground">
          {message}
        </Text>

        <View className="mt-8 gap-3">
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-4"
          >
            <Ionicons name="refresh-outline" size={18} color="#f2f2f2" />
            <Text className="text-base font-sans-bold text-background">
              Try again
            </Text>
          </Pressable>

          {canGoBack && onGoBack ? (
            <Pressable
              accessibilityRole="button"
              onPress={onGoBack}
              className="flex-row items-center justify-center gap-2 rounded-2xl border border-border/30 bg-card px-5 py-4"
            >
              <Ionicons name="arrow-back-outline" size={18} color="#0a0a0a" />
              <Text className="text-base font-sans-semibold text-foreground">
                Go back
              </Text>
            </Pressable>
          ) : null}
        </View>

        {__DEV__ && errorMessage ? (
          <View className="mt-6 rounded-2xl border border-destructive/20 bg-card p-4">
            <Text className="text-xs font-sans-bold uppercase text-destructive">
              Development details
            </Text>
            <Text className="mt-2 text-sm font-sans-semibold text-foreground">
              {errorMessage}
            </Text>
            {stack ? (
              <ScrollView className="mt-3 max-h-44">
                <Text className="text-xs font-sans-regular text-muted">
                  {stack}
                </Text>
              </ScrollView>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
