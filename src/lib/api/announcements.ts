import { apiClient } from "./client";
import type { PaginatedResponse, Announcement } from "@/types";

export const announcementsApi = {
  getAll: async (page = 1, limit = 10) => {
    const response = await apiClient.get<PaginatedResponse<Announcement>>(
      `/announcements?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};
