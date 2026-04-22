import { apiClient, publicApiClient } from "./client";
import type { ApiResponse, User } from "@/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  network: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/register",
      data
    );
    return response.data;
  },

  /** Public — email link opens the frontend; this calls the backend GET (no auth). */
  verifyEmail: async (token: string) => {
    const response = await publicApiClient.get<ApiResponse<null>>(
      `/auth/verify-email?token=${encodeURIComponent(token)}`
    );
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await publicApiClient.post<ApiResponse<null>>(
      "/auth/forgot-password",
      { email }
    );
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await publicApiClient.post<ApiResponse<null>>(
      "/auth/reset-password",
      data
    );
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await apiClient.put<ApiResponse<User>>(
      "/auth/profile",
      data
    );
    return response.data;
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/change-password",
      data
    );
    return response.data;
  },

  logout: async () => {
    return {
      success: true,
      data: null,
    } satisfies ApiResponse<null>;
  },

  getSessions: async () => {
    const response = await apiClient.get<
      ApiResponse<{ sessions: { id: string; sessionId: string; userAgent: string | null; lastActiveAt: string; createdAt: string; isCurrent: boolean }[] }>
    >("/auth/sessions");
    return response.data;
  },

  revokeOtherSessions: async () => {
    const response = await apiClient.delete<ApiResponse<{ revoked: number }>>("/auth/sessions");
    return response.data;
  },

  updateNotificationPreferences: async (
    prefs: Partial<import("@/types").NotificationPreferences>
  ) => {
    const response = await apiClient.put<
      ApiResponse<{ notificationPreferences: import("@/types").NotificationPreferences }>
    >("/auth/preferences", prefs);
    return response.data;
  },
};
