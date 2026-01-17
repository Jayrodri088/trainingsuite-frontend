import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, CertificateWithDetails } from "@/types";

export const certificatesApi = {
  getAll: async (page = 1, limit = 10) => {
    const response = await apiClient.get<PaginatedResponse<CertificateWithDetails>>(
      `/certificates?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<CertificateWithDetails>>(
      `/certificates/${id}`
    );
    return response.data;
  },
};
