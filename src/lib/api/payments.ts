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

export interface InitializePortalAccessResponse {
  paymentId: string;
  amount: number;
  currency: string;
  provider: "stripe" | "paystack";
  checkoutUrl: string;
  sessionId: string;
}

export interface VerifySessionResponse {
  paid: boolean;
  payment_status: string;
  session_id: string;
  type: "portal_access" | "course";
}

export const paymentsApi = {
  initialize: async (data: InitializePaymentPayload) => {
    const response = await apiClient.post<ApiResponse<InitializePaymentResponse>>(
      "/payments/initialize",
      data
    );
    return response.data;
  },

  /** Initialize one-time $1 portal access (identity verification) payment. */
  initializePortalAccess: async () => {
    const response = await apiClient.post<ApiResponse<InitializePortalAccessResponse>>(
      "/payments/initialize-portal-access"
    );
    return response.data;
  },

  /** Verify Stripe Checkout Session (match PHP stripe-success.php: ensure payment_status === 'paid'). */
  verifySession: async (sessionId: string) => {
    const response = await apiClient.get<ApiResponse<VerifySessionResponse>>(
      `/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`
    );
    return response.data;
  },
};
