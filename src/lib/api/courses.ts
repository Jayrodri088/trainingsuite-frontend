import { apiClient, publicApiClient } from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  Course,
  CourseLevel,
  CourseStatus,
  CourseWithModules,
  CourseFilters,
  Rating,
  CourseQuiz,
  QuizSubmissionResult,
} from "@/types";

export interface CreateCourseData {
  title: string;
  description: string;
  category: string;
  network?: string;
  isFree?: boolean;
  price?: number;
  currency?: string;
  level?: string;
  duration?: number;
  requirements?: string[];
  objectives?: string[];
  tags?: string[];
  thumbnail?: string;
}

export interface UpdateCourseData
  extends Omit<Partial<CreateCourseData>, "network" | "level"> {
  status?: CourseStatus;
  level?: CourseLevel;
  isPublished?: boolean;
  thumbnail?: string;
  previewVideo?: string;
  /** Omit or set `null` to clear (server stores unset). */
  network?: string | null;
}

export const coursesApi = {
  getAll: async (filters?: CourseFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await apiClient.get<PaginatedResponse<Course>>(
      `/courses?${params.toString()}`
    );
    return response.data;
  },

  getAllPublic: async (filters?: CourseFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const response = await publicApiClient.get<PaginatedResponse<Course>>(
      `/courses?${params.toString()}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/${slug}`);
    return response.data;
  },

  getBySlugPublic: async (slug: string) => {
    const response = await publicApiClient.get<ApiResponse<Course>>(`/courses/${slug}`);
    return response.data;
  },

  getCurriculum: async (id: string) => {
    const response = await apiClient.get<ApiResponse<CourseWithModules>>(
      `/courses/${id}/curriculum`
    );
    return response.data;
  },

  create: async (data: CreateCourseData) => {
    const response = await apiClient.post<ApiResponse<Course>>("/courses", data);
    return response.data;
  },

  update: async (id: string, data: UpdateCourseData) => {
    const response = await apiClient.put<ApiResponse<Course>>(
      `/courses/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/courses/${id}`);
    return response.data;
  },

  enroll: async (id: string) => {
    const response = await apiClient.post<ApiResponse<{ enrollment: unknown }>>(
      `/courses/${id}/enroll`
    );
    return response.data;
  },

  getRatings: async (id: string, page = 1, limit = 10) => {
    const response = await apiClient.get<PaginatedResponse<Rating>>(
      `/courses/${id}/ratings?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  createRating: async (id: string, data: { rating: number; review?: string }) => {
    const response = await apiClient.post<ApiResponse<Rating>>(
      `/courses/${id}/ratings`,
      data
    );
    return response.data;
  },

  /** Get the discussion forum for a course (if one exists). Missing forum returns 200 with data null. */
  getForum: async (courseIdOrSlug: string) => {
    const response = await apiClient.get<
      ApiResponse<{ _id: string; title: string; description?: string; postCount?: number } | null>
    >(`/courses/${courseIdOrSlug}/forum`);
    return response.data;
  },

  /** Get the quiz for a course (requires enrollment and completion; hides correct answers). */
  getQuiz: async (courseIdOrSlug: string) => {
    const response = await apiClient.get<ApiResponse<CourseQuiz>>(
      `/courses/${courseIdOrSlug}/quiz`
    );
    return response.data;
  },

  /** Submit quiz answers for a course. */
  submitQuiz: async (courseIdOrSlug: string, answers: number[]) => {
    const response = await apiClient.post<ApiResponse<QuizSubmissionResult>>(
      `/courses/${courseIdOrSlug}/quiz/submit`,
      { answers }
    );
    return response.data;
  },
};
