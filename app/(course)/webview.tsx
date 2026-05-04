import { useCourseStore } from "@/store/courseStore";
import type { Course, WebViewIncomingMessage } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useAssets } from "expo-asset";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Text, TouchableOpacity, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

export default function CourseWebViewScreen(): React.JSX.Element {
  const { courseId, title } = useLocalSearchParams<{ courseId: string; title: string }>();
  const webViewRef = useRef<WebView>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Robust asset resolution for Android Expo Go and production
  const [assets, assetError] = useAssets([require("@/assets/html/course-content.html")]);

  const navigation = useNavigation();
  const { courses, enrollCourse, enrollments } = useCourseStore();

  const storeCourse = courses.find((c) => c.id === courseId);
  const [course, setCourse] = useState<Course | undefined>(storeCourse);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title
        ? title.length > 28 ? title.slice(0, 28) + "…" : title
        : "Course Content",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginLeft: 8, marginRight: 16 }}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => { setHasError(false); setIsLoading(true); webViewRef.current?.reload(); }}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="reload-outline" size={20} color="#94A3B8" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title]);

  // Fetch course if not in store
  useEffect(() => {
    if (!course && courseId) {
      import("@/services/courses").then(({ CourseService }) => {
        CourseService.fetchCourseById(courseId)
          .then((f) => { if (f) setCourse(f); else setHasError(true); })
          .catch(() => setHasError(true));
      });
    }
  }, [course, courseId]);

  // Handle hardware back button for Android WebView
  useEffect(() => {
    const onBackPress = () => {
      router.back();
      return true; // Force exit to prevent WebView trapping the event
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, []);

  const injectedJS = course
    ? `
      (function() {
        var data = ${JSON.stringify({
      type: "COURSE_DATA",
      payload: {
        ...course,
        isEnrolled: enrollments.has(courseId ?? ""),
      },
    })};
        window.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(data) }));
        document.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(data) }));
      })();
      true;
    `
    : undefined;

  // Handle messages FROM the WebView (user interactions)
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const msg: WebViewIncomingMessage = JSON.parse(event.nativeEvent.data);
      if (msg.type === "READY") {
        setIsLoading(false);
      } else if (msg.type === "TRACK_PROGRESS" && msg.payload?.action === "enroll" && courseId && course?.title) {
        enrollCourse(courseId, course.title);
      } else if (msg.type === "CLOSE") {
        router.back();
      }
    } catch { }
  }, [courseId, course, enrollCourse]);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    if (injectedJS) {
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(injectedJS);
      }, 200);
    }
  }, [injectedJS]);

  if (hasError) {
    return (
      <View className="flex-1 bg-dark-900 items-center justify-center px-6">
        <Ionicons name="wifi-outline" size={40} color="#F43F5E" />
        <Text className="text-white text-lg font-bold mt-4 mb-2">Content Failed to Load</Text>
        <Text className="text-dark-400 text-sm text-center mb-6">
          Unable to display course content. Please try again.
        </Text>
        <TouchableOpacity
          onPress={() => { setHasError(false); setIsLoading(true); webViewRef.current?.reload(); }}
          className="bg-primary-500 rounded-xl px-6 py-3 mb-3"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-dark-400 text-sm">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!course || !assets) {
    return (
      <View className="flex-1 bg-dark-900 items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-dark-400 text-sm mt-3">
          {!course ? "Fetching course details…" : "Loading assets…"}
        </Text>
      </View>
    );
  }

  // Use the localUri if available (downloaded locally), fallback to uri (remote/metro)
  const htmlSource = { uri: assets[0].localUri ?? assets[0].uri };

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      {isLoading && (
        <View
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 10, backgroundColor: "#0F172A",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={{ color: "#64748B", fontSize: 14, marginTop: 12 }}>
            Loading course content…
          </Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={htmlSource}
        onMessage={handleMessage}
        onLoadEnd={handleLoadEnd}
        onError={(e) => { 
          console.log("WebView Error:", e.nativeEvent);
          setIsLoading(false); 
          setHasError(true); 
        }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        originWhitelist={["*"]}
        style={{ flex: 1, backgroundColor: "#0F172A" }}
        onLoadStart={() => setIsLoading(true)}
      />
    </View>
  );
}