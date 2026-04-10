import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types";

export interface PastorChrisQuestion {
  _id: string;
  question: string;
  answer?: string;
  status: "pending" | "answered" | "dismissed";
  askedBy: { _id: string; name: string; email: string; avatar?: string; network?: string };
  answeredBy?: { _id: string; name: string; avatar?: string };
  answeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PastorChrisStats {
  total: number;
  pending: number;
  answered: number;
  dismissed: number;
}

export const pastorChrisApi = {
  // User: submit a question
  askQuestion: async (question: string) => {
    const response = await apiClient.post<ApiResponse<PastorChrisQuestion>>(
      "/pastor-chris/questions",
      { question }
    );
    return response.data;
  },

  // User: get own questions
  getMyQuestions: async (page = 1, limit = 10) => {
    const response = await apiClient.get<PaginatedResponse<PastorChrisQuestion>>(
      `/pastor-chris/questions?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Admin: get all questions with optional status filter
  adminGetQuestions: async (page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append("status", status);
    const response = await apiClient.get<PaginatedResponse<PastorChrisQuestion>>(
      `/admin/pastor-chris/questions?${params.toString()}`
    );
    return response.data;
  },

  // Admin: get stats
  adminGetStats: async () => {
    const response = await apiClient.get<ApiResponse<PastorChrisStats>>(
      "/admin/pastor-chris/questions?stats=1"
    );
    return response.data;
  },

  // Admin: answer or dismiss a question
  adminUpdateQuestion: async (
    id: string,
    data: { answer?: string; status?: "pending" | "answered" | "dismissed" }
  ) => {
    const response = await apiClient.put<ApiResponse<PastorChrisQuestion>>(
      `/admin/pastor-chris/questions/${id}`,
      data
    );
    return response.data;
  },

  // Admin: delete a question
  adminDeleteQuestion: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/admin/pastor-chris/questions/${id}`
    );
    return response.data;
  },
};
