import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAppInit } from "@/hooks/useAppInit";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout(): React.JSX.Element | null {
  const { isReady } = useAppInit();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <StatusBar style="light" backgroundColor="#0F172A" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0F172A" },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="(course)/[id]"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="(course)/webview"
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: "#1E293B" },
              headerTintColor: "#F8FAFC",
              headerTitleStyle: { fontWeight: "700" },
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}