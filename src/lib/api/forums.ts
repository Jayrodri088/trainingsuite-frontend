import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, Forum, ForumPost, Comment } from "@/types";

export const forumsApi = {
  getAll: async (page = 1, limit = 10) => {
    const response = await apiClient.get<PaginatedResponse<Forum>>(
      `/forums?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Forum>>(`/forums/${id}`);
    return response.data;
  },

  create: async (data: { title: string; description?: string; course?: string; isGeneral?: boolean }) => {
    const response = await apiClient.post<ApiResponse<Forum>>("/forums", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Forum>) => {
    const response = await apiClient.put<ApiResponse<Forum>>(`/forums/${id}`, data);
    return response.data;
  },

  getPosts: async (id: string, page = 1, limit = 10) => {
    const response = await apiClient.get<PaginatedResponse<ForumPost>>(
      `/forums/${id}/posts?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  createPost: async (id: string, data: { title: string; content: string }) => {
    const response = await apiClient.post<ApiResponse<ForumPost>>(
      `/forums/${id}/posts`,
      data
    );
    return response.data;
  },

  getPost: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ForumPost>>(`/posts/${id}`);
    return response.data;
  },

  updatePost: async (id: string, data: Partial<ForumPost>) => {
    const response = await apiClient.put<ApiResponse<ForumPost>>(`/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/posts/${id}`);
    return response.data;
  },

  getComments: async (postId: string, page = 1, limit = 20) => {
    const response = await apiClient.get<PaginatedResponse<Comment>>(
      `/posts/${postId}/comments?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  createComment: async (postId: string, content: string, parentId?: string) => {
    const response = await apiClient.post<ApiResponse<Comment>>(
      `/posts/${postId}/comments`,
      { content, parent: parentId }
    );
    return response.data;
  },

  likePost: async (postId: string) => {
    const response = await apiClient.post<ApiResponse<{ likes: number; isLiked: boolean }>>(
      `/posts/${postId}/like`
    );
    return response.data;
  },

  unlikePost: async (postId: string) => {
    const response = await apiClient.delete<ApiResponse<{ likes: number; isLiked: boolean }>>(
      `/posts/${postId}/like`
    );
    return response.data;
  },

  likeComment: async (commentId: string) => {
    const response = await apiClient.post<ApiResponse<{ likes: number; isLiked: boolean }>>(
      `/comments/${commentId}/like`
    );
    return response.data;
  },

  unlikeComment: async (commentId: string) => {
    const response = await apiClient.delete<ApiResponse<{ likes: number; isLiked: boolean }>>(
      `/comments/${commentId}/like`
    );
    return response.data;
  },
};
