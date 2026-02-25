import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  UserFilters,
  OverviewAnalytics,
  SiteConfig,
  Announcement,
  Course,
  CourseStatus,
} from "@/types";

export interface CreateCourseData {
  title: string;
  description: string;
  category: string;
  price?: number;
  isFree?: boolean;
  currency?: string;
  level?: string;
}

export const adminApi = {
  // Courses
  createCourse: async (data: CreateCourseData) => {
    const response = await apiClient.post<ApiResponse<Course>>(
      "/courses",
      data
    );
    return response.data;
  },

  updateCourse: async (id: string, data: Partial<Course>) => {
    const response = await apiClient.put<ApiResponse<Course>>(
      `/admin/courses/${id}`,
      data
    );
    return response.data;
  },

  deleteCourse: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/courses/${id}`
    );
    return response.data;
  },

  publishCourse: async (id: string) => {
    const response = await apiClient.put<ApiResponse<Course>>(
      `/admin/courses/${id}`,
      { status: "published" as CourseStatus }
    );
    return response.data;
  },

  archiveCourse: async (id: string) => {
    const response = await apiClient.put<ApiResponse<Course>>(
      `/admin/courses/${id}`,
      { status: "archived" as CourseStatus }
    );
    return response.data;
  },

  featureCourse: async (id: string, featured: boolean) => {
    const response = await apiClient.put<ApiResponse<Course>>(
      `/admin/courses/${id}`,
      { isFeatured: featured }
    );
    return response.data;
  },

  // Users
  getUsers: async (filters?: UserFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await apiClient.get<PaginatedResponse<User>>(
      `/admin/users?${params.toString()}`
    );
    return response.data;
  },

  getInstructors: async () => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      "/admin/users?role=instructor&limit=100"
    );
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await apiClient.put<ApiResponse<User>>(
      `/admin/users/${id}`,
      data
    );
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/users/${id}`
    );
    return response.data;
  },

  verifyUser: async (id: string) => {
    const response = await apiClient.post<ApiResponse<User>>(
      `/admin/users/${id}/verify`
    );
    return response.data;
  },

  /** Waive portal access payment for a user (grant access without payment). */
  waivePortalAccess: async (id: string) => {
    const response = await apiClient.post<ApiResponse<User>>(
      `/admin/users/${id}/waive-portal-access`
    );
    return response.data;
  },

  createUser: async (data: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "instructor" | "user";
    network?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<User>>(
      "/admin/users",
      data
    );
    return response.data;
  },

  // Analytics
  getOverview: async () => {
    const response = await apiClient.get<ApiResponse<OverviewAnalytics>>(
      "/admin/analytics/overview"
    );
    return response.data;
  },

  getCourseAnalytics: async () => {
    const response = await apiClient.get<ApiResponse<unknown>>(
      "/admin/analytics/courses"
    );
    return response.data;
  },

  getEnrollmentAnalytics: async () => {
    const response = await apiClient.get<ApiResponse<unknown>>(
      "/admin/analytics/enrollments"
    );
    return response.data;
  },

  getRevenueAnalytics: async () => {
    const response = await apiClient.get<ApiResponse<unknown>>(
      "/admin/analytics/revenue"
    );
    return response.data;
  },

  // Site Config
  getConfig: async () => {
    const response = await apiClient.get<ApiResponse<SiteConfig>>("/admin/config");
    return response.data;
  },

  updateConfig: async (data: Partial<SiteConfig>) => {
    const response = await apiClient.put<ApiResponse<SiteConfig>>(
      "/admin/config",
      data
    );
    return response.data;
  },

  // Payment Config
  getPaymentConfig: async () => {
    const response = await apiClient.get<ApiResponse<unknown>>("/admin/payment-config");
    return response.data;
  },

  updatePaymentConfig: async (data: unknown) => {
    const response = await apiClient.put<ApiResponse<unknown>>(
      "/admin/payment-config",
      data
    );
    return response.data;
  },

  // Announcements
  getAnnouncements: async (page = 1, limit = 10) => {
    const response = await apiClient.get<PaginatedResponse<Announcement>>(
      `/admin/announcements?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  createAnnouncement: async (data: {
    title: string;
    content: string;
    priority?: string;
    startsAt?: string;
    expiresAt?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<Announcement>>(
      "/admin/announcements",
      data
    );
    return response.data;
  },

  updateAnnouncement: async (id: string, data: Partial<Announcement>) => {
    const response = await apiClient.put<ApiResponse<Announcement>>(
      `/admin/announcements/${id}`,
      data
    );
    return response.data;
  },

  deleteAnnouncement: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/announcements/${id}`
    );
    return response.data;
  },

  // Enrollments
  getEnrollments: async (page = 1, limit = 100, status?: string, courseId?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append("status", status);
    if (courseId) params.append("course", courseId);

    const response = await apiClient.get<PaginatedResponse<unknown>>(
      `/admin/enrollments?${params.toString()}`
    );
    return response.data;
  },
};
