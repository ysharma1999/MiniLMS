import { StatCard } from "@/components/StatCard";
import { AuthService } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";
import { useCourseStore } from "@/store/courseStore";
import { getNotificationStatus, requestNotificationPermissions } from "@/utils/notifications";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
  showArrow?: boolean;
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  color = "#94A3B8",
  showArrow = true,
}: SettingRowProps): React.JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4 border-b border-dark-700 gap-3"
      disabled={!onPress}
    >
      <View className="w-8 h-8 rounded-lg bg-dark-700 items-center justify-center">
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text className="flex-1 text-dark-200 text-sm font-medium">{label}</Text>
      {value && <Text className="text-dark-500 text-sm">{value}</Text>}
      {showArrow && onPress && (
        <Ionicons name="chevron-forward" size={16} color="#475569" />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen(): React.JSX.Element {
  const { user, logout } = useAuthStore();
  const { bookmarks, enrollments } = useCourseStore();
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const updateUser = useAuthStore((s) => s.updateUser);

  const handlePickAvatar = useCallback(async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to update your profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUpdatingAvatar(true);
      try {
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append("avatar", {
          uri: asset.uri,
          type: asset.mimeType ?? "image/jpeg",
          name: "avatar.jpg",
        } as unknown as Blob);

        const updatedUser = await AuthService.updateAvatar(formData);
        updateUser(updatedUser);
        Alert.alert("Success", "Profile picture updated!");
      } catch {
        Alert.alert("Error", "Failed to update profile picture.");
      } finally {
        setIsUpdatingAvatar(false);
      }
    }
  }, [updateUser]);

  const handleLogout = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }, [logout]);

  const handleNotificationSettings = useCallback(async () => {
    const { granted, canAskAgain } = await getNotificationStatus();
    if (!granted) {
      if (canAskAgain) {
        await requestNotificationPermissions();
      } else {
        Alert.alert(
          "Notifications Disabled",
          "Please enable notifications in your device settings to receive course reminders.",
          [{ text: "OK" }]
        );
      }
    } else {
      Alert.alert(
        "Notifications Enabled",
        "You'll receive reminders and updates about your courses.",
        [{ text: "OK" }]
      );
    }
  }, []);

  const avatarUrl =
    user?.avatar?.url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName ?? "U"}`;

  const displayName = user?.fullName || user?.username || "Learner";
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    : "Recently";

  return (
    <SafeAreaView className="flex-1 bg-dark-900" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="px-5 pt-4 pb-6">
          <Text className="text-white text-2xl font-bold mb-6">Profile 👤</Text>

          <View className="items-center">
            <TouchableOpacity
              onPress={handlePickAvatar}
              className="relative mb-4"
              disabled={isUpdatingAvatar}
            >
              <Image
                source={{ uri: avatarUrl }}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  borderWidth: 3,
                  borderColor: "#6366F1",
                }}
                contentFit="cover"
              />
              {isUpdatingAvatar ? (
                <View className="absolute inset-0 rounded-full bg-dark-900/70 items-center justify-center">
                  <ActivityIndicator color="#6366F1" />
                </View>
              ) : (
                <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 border-2 border-dark-900 items-center justify-center">
                  <Ionicons name="camera" size={14} color="white" />
                </View>
              )}
            </TouchableOpacity>

            <Text className="text-white text-xl font-bold">{displayName}</Text>
            {user?.username && (
              <Text className="text-primary-400 text-sm mt-0.5">
                @{user.username}
              </Text>
            )}
            <Text className="text-dark-500 text-xs mt-1">
              Member since {joinDate}
            </Text>
            {user?.email && (
              <View className="flex-row items-center gap-1.5 mt-2">
                <Ionicons name="mail-outline" size={13} color="#64748B" />
                <Text className="text-dark-400 text-xs">{user.email}</Text>
              </View>
            )}
          </View>
        </View>

        <View className="px-5 mb-6">
          <Text className="text-dark-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Your Learning Stats
          </Text>
          <View className="flex-row gap-3">
            <StatCard
              label="Enrolled"
              value={enrollments.size}
              icon="school-outline"
              color="#6366F1"
              bgColor="rgba(99,102,241,0.15)"
            />
            <StatCard
              label="Bookmarked"
              value={bookmarks.size}
              icon="bookmark-outline"
              color="#F59E0B"
              bgColor="rgba(245,158,11,0.15)"
            />
            <StatCard
              label="Progress"
              value={`${enrollments.size > 0 ? Math.floor(Math.random() * 40 + 10) : 0}%`}
              icon="trending-up-outline"
              color="#10B981"
              bgColor="rgba(16,185,129,0.15)"
            />
          </View>
        </View>

        <View className="px-5">
          <Text className="text-dark-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Settings
          </Text>
          <View className="bg-dark-800 rounded-2xl px-4 border border-dark-700">
            <SettingRow
              icon="notifications-outline"
              label="Notifications"
              onPress={handleNotificationSettings}
            />
            <SettingRow
              icon="person-outline"
              label="Account"
              value={user?.role ?? "student"}
              showArrow={false}
            />
            <SettingRow
              icon="shield-outline"
              label="Privacy & Security"
              onPress={() =>
                Alert.alert("Privacy", "Your data is stored securely using Expo SecureStore.")
              }
            />
            <SettingRow
              icon="information-circle-outline"
              label="About"
              value="v1.0.0"
              onPress={() =>
                Alert.alert(
                  "MiniLMS",
                  "Built with React Native Expo, TypeScript, NativeWind, and Zustand."
                )
              }
            />
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          >
            <Ionicons name="log-out-outline" size={18} color="#F43F5E" />
            <Text className="text-rose-400 font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}