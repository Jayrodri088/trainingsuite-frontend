import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, Category } from "@/types";

export const categoriesApi = {
  getAll: async () => {
    const response = await apiClient.get<PaginatedResponse<Category>>("/categories");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: { name: string; description?: string; icon?: string }) => {
    const response = await apiClient.post<ApiResponse<Category>>("/categories", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Category>) => {
    const response = await apiClient.put<ApiResponse<Category>>(
      `/categories/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/categories/${id}`);
    return response.data;
  },
};
