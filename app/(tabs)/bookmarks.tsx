import { CourseCard } from "@/components/CourseCard";
import { useBookmarkedCourses, useCourseStore } from "@/store/courseStore";
import type { Course } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function EmptyBookmarks(): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <View className="w-24 h-24 rounded-full bg-primary-500/10 border border-primary-500/20 items-center justify-center mb-5">
        <Ionicons name="bookmark-outline" size={40} color="#6366F1" />
      </View>
      <Text className="text-white text-xl font-bold mb-2 text-center">
        No bookmarks yet
      </Text>
      <Text className="text-dark-400 text-sm text-center leading-relaxed mb-6">
        Save courses you're interested in by tapping the bookmark icon. Bookmark 5+ courses to unlock special notifications!
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)")}
        className="bg-primary-500 rounded-xl px-6 py-3"
      >
        <Text className="text-white font-semibold">Browse Courses</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function BookmarksScreen(): React.JSX.Element {
  const bookmarkedCourses = useBookmarkedCourses();
  const toggleBookmark = useCourseStore((s) => s.toggleBookmark);

  const handleToggleBookmark = useCallback(
    (id: string) => toggleBookmark(id),
    [toggleBookmark]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Course>) => (
      <CourseCard course={item} onToggleBookmark={handleToggleBookmark} />
    ),
    [handleToggleBookmark]
  );

  const keyExtractor = useCallback((item: Course) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-dark-900" edges={["top"]}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold">Bookmarks 🔖</Text>
        <Text className="text-dark-400 text-sm mt-1">
          {bookmarkedCourses.length}{" "}
          {bookmarkedCourses.length === 1 ? "course" : "courses"} saved
        </Text>


        {bookmarkedCourses.length > 0 && bookmarkedCourses.length < 5 && (
          <View className="mt-3 bg-primary-500/10 border border-primary-500/20 rounded-xl px-4 py-3 flex-row items-center gap-2">
            <Ionicons name="gift-outline" size={16} color="#818CF8" />
            <Text className="text-primary-300 text-xs flex-1">
              Bookmark {5 - bookmarkedCourses.length} more to unlock a special notification! 🎉
            </Text>
          </View>
        )}

        {bookmarkedCourses.length >= 5 && (
          <View className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex-row items-center gap-2">
            <Ionicons name="trophy-outline" size={16} color="#10B981" />
            <Text className="text-emerald-400 text-xs flex-1">
              🎉 Milestone reached! You've bookmarked 5+ courses.
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={bookmarkedCourses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        ListEmptyComponent={<EmptyBookmarks />}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={8}
      />
    </SafeAreaView>
  );
}
