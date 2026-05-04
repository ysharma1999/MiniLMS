import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

export function StatCard({ label, value, icon, color, bgColor }: Props): React.JSX.Element {
  return (
    <View className="flex-1 bg-dark-800 rounded-2xl p-4 border border-dark-700">
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: bgColor }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-dark-400 text-xs mt-1">{label}</Text>
    </View>
  );
}
