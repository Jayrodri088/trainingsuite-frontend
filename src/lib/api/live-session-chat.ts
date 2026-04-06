import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, LiveSessionChatMessage } from "@/types";

export const liveSessionChatApi = {
  list: async (courseIdOrSlug: string, page = 1, limit = 50) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    const response = await apiClient.get<PaginatedResponse<LiveSessionChatMessage>>(
      `/courses/${courseIdOrSlug}/chat?${params.toString()}`
    );
    return response.data;
  },

  send: async (courseIdOrSlug: string, message: string) => {
    const response = await apiClient.post<ApiResponse<LiveSessionChatMessage>>(
      `/courses/${courseIdOrSlug}/chat`,
      { message }
    );
    return response.data;
  },
};
