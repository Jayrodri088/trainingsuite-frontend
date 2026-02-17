import { apiClient } from "./client";
import type { ApiResponse } from "@/types";

export interface InitializePaymentPayload {
  courseId: string;
  paymentMethod: string;
  currency?: string;
}

export interface InitializePaymentResponse {
  paymentId: string;
  amount: number;
  currency: string;
  provider: "stripe" | "paystack";
  checkoutUrl: string;
  sessionId: string;
}

export const paymentsApi = {
  initialize: async (data: InitializePaymentPayload) => {
    const response = await apiClient.post<ApiResponse<InitializePaymentResponse>>(
      "/payments/initialize",
      data
    );
    return response.data;
  },
};
