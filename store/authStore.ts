import { AuthService } from "@/services/auth";
import type { LoginCredentials, RegisterCredentials, User } from "@/types";
import { create } from "zustand";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.login(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.register(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AuthService.logout();
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const user = await AuthService.validateToken();
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      }

      const storedUser = await AuthService.getStoredUser();
      if (storedUser) {
        set({ user: storedUser, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  updateUser: (user: User) => set({ user }),

  clearError: () => set({ error: null }),
}));
