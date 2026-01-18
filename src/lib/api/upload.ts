import { apiClient } from "./client";
import type { ApiResponse } from "@/types";

interface UploadResponse {
  fileUrl: string;
  fileName: string;
  folder: string;
}

export const uploadApi = {
  uploadFile: async (file: File, folder: string = "general") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await apiClient.post<ApiResponse<UploadResponse>>(
      "/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  uploadThumbnail: async (file: File) => {
    return uploadApi.uploadFile(file, "thumbnails");
  },

  uploadAvatar: async (file: File) => {
    return uploadApi.uploadFile(file, "avatars");
  },
};
