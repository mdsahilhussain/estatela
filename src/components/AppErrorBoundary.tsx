import { captureError } from "@/src/lib/sentry";
import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    captureError(error, "react_error_boundary", {
      componentStack: errorInfo.componentStack,
    });
  }

  retry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-2xl font-bold text-foreground text-center">
          Something went wrong
        </Text>
        <Text className="text-muted-foreground text-center mt-3">
          We have been notified and are looking into it.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={this.retry}
          className="mt-6 bg-foreground rounded-2xl px-6 py-3"
        >
          <Text className="text-background font-semibold">Try again</Text>
        </Pressable>
      </View>
    );
  }
}
