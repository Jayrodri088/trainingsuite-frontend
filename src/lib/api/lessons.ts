import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, Lesson, Material, Comment } from "@/types";

export const lessonsApi = {
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Lesson>>(`/lessons/${id}`);
    return response.data;
  },

  markComplete: async (id: string) => {
    const response = await apiClient.post<ApiResponse<{ progress: number; certificateIssued?: boolean }>>(
      `/lessons/${id}/complete`
    );
    return response.data;
  },

  getMaterials: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Material[]>>(
      `/lessons/${id}/materials`
    );
    return response.data;
  },

  getComments: async (id: string, page = 1, limit = 20) => {
    const response = await apiClient.get<PaginatedResponse<Comment>>(
      `/lessons/${id}/comments?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  createComment: async (id: string, content: string, parentId?: string) => {
    const response = await apiClient.post<ApiResponse<Comment>>(
      `/lessons/${id}/comments`,
      { content, parent: parentId }
    );
    return response.data;
  },
};
