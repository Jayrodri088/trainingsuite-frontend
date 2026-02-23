import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, Lesson, Material, Comment, Module } from "@/types";

export interface CreateModuleData {
  title: string;
  description?: string;
  order?: number;
}

export type UpdateModuleData = Partial<CreateModuleData>;

export interface CreateLessonData {
  title: string;
  description?: string;
  content?: string;
  type?: "video" | "text";
  videoUrl?: string;
  videoDuration?: number;
  isFree?: boolean;
  order?: number;
}

export type UpdateLessonData = Partial<CreateLessonData>;

export const modulesApi = {
  create: async (courseId: string, data: CreateModuleData) => {
    const response = await apiClient.post<ApiResponse<Module>>(
      `/courses/${courseId}/modules`,
      data
    );
    return response.data;
  },

  update: async (moduleId: string, data: UpdateModuleData) => {
    const response = await apiClient.put<ApiResponse<Module>>(
      `/modules/${moduleId}`,
      data
    );
    return response.data;
  },

  delete: async (moduleId: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/modules/${moduleId}`);
    return response.data;
  },

  reorder: async (courseId: string, moduleIds: string[]) => {
    const response = await apiClient.put<ApiResponse<Module[]>>(
      `/courses/${courseId}/modules/reorder`,
      { moduleIds }
    );
    return response.data;
  },
};

export const lessonsApi = {
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Lesson>>(`/lessons/${id}`);
    return response.data;
  },

  create: async (moduleId: string, data: CreateLessonData) => {
    const response = await apiClient.post<ApiResponse<Lesson>>(
      `/modules/${moduleId}/lessons`,
      data
    );
    return response.data;
  },

  update: async (lessonId: string, data: UpdateLessonData) => {
    const response = await apiClient.put<ApiResponse<Lesson>>(
      `/lessons/${lessonId}`,
      data
    );
    return response.data;
  },

  delete: async (lessonId: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/lessons/${lessonId}`);
    return response.data;
  },

  reorder: async (moduleId: string, lessonIds: string[]) => {
    const response = await apiClient.put<ApiResponse<Lesson[]>>(
      `/modules/${moduleId}/lessons/reorder`,
      { lessonIds }
    );
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

  addMaterial: async (lessonId: string, data: { title: string; fileUrl: string; fileType: string; fileSize?: number }) => {
    const response = await apiClient.post<ApiResponse<Material>>(
      `/lessons/${lessonId}/materials`,
      data
    );
    return response.data;
  },

  deleteMaterial: async (materialId: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/materials/${materialId}`
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
