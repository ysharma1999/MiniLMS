import React from "react";
import { ActivityIndicator, View, Text } from "react-native";

interface Props {
  size?: "small" | "large";
  color?: string;
  message?: string;
}

export function LoadingSpinner({
  size = "large",
  color = "#6366F1",
  message,
}: Props): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center gap-3">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-dark-400 text-sm">{message}</Text>
      )}
    </View>
  );
}
