import { apiClient } from "./client";
import type { ApiResponse } from "@/types";

interface VideoDurationResponse {
  duration: number;
}

export const utilsApi = {
  /**
   * Get video duration from a URL using the backend (bypasses CORS).
   * @param url - The video URL
   * @returns Duration in minutes, or null if extraction fails
   */
  getVideoDuration: async (url: string): Promise<number | null> => {
    try {
      const response = await apiClient.post<ApiResponse<VideoDurationResponse>>(
        "/utils/video-duration",
        { url }
      );
      return response.data.data?.duration ?? null;
    } catch {
      return null;
    }
  },
};
