import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, Payment } from "@/types";

export interface InitializePaymentData {
  courseId: string;
  provider: "stripe" | "paystack";
}

export interface VerifyPaymentData {
  provider: "stripe" | "paystack";
  reference?: string;
  sessionId?: string;
}

export const paymentsApi = {
  initialize: async (data: InitializePaymentData) => {
    const response = await apiClient.post<ApiResponse<{ paymentUrl: string; reference: string }>>(
      "/payments/initialize",
      data
    );
    return response.data;
  },

  verify: async (data: VerifyPaymentData) => {
    const response = await apiClient.post<ApiResponse<Payment>>(
      "/payments/verify",
      data
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data;
  },

  getHistory: async (page = 1, limit = 10) => {
    const response = await apiClient.get<PaginatedResponse<Payment>>(
      `/payments/history?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  downloadReceipt: async (id: string) => {
    const response = await apiClient.get<Blob>(
      `/payments/${id}/receipt`,
      { responseType: "blob" }
    );
    return response.data;
  },
};
