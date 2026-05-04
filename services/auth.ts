import type {
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types";
import { api } from "./api";
import { AppStorage, SecureStorage, STORAGE_KEYS } from "./storage";

export const AuthService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await api.post<{
      statusCode: number;
      data: { user: User; accessToken: string; refreshToken: string };
      message: string;
      success: boolean;
    }>("/api/v1/users/login", credentials);

    const { user, accessToken, refreshToken } = response.data.data;


    await SecureStorage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await SecureStorage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await SecureStorage.setJSON(STORAGE_KEYS.USER_DATA, user);

    return user;
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    await api.post<{
      statusCode: number;
      data: { user: User };
      message: string;
      success: boolean;
    }>("/api/v1/users/register", credentials);

    return AuthService.login({
      email: credentials.email,
      password: credentials.password,
    });
  },

  async logout(): Promise<void> {
    try {
      await api.post("/api/v1/users/logout");
    } finally {
      await SecureStorage.delete(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStorage.delete(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStorage.delete(STORAGE_KEYS.USER_DATA);
      await AppStorage.delete(STORAGE_KEYS.PREFERENCES);
    }
  },

  async getStoredUser(): Promise<User | null> {
    return SecureStorage.getJSON<User>(STORAGE_KEYS.USER_DATA);
  },

  async getStoredTokens(): Promise<AuthTokens | null> {
    const accessToken = await SecureStorage.get(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = await SecureStorage.get(STORAGE_KEYS.REFRESH_TOKEN);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },

  async validateToken(): Promise<User | null> {
    try {
      const response = await api.get<{
        data: User;
        success: boolean;
      }>("/api/v1/users/current-user");
      if (response.data.success) {
        await SecureStorage.setJSON(
          STORAGE_KEYS.USER_DATA,
          response.data.data
        );
        return response.data.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  async updateProfile(data: FormData): Promise<User> {
    const response = await api.patch<{
      data: User;
      success: boolean;
    }>("/api/v1/users/update-account", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await SecureStorage.setJSON(
      STORAGE_KEYS.USER_DATA,
      response.data.data
    );
    return response.data.data;
  },

  async updateAvatar(formData: FormData): Promise<User> {
    const response = await api.patch<{
      data: User;
      success: boolean;
    }>("/api/v1/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await SecureStorage.setJSON(
      STORAGE_KEYS.USER_DATA,
      response.data.data
    );
    return response.data.data;
  },
};
