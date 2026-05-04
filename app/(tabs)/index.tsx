import { CourseCard } from "@/components/CourseCard";
import { SearchBar } from "@/components/SearchBar";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { useCourseStore, useFilteredCourses } from "@/store/courseStore";
import type { Course } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function EmptyState({ hasSearch }: { hasSearch: boolean }): React.JSX.Element {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-20 h-20 rounded-full bg-dark-800 items-center justify-center mb-4">
        <Ionicons
          name={hasSearch ? "search-outline" : "book-outline"}
          size={36}
          color="#475569"
        />
      </View>
      <Text className="text-white text-lg font-bold mb-2 text-center">
        {hasSearch ? "No courses found" : "No courses yet"}
      </Text>
      <Text className="text-dark-400 text-sm text-center">
        {hasSearch
          ? "Try a different search term"
          : "Pull down to refresh and load courses"}
      </Text>
    </View>
  );
}

function ListFooter({
  isLoading,
  hasMore,
}: {
  isLoading: boolean;
  hasMore: boolean;
}): React.JSX.Element | null {
  if (!isLoading) return null;
  return (
    <View className="py-4 items-center">
      <ActivityIndicator color="#6366F1" />
    </View>
  );
}

export default function CoursesScreen(): React.JSX.Element {
  const {
    isLoading,
    isRefreshing,
    error,
    hasMore,
    searchQuery,
    setSearchQuery,
    toggleBookmark,
    fetchCourses,
    refreshCourses,
    fetchNextPage,
    clearError,
  } = useCourseStore();

  const filteredCourses = useFilteredCourses();
  const isInitialLoad = useRef(false);

  useEffect(() => {
    if (!isInitialLoad.current) {
      isInitialLoad.current = true;
      fetchCourses(true);
    }
  }, [fetchCourses]);

  const handleToggleBookmark = useCallback(
    (id: string) => {
      toggleBookmark(id);
    },
    [toggleBookmark]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Course>) => (
      <CourseCard course={item} onToggleBookmark={handleToggleBookmark} />
    ),
    [handleToggleBookmark]
  );

  const keyExtractor = useCallback((item: Course) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <View className="mb-4">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {error && (
          <View className="mt-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 flex-row items-center gap-3">
            <Ionicons name="alert-circle" size={18} color="#F43F5E" />
            <Text className="text-rose-400 text-sm flex-1">{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={16} color="#F43F5E" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [searchQuery, setSearchQuery, error, clearError]
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-900" edges={["top"]}>
      <OfflineBanner />

      <View className="px-5 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold">
          Explore Courses 📚
        </Text>
        <Text className="text-dark-400 text-sm mt-1">
          {filteredCourses.length} courses available
        </Text>
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState hasSearch={searchQuery.length > 0} />
          ) : (
            <View className="py-12 items-center">
              <ActivityIndicator color="#6366F1" size="large" />
              <Text className="text-dark-400 text-sm mt-3">
                Loading courses...
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          <ListFooter isLoading={isLoading && filteredCourses.length > 0} hasMore={hasMore} />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshCourses}
            tintColor="#818CF8"
            colors={["#818CF8", "#A5B4FC"]}
            progressBackgroundColor="#1E293B"
            progressViewOffset={10}
          />
        }
        onEndReached={() => {
          if (!searchQuery && hasMore) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={10}
        initialNumToRender={6}
        updateCellsBatchingPeriod={50}
      />
    </SafeAreaView>
  );
}