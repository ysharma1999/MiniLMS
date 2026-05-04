import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";


export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  BOOKMARKS: "bookmarks",
  ENROLLMENTS: "enrollments",
  LAST_OPENED: "last_opened",
  PREFERENCES: "preferences",
  COURSE_PROGRESS: "course_progress",
} as const;


export const SecureStorage = {
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },

  async delete(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
};


export const AppStorage = {
  async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },

  async get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },

  async delete(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async multiGet(keys: string[]): Promise<Record<string, string | null>> {
    const pairs = await AsyncStorage.multiGet(keys);
    return Object.fromEntries(pairs.map(([k, v]) => [k, v]));
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  },
};


export const trackAppOpen = async (): Promise<void> => {
  await AppStorage.set(STORAGE_KEYS.LAST_OPENED, Date.now().toString());
};

export const getLastOpened = async (): Promise<Date | null> => {
  const raw = await AppStorage.get(STORAGE_KEYS.LAST_OPENED);
  if (!raw) return null;
  return new Date(parseInt(raw, 10));
};

export const hasBeenInactiveFor24Hours = async (): Promise<boolean> => {
  const lastOpened = await getLastOpened();
  if (!lastOpened) return true;
  const diff = Date.now() - lastOpened.getTime();
  return diff >= 24 * 60 * 60 * 1000;
};
