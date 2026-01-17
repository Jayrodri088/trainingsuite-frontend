import { apiClient } from "./client";
import type { ApiResponse, User } from "@/types";

export const usersApi = {
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  // Public endpoint for instructor profiles
  getInstructorProfile: async (id: string) => {
    const response = await apiClient.get<ApiResponse<User>>(`/instructors/${id}`);
    return response.data;
  },

  getInstructors: async () => {
    const response = await apiClient.get<ApiResponse<User[]>>("/instructors");
    return response.data;
  },
};
