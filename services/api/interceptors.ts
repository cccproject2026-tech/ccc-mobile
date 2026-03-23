import { useAuthStore } from "@/stores/auth.store";
import { storage } from "@/utils/storage";
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["Cache-Control"] = "no-cache";
      config.headers["Pragma"] = "no-cache";
    }

    // Clean up params: remove undefined, null, empty string, and "undefined" string values
    if (config.params) {
      if (__DEV__) {
        console.log("🔍 Before cleanup params:", JSON.stringify(config.params));
      }

      const cleanedParams: Record<string, any> = {};
      for (const [key, value] of Object.entries(config.params)) {
        // Only include valid values (not undefined, null, empty string, or "undefined")
        const stringValue = String(value);
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          value !== "undefined" &&
          stringValue !== "undefined" &&
          stringValue !== "null" &&
          (typeof value !== "string" || value.trim() !== "")
        ) {
          cleanedParams[key] = value;
        } else {
          if (__DEV__) {
            console.log(`🚫 Filtered out param ${key}:`, value, typeof value);
          }
        }
      }
      // Only set params if we have valid ones, otherwise remove it completely
      if (Object.keys(cleanedParams).length > 0) {
        config.params = cleanedParams;
        if (__DEV__) {
          console.log(
            "✅ After cleanup params:",
            JSON.stringify(config.params),
          );
        }
      } else {
        // Remove params entirely if empty
        delete config.params;
        if (__DEV__) {
          console.log("✅ Removed empty params object");
        }
      }
    }

    // Also check URL params if they exist in the URL string itself
    if (config.url && config.url.includes("undefined")) {
      console.warn('⚠️ URL contains "undefined":', config.url);
      config.url = config.url.replace(/[?&][^=]*=undefined/g, "");
      // Clean up any trailing ? or &
      config.url = config.url.replace(/[?&]$/, "");
    }

    if (__DEV__) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  },
);

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`📥 ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints
      if (
        originalRequest.url === ENDPOINTS.AUTH.LOGIN ||
        originalRequest.url === ENDPOINTS.AUTH.REFRESH_TOKEN ||
        originalRequest.url === ENDPOINTS.AUTH.SEND_OTP ||
        originalRequest.url === ENDPOINTS.AUTH.VERIFY_OTP ||
        originalRequest.url === ENDPOINTS.AUTH.SET_PASSWORD
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call your /refresh-token endpoint
        const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update stored tokens
        await storage.setTokens(accessToken, newRefreshToken);

        // Update Zustand store
        // useAuthStore.getState().setTokens({
        //     accessToken,
        //     refreshToken: newRefreshToken
        // });

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Logout user
        await useAuthStore.getState().logout();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const err = error as AxiosError & {
      statusCode?: number;
      errors?: unknown;
    };

    // Already-shaped API error (no Axios config) — e.g. re-thrown; don't label as "Network"
    if (typeof err.statusCode === "number" && !err.config) {
      if (__DEV__) {
        if (err.statusCode === 404) {
          console.log("📭 404", err.message);
        } else {
          console.error("❌ API Error:", {
            message: err.message,
            statusCode: err.statusCode,
            errors: err.errors,
          });
        }
      }
      return Promise.reject(error);
    }

    // No `response` yet: distinguish real offline/DNS/timeout from HTTP errors some stacks omit `response` for
    if (!err.response) {
      const msg = String(err.message || "");

      const statusFromAxiosMsg = msg.match(/status code (\d{3})\b/i);
      if (statusFromAxiosMsg) {
        const st = parseInt(statusFromAxiosMsg[1], 10);
        const apiError = {
          message: msg,
          statusCode: st,
          errors: undefined as undefined,
        };
        if (__DEV__) {
          const url = err.config?.url ?? "";
          if (st === 404) {
            console.log(`📭 404 ${url}`, apiError.message);
          } else {
            console.error("❌ API Error:", apiError);
          }
        }
        return Promise.reject(apiError);
      }

      // Server message in `message` but missing `response` (seen on some RN paths)
      const looksLikeKnownMissingResource =
        /\bnot found\b/i.test(msg) ||
        /thread for user\b/i.test(msg) ||
        /comment thread\b/i.test(msg);
      if (looksLikeKnownMissingResource && err.config) {
        const apiError = {
          message: msg,
          statusCode: 404,
          errors: undefined as undefined,
        };
        if (__DEV__) {
          console.log(`📭 404 ${err.config.url ?? ""}`, apiError.message);
        }
        return Promise.reject(apiError);
      }

      if (__DEV__) {
        console.error("❌ Network Error:", err.message);
      }
      return Promise.reject({
        message: "Network error. Please check your connection.",
        statusCode: 0,
      });
    }

    // Handle other errors
    const status = error.response?.status || 500;
    const apiError = {
      message: (error.response?.data as any)?.message || "An error occurred",
      statusCode: status,
      errors: (error.response?.data as any)?.errors,
    };

    if (__DEV__) {
      // 404 is often handled upstream (e.g. empty comment thread) — avoid red ERROR noise in Metro
      const url = (error.config as { url?: string })?.url ?? "";
      if (status === 404) {
        console.log(`📭 404 ${url}`, apiError.message);
      } else {
        console.error("❌ API Error:", apiError);
      }
    }

    return Promise.reject(apiError);
  },
);

if (__DEV__) {
  console.log("✅ API interceptors initialized");
}
