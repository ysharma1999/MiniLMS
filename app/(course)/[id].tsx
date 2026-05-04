import { CourseService } from "@/services/courses";
import { useCourseStore } from "@/store/courseStore";
import type { Course } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const LEVEL_CONFIG = {
  Beginner: { color: "#10B981", bg: "rgba(16,185,129,0.15)", icon: "🌱" },
  Intermediate: { color: "#F59E0B", bg: "rgba(245,158,11,0.15)", icon: "⚡" },
  Advanced: { color: "#F43F5E", bg: "rgba(244,63,94,0.15)", icon: "🔥" },
};

function InfoChip({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}): React.JSX.Element {
  return (
    <View className="flex-row items-center gap-1.5 bg-dark-700 rounded-lg px-3 py-1.5">
      <Ionicons name={icon} size={13} color="#94A3B8" />
      <Text className="text-dark-300 text-xs">{label}</Text>
    </View>
  );
}

export default function CourseDetailScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toggleBookmark, enrollCourse, bookmarks, enrollments } =
    useCourseStore();

  const isBookmarked = bookmarks.has(id ?? "");
  const isEnrolled = enrollments.has(id ?? "");

  const loadCourse = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      // Try from store first
      const stored = useCourseStore
        .getState()
        .courses.find((c) => c.id === id);
      if (stored) {
        setCourse({
          ...stored,
          isBookmarked: bookmarks.has(id),
          isEnrolled: enrollments.has(id),
        });
        setIsLoading(false);
        return;
      }
      const fetched = await CourseService.fetchCourseById(id);
      if (!fetched) throw new Error("Course not found");
      setCourse({
        ...fetched,
        isBookmarked: bookmarks.has(id),
        isEnrolled: enrollments.has(id),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load course");
    } finally {
      setIsLoading(false);
    }
  }, [id, bookmarks, enrollments]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const handleEnroll = useCallback(() => {
    if (!course || !id) return;
    if (isEnrolled) {
      router.push({
        pathname: "/(course)/webview",
        params: { courseId: id, title: course.title },
      });
      return;
    }

    Alert.alert(
      "Enroll in Course",
      `Enroll in "${course.title}" for $${course.price.toFixed(2)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Enroll",
          onPress: async () => {
            await enrollCourse(id, course.title);
            setCourse((c) => (c ? { ...c, isEnrolled: true } : c));
            Alert.alert("🎉 Enrolled!", "You can now access the course content.", [
              {
                text: "Start Learning",
                onPress: () =>
                  router.push({
                    pathname: "/(course)/webview",
                    params: { courseId: id, title: course.title },
                  }),
              },
              { text: "Later", style: "cancel" },
            ]);
          },
        },
      ]
    );
  }, [course, id, isEnrolled, enrollCourse]);

  const handleBookmark = useCallback(() => {
    if (id) toggleBookmark(id);
    setCourse((c) => (c ? { ...c, isBookmarked: !c.isBookmarked } : c));
  }, [id, toggleBookmark]);

  const handleOpenContent = useCallback(() => {
    if (!course || !id) return;
    router.push({
      pathname: "/(course)/webview",
      params: { courseId: id, title: course.title },
    });
  }, [course, id]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-900 items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-dark-400 text-sm mt-3">Loading course...</Text>
      </SafeAreaView>
    );
  }

  if (error || !course) {
    return (
      <SafeAreaView className="flex-1 bg-dark-900 items-center justify-center px-6">
        <Ionicons name="alert-circle" size={40} color="#F43F5E" />
        <Text className="text-white text-lg font-bold mt-3 mb-2">
          Failed to load course
        </Text>
        <Text className="text-dark-400 text-sm text-center mb-6">
          {error ?? "Course not found"}
        </Text>
        <TouchableOpacity
          onPress={loadCourse}
          className="bg-primary-500 rounded-xl px-6 py-3 mb-3"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-dark-400 text-sm">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const levelConfig = LEVEL_CONFIG[course.level] ?? LEVEL_CONFIG.Beginner;
  const instructorName = `${course.instructor.name.title ?? ""} ${course.instructor.name.first} ${course.instructor.name.last}`.trim();
  const discountPct = Math.round(
    (1 - course.price / course.originalPrice) * 100
  );

  return (
    <SafeAreaView className="flex-1 bg-dark-900" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-dark-800 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
        </TouchableOpacity>
        <Text className="text-white font-semibold" numberOfLines={1}>
          Course Details
        </Text>
        <TouchableOpacity
          onPress={handleBookmark}
          className="w-10 h-10 rounded-full bg-dark-800 items-center justify-center"
        >
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isBookmarked ? "#6366F1" : "#94A3B8"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="relative">
          <Image
            source={{ uri: course.thumbnail }}
            style={{ width, height: 220 }}
            contentFit="cover"
          />
          <View className="absolute inset-0 bg-dark-900/30" />
          <View
            className="absolute bottom-3 left-4 flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ backgroundColor: levelConfig.bg }}
          >
            <Text>{levelConfig.icon}</Text>
            <Text className="font-semibold text-xs" style={{ color: levelConfig.color }}>
              {course.level}
            </Text>
          </View>
        </View>

        <View className="px-5 pt-5 pb-8">
          <Text className="text-primary-400 text-xs font-semibold uppercase tracking-widest mb-2">
            {course.category}
          </Text>


          <Text className="text-white text-2xl font-bold leading-tight mb-3">
            {course.title}
          </Text>


          <View className="flex-row items-center gap-3 mb-4 flex-wrap">
            <View className="flex-row items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={
                    course.rating >= star
                      ? "star"
                      : course.rating >= star - 0.5
                        ? "star-half"
                        : "star-outline"
                  }
                  size={14}
                  color="#F59E0B"
                />
              ))}
              <Text className="text-amber-400 text-sm font-bold ml-1">
                {course.rating.toFixed(1)}
              </Text>
            </View>
            <Text className="text-dark-500 text-sm">
              ({course.studentsEnrolled.toLocaleString()} students)
            </Text>
          </View>


          <View className="flex-row flex-wrap gap-2 mb-5">
            <InfoChip icon="time-outline" label={course.duration} />
            <InfoChip
              icon="book-outline"
              label={`${course.lessonsCount} lessons`}
            />
            <InfoChip
              icon="people-outline"
              label={`${course.studentsEnrolled.toLocaleString()} students`}
            />
            <InfoChip icon="globe-outline" label={course.instructor.nat} />
          </View>

          <View className="bg-dark-800 border border-primary-500/30 rounded-2xl p-4 mb-5">
            <View className="flex-row items-baseline gap-3 mb-3">
              <Text className="text-white text-3xl font-black">
                ${course.price.toFixed(2)}
              </Text>
              <Text className="text-dark-500 text-base line-through">
                ${course.originalPrice.toFixed(2)}
              </Text>
              <View className="bg-emerald-500/20 px-2 py-0.5 rounded-lg">
                <Text className="text-emerald-400 text-xs font-bold">
                  {discountPct}% OFF
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleEnroll}
              className={`rounded-xl py-4 items-center mb-2 ${isEnrolled ? "bg-emerald-500" : "bg-primary-500"
                }`}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={isEnrolled ? "play-circle-outline" : "school-outline"}
                  size={18}
                  color="white"
                />
                <Text className="text-white font-bold text-base">
                  {isEnrolled ? "Continue Learning" : "Enroll Now"}
                </Text>
              </View>
            </TouchableOpacity>

            {isEnrolled && (
              <TouchableOpacity
                onPress={handleOpenContent}
                className="bg-dark-700 rounded-xl py-3.5 items-center flex-row justify-center gap-2"
              >
                <Ionicons name="globe-outline" size={16} color="#94A3B8" />
                <Text className="text-dark-300 font-medium text-sm">
                  View Full Content
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mb-5">
            <Text className="text-white text-base font-bold mb-3">
              About This Course
            </Text>
            <Text className="text-dark-300 text-sm leading-relaxed">
              {course.description}
            </Text>
          </View>

          <View className="bg-dark-800 border border-dark-700 rounded-2xl p-4 mb-5">
            <Text className="text-dark-400 text-xs font-semibold uppercase tracking-widest mb-3">
              Instructor
            </Text>
            <View className="flex-row items-center gap-3">
              <Image
                source={{ uri: course.instructor.picture.large }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  borderWidth: 2,
                  borderColor: "#6366F1",
                }}
                contentFit="cover"
              />
              <View className="flex-1">
                <Text className="text-white font-bold">{instructorName}</Text>
                <Text className="text-dark-400 text-xs mt-0.5">
                  {course.instructor.location.city},{" "}
                  {course.instructor.location.country}
                </Text>
                <Text className="text-dark-500 text-xs mt-0.5">
                  {course.instructor.email}
                </Text>
              </View>
            </View>
          </View>

          {course.images.length > 1 && (
            <View className="mb-5">
              <Text className="text-white text-base font-bold mb-3">
                Course Preview
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {course.images.slice(0, 4).map((img, i) => (
                    <Image
                      key={i}
                      source={{ uri: img }}
                      style={{ width: 140, height: 90, borderRadius: 10 }}
                      contentFit="cover"
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View className="bg-dark-800 border border-dark-700 rounded-2xl p-4">
            <Text className="text-white text-base font-bold mb-3">
              What you'll learn
            </Text>
            {[
              "Fundamentals and core concepts",
              "Hands-on practical projects",
              "Real-world case studies",
              "Industry best practices",
              "Advanced techniques and patterns",
            ].map((item, i) => (
              <View key={i} className="flex-row items-start gap-2 mb-2.5">
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#10B981"
                  style={{ marginTop: 1 }}
                />
                <Text className="text-dark-300 text-sm flex-1">{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
