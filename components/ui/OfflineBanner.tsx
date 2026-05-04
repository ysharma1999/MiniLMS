import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNetwork } from "@/hooks/useNetwork";

export function OfflineBanner(): React.JSX.Element | null {
  const { isConnected } = useNetwork();
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const wasConnected = useRef(true);

  useEffect(() => {
    if (!isConnected && wasConnected.current) {
      wasConnected.current = false;
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else if (isConnected && !wasConnected.current) {
      wasConnected.current = true;
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, slideAnim]);

  if (isConnected && wasConnected.current) return null;

  return (
    <Animated.View
      style={{ transform: [{ translateY: slideAnim }] }}
      className="bg-rose-500 px-4 py-3 flex-row items-center gap-2"
    >
      <Ionicons name="wifi-outline" size={16} color="white" />
      <Text className="text-white text-sm font-medium flex-1">
        You're offline. Some features may be unavailable.
      </Text>
    </Animated.View>
  );
}
