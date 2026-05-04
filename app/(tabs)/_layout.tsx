import { useAuthStore } from "@/store/authStore";
import { useCourseStore } from "@/store/courseStore";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";

type IoniconName = keyof typeof Ionicons.glyphMap;

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconName;
  iconFocused: IoniconName;
}

const TABS: TabConfig[] = [
  {
    name: "index",
    title: "Courses",
    icon: "grid-outline",
    iconFocused: "grid",
  },
  {
    name: "bookmarks",
    title: "Bookmarks",
    icon: "bookmark-outline",
    iconFocused: "bookmark",
  },
  {
    name: "profile",
    title: "Profile",
    icon: "person-outline",
    iconFocused: "person",
  },
];

export default function TabLayout(): React.JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const bookmarks = useCourseStore((s) => s.bookmarks);

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#1E293B",
          borderTopColor: "#334155",
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#64748B",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size}
                color={color}
              />
            ),
            ...(tab.name === "bookmarks" && bookmarks.size > 0
              ? { tabBarBadge: bookmarks.size }
              : {}),
          }}
        />
      ))}
    </Tabs>
  );
}