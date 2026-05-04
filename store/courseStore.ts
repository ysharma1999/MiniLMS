import { CourseService } from "@/services/courses";
import { AppStorage, STORAGE_KEYS } from "@/services/storage";
import type { Course } from "@/types";
import {
  scheduleBookmarkMilestoneNotification,
  sendEnrollmentNotification,
} from "@/utils/notifications";
import { create } from "zustand";

interface CourseStore {
  courses: Course[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  searchQuery: string;
  bookmarks: Set<string>;
  enrollments: Set<string>;

  fetchCourses: (reset?: boolean) => Promise<void>;
  refreshCourses: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  toggleBookmark: (courseId: string) => Promise<void>;
  enrollCourse: (courseId: string, courseTitle: string) => Promise<void>;
  loadPersistedData: () => Promise<void>;
  clearError: () => void;
}

const COURSES_PER_PAGE = 10;

export const useCourseStore = create<CourseStore>((set, get) => ({
  courses: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  page: 1,
  hasMore: true,
  searchQuery: "",
  bookmarks: new Set<string>(),
  enrollments: new Set<string>(),

  fetchCourses: async (reset = false) => {
    const { isLoading, page } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const currentPage = reset ? 1 : page;
      const newCourses = await CourseService.fetchCourses(
        currentPage,
        COURSES_PER_PAGE
      );

      const { bookmarks, enrollments } = get();

      const enrichedCourses = newCourses.map((c) => ({
        ...c,
        isBookmarked: bookmarks.has(c.id),
        isEnrolled: enrollments.has(c.id),
      }));

      set((state) => ({
        courses: reset
          ? enrichedCourses
          : [...state.courses, ...enrichedCourses],
        page: currentPage + 1,
        hasMore: newCourses.length === COURSES_PER_PAGE,
        isLoading: false,
      }));
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to load courses.",
        isLoading: false,
      });
    }
  },

  refreshCourses: async () => {
    set({ isRefreshing: true });
    try {
      const newCourses = await CourseService.fetchCourses(1, COURSES_PER_PAGE);
      const { bookmarks, enrollments } = get();

      const enrichedCourses = newCourses.map((c) => ({
        ...c,
        isBookmarked: bookmarks.has(c.id),
        isEnrolled: enrollments.has(c.id),
      }));

      set({
        courses: enrichedCourses,
        page: 2,
        hasMore: true,
        isRefreshing: false,
        error: null,
      });
    } catch {
      set({ isRefreshing: false });
    }
  },

  fetchNextPage: async () => {
    const { isLoading, hasMore } = get();
    if (isLoading || !hasMore) return;
    await get().fetchCourses();
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  toggleBookmark: async (courseId: string) => {
    const { bookmarks } = get();
    const newBookmarks = new Set(bookmarks);

    if (newBookmarks.has(courseId)) {
      newBookmarks.delete(courseId);
    } else {
      newBookmarks.add(courseId);
    }


    await AppStorage.setJSON(
      STORAGE_KEYS.BOOKMARKS,
      Array.from(newBookmarks)
    );

    set((state) => ({
      bookmarks: newBookmarks,
      courses: state.courses.map((c) =>
        c.id === courseId
          ? { ...c, isBookmarked: newBookmarks.has(courseId) }
          : c
      ),
    }));


    await scheduleBookmarkMilestoneNotification(newBookmarks.size);
  },

  enrollCourse: async (courseId: string, courseTitle: string) => {
    const { enrollments } = get();
    const newEnrollments = new Set(enrollments);
    newEnrollments.add(courseId);

    await AppStorage.setJSON(
      STORAGE_KEYS.ENROLLMENTS,
      Array.from(newEnrollments)
    );

    set((state) => ({
      enrollments: newEnrollments,
      courses: state.courses.map((c) =>
        c.id === courseId ? { ...c, isEnrolled: true } : c
      ),
    }));

    await sendEnrollmentNotification(courseTitle);
  },

  loadPersistedData: async () => {
    const [bookmarkArr, enrollmentArr] = await Promise.all([
      AppStorage.getJSON<string[]>(STORAGE_KEYS.BOOKMARKS),
      AppStorage.getJSON<string[]>(STORAGE_KEYS.ENROLLMENTS),
    ]);

    set({
      bookmarks: new Set(bookmarkArr ?? []),
      enrollments: new Set(enrollmentArr ?? []),
    });
  },

  clearError: () => set({ error: null }),
}));


export const useFilteredCourses = (): Course[] => {
  const { courses, searchQuery, bookmarks, enrollments } =
    useCourseStore();

  const enriched = courses.map((c) => ({
    ...c,
    isBookmarked: bookmarks.has(c.id),
    isEnrolled: enrollments.has(c.id),
  }));

  return CourseService.filterCourses(enriched, searchQuery);
};


export const useBookmarkedCourses = (): Course[] => {
  const { courses, bookmarks, enrollments } = useCourseStore();
  return courses
    .filter((c) => bookmarks.has(c.id))
    .map((c) => ({
      ...c,
      isBookmarked: true,
      isEnrolled: enrollments.has(c.id),
    }));
};
