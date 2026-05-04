import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "./storage";


const API_BASE_URL = "https://api.freeapi.app";
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;


const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) return true; 
  const status = error.response.status;
  return status >= 500 || status === 429;
};


const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });


  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        const token = await SecureStore.getItemAsync(
          STORAGE_KEYS.ACCESS_TOKEN
        );
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
      }
      (config as InternalAxiosRequestConfig & { _retryCount?: number })
        ._retryCount =
        (
          config as InternalAxiosRequestConfig & {
            _retryCount?: number;
          }
        )._retryCount ?? 0;
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );


  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const config = error.config as
        | (InternalAxiosRequestConfig & { _retryCount?: number })
        | undefined;

      if (!config) return Promise.reject(error);

      const retryCount = config._retryCount ?? 0;

      if (error.response?.status === 401 && retryCount === 0) {
        config._retryCount = 1;
        try {
          const refreshToken = await SecureStore.getItemAsync(
            STORAGE_KEYS.REFRESH_TOKEN
          );
          if (refreshToken) {
            const refreshResponse = await axios.post(
              `${API_BASE_URL}/api/v1/users/refresh-token`,
              { refreshToken }
            );
            const newToken = refreshResponse.data?.data?.accessToken;
            if (newToken) {
              await SecureStore.setItemAsync(
                STORAGE_KEYS.ACCESS_TOKEN,
                newToken
              );
              config.headers = config.headers ?? {};
              config.headers.Authorization = `Bearer ${newToken}`;
              return instance(config);
            }
          }
        } catch {

          await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        }
        return Promise.reject(error);
      }


      if (isRetryableError(error) && retryCount < MAX_RETRIES) {
        config._retryCount = retryCount + 1;
        const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
        await sleep(delay);
        return instance(config);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createApiInstance();


export const parseApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      errors?: Record<string, string[]>;
    }>;

    if (!axiosError.response) {
      if (axiosError.code === "ECONNABORTED") {
        return "Request timed out. Please check your connection.";
      }
      return "Network error. Please check your internet connection.";
    }

    const data = axiosError.response.data;
    if (data?.message) return data.message;
    if (data?.errors) {
      const firstError = Object.values(data.errors)[0];
      if (Array.isArray(firstError)) return firstError[0];
    }

    const statusMessages: Record<number, string> = {
      400: "Invalid request. Please check your inputs.",
      401: "Authentication failed. Please log in again.",
      403: "You don't have permission to access this.",
      404: "Resource not found.",
      422: "Validation error. Please check your inputs.",
      429: "Too many requests. Please slow down.",
      500: "Server error. Please try again later.",
      503: "Service unavailable. Please try again later.",
    };

    return (
      statusMessages[axiosError.response.status] || "An unknown error occurred."
    );
  }

  if (error instanceof Error) return error.message;
  return "An unknown error occurred.";
};
