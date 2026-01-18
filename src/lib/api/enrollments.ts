import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, EnrollmentWithCourse } from "@/types";

export const enrollmentsApi = {
  getAll: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append("status", status);

    const response = await apiClient.get<PaginatedResponse<EnrollmentWithCourse>>(
      `/enrollments?${params.toString()}`
    );
    return response.data;
  },

  getMyEnrollments: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append("status", status);

    const response = await apiClient.get<PaginatedResponse<EnrollmentWithCourse>>(
      `/enrollments?${params.toString()}`
    );
    return response.data;
  },

  getByCourse: async (courseId: string) => {
    const response = await apiClient.get<ApiResponse<EnrollmentWithCourse>>(
      `/enrollments/${courseId}`
    );
    return response.data;
  },

  getEnrollmentByCourse: async (courseId: string) => {
    // Check if user is enrolled in a specific course - same as getByCourse
    const response = await apiClient.get<ApiResponse<EnrollmentWithCourse>>(
      `/enrollments/${courseId}`
    );
    return response.data;
  },

  checkEnrollment: async (courseId: string) => {
    // Check enrollment status for a course
    const response = await apiClient.get<ApiResponse<{ isEnrolled: boolean; enrollment?: EnrollmentWithCourse }>>(
      `/courses/${courseId}/enrollment`
    );
    return response.data;
  },

  enroll: async (courseId: string) => {
    // Enroll in a course (for free courses or after payment)
    const response = await apiClient.post<ApiResponse<EnrollmentWithCourse>>(
      `/courses/${courseId}/enroll`
    );
    return response.data;
  },

  updateProgress: async (enrollmentId: string, lessonId: string, progress: number) => {
    const response = await apiClient.patch<ApiResponse<EnrollmentWithCourse>>(
      `/enrollments/${enrollmentId}/progress`,
      { lessonId, progress }
    );
    return response.data;
  },
};
