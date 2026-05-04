import type { Course } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { memo, useCallback } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

interface Props {
  course: Course;
  onToggleBookmark: (id: string) => void;
}

const RATING_COLOR = (r: number) =>
  r >= 4.5 ? "#10B981" : r >= 3.5 ? "#F59E0B" : "#F43F5E";

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "bg-emerald-500/20 text-emerald-400",
  Intermediate: "bg-amber-500/20 text-amber-400",
  Advanced: "bg-rose-500/20 text-rose-400",
};

function CourseCardInner({ course, onToggleBookmark }: Props): React.JSX.Element {
  const handlePress = useCallback(() => {
    router.push(`/(course)/${course.id}`);
  }, [course.id]);

  const handleBookmark = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onToggleBookmark(course.id);
    },
    [course.id, onToggleBookmark]
  );

  const instructorName = `${course.instructor.name.first} ${course.instructor.name.last}`;
  const ratingColor = RATING_COLOR(course.rating);
  const levelStyle = LEVEL_COLORS[course.level] ?? "bg-primary-500/20 text-primary-400";

  return (
    <Pressable
      onPress={handlePress}
      className="bg-dark-800 rounded-2xl overflow-hidden mb-4 border border-dark-700 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`Course: ${course.title}`}
      accessibilityHint="Double tap to view course details"
    >
      <View className="relative">
        <Image
          source={{ uri: course?.thumbnail || 'https://picsum.photos/id/237/200/300' }}
          style={{ width: "100%", height: 180 }}
          contentFit="cover"
          recyclingKey={course.id}
          transition={300}
        />
        <View className="absolute top-3 left-3 flex-row gap-2">
          <View className={`px-2 py-1 rounded-lg ${levelStyle.split(" ")[0]}`}>
            <Text className={`text-xs font-semibold ${levelStyle.split(" ")[1]}`}>
              {course.level}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleBookmark}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-dark-900/80 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel={
            course.isBookmarked ? "Remove bookmark" : "Add bookmark"
          }
        >
          <Ionicons
            name={course.isBookmarked ? "bookmark" : "bookmark-outline"}
            size={18}
            color={course.isBookmarked ? "#6366F1" : "#CBD5E1"}
          />
        </TouchableOpacity>


        <View className="absolute bottom-3 right-3 bg-dark-900/90 rounded-lg px-2 py-1">
          <Text className="text-white text-sm font-bold">
            ${course.price.toFixed(2)}
          </Text>
        </View>
      </View>


      <View className="p-4">

        <Text className="text-primary-400 text-xs font-semibold uppercase tracking-wide mb-1">
          {course.category}
        </Text>

        <Text
          className="text-white text-base font-bold leading-snug mb-2"
          numberOfLines={2}
        >
          {course.title}
        </Text>

        <Text className="text-dark-400 text-sm leading-relaxed mb-3" numberOfLines={2}>
          {course.description}
        </Text>

        <View className="flex-row items-center gap-2 mb-3">
          <Image
            source={{ uri: course.instructor.picture.thumbnail }}
            style={{ width: 24, height: 24, borderRadius: 12 }}
            contentFit="cover"
          />
          <Text className="text-dark-300 text-xs" numberOfLines={1}>
            {instructorName}
          </Text>
          <Text className="text-dark-600 text-xs">•</Text>
          <Text className="text-dark-400 text-xs">
            {course.instructor.location.country}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={14} color={ratingColor} />
            <Text className="text-sm font-semibold" style={{ color: ratingColor }}>
              {course.rating.toFixed(1)}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={13} color="#64748B" />
            <Text className="text-dark-400 text-xs">{course.duration}</Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={13} color="#64748B" />
            <Text className="text-dark-400 text-xs">
              {course.studentsEnrolled.toLocaleString()}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="book-outline" size={13} color="#64748B" />
            <Text className="text-dark-400 text-xs">
              {course.lessonsCount} lessons
            </Text>
          </View>
        </View>

        {course.isEnrolled && (
          <View className="mt-3 bg-emerald-500/10 rounded-lg px-3 py-1.5 flex-row items-center gap-2">
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text className="text-emerald-400 text-xs font-medium">
              Enrolled
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export const CourseCard = memo(CourseCardInner);
