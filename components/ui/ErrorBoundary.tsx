import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    console.error("ErrorBoundary caught:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View className="flex-1 items-center justify-center px-6 bg-dark-900">
          <View className="bg-dark-800 rounded-2xl p-6 items-center w-full max-w-sm">
            <View className="w-16 h-16 rounded-full bg-rose-500/20 items-center justify-center mb-4">
              <Ionicons name="alert-circle" size={32} color="#F43F5E" />
            </View>
            <Text className="text-white text-xl font-bold mb-2">
              Something went wrong
            </Text>
            <Text className="text-dark-400 text-sm text-center mb-6">
              {this.state.error?.message || "An unexpected error occurred."}
            </Text>
            <TouchableOpacity
              onPress={this.handleRetry}
              className="bg-primary-500 rounded-xl px-6 py-3"
            >
              <Text className="text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
