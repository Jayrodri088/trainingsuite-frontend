import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, EnrollmentWithCourse } from "@/types";

export const enrollmentsApi = {
  getMyEnrollments: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append("status", status);

    const response = await apiClient.get<PaginatedResponse<EnrollmentWithCourse>>(
      `/enrollments?${params.toString()}`
    );
    return response.data;
  },

  getEnrollmentByCourse: async (courseId: string) => {
    const response = await apiClient.get<ApiResponse<EnrollmentWithCourse>>(
      `/enrollments/${courseId}`
    );
    return response.data;
  },
};
