// ─── Auth Types ────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: {
    url: string;
    localPath: string;
  };
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Course Types ───────────────────────────────────────────────────────────────
export interface Instructor {
  id: string;
  name: {
    first: string;
    last: string;
    title?: string;
  };
  email: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  location: {
    city: string;
    country: string;
  };
  nat: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  category: string;
  thumbnail: string;
  images: string[];
  instructor: Instructor;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  studentsEnrolled: number;
  isEnrolled: boolean;
  isBookmarked: boolean;
  lessonsCount: number;
  brand: string;
}

// ─── API Response Types ─────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  statusCode: number;
  data: {
    data: T[];
    page: number;
    limit: number;
    totalPages: number;
    nextPage: boolean;
    serialNumberStartFrom: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: boolean | null;
  };
  message: string;
  success: boolean;
}

export interface RandomUserResponse {
  results: RawUser[];
  info: {
    seed: string;
    results: number;
    page: number;
    version: string;
  };
}

export interface RawUser {
  gender: string;
  name: {
    title: string;
    first: string;
    last: string;
  };
  location: {
    city: string;
    country: string;
  };
  email: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
  login?: {
    uuid: string;
  };
}

// ─── Navigation Types ───────────────────────────────────────────────────────────
export type RootStackParamList = {
  "(auth)/login": undefined;
  "(auth)/register": undefined;
  "(tabs)": undefined;
  "(course)/[id]": { id: string };
  "(course)/webview": { courseId: string; title: string };
};

// ─── Notification Types ─────────────────────────────────────────────────────────
export interface NotificationData {
  type: "bookmark" | "reminder" | "enrollment";
  courseId?: string;
  message?: string;
}

// ─── Store Types ────────────────────────────────────────────────────────────────
export interface BookmarkStore {
  bookmarks: string[];
  addBookmark: (courseId: string) => void;
  removeBookmark: (courseId: string) => void;
  isBookmarked: (courseId: string) => boolean;
  loadBookmarks: () => Promise<void>;
}

export interface EnrollmentStore {
  enrolled: string[];
  addEnrollment: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
  loadEnrollments: () => Promise<void>;
}

export interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  language: string;
}

// ─── WebView Message Types ──────────────────────────────────────────────────────
export interface WebViewMessage {
  type: "COURSE_DATA" | "USER_DATA" | "NAVIGATION" | "TRACK_PROGRESS";
  payload: Record<string, unknown>;
}

export interface WebViewIncomingMessage {
  type: "READY" | "PROGRESS_UPDATE" | "REQUEST_DATA" | "CLOSE";
  payload?: Record<string, unknown>;
}
