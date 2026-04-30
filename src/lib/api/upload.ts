import { getApiBaseUrl } from "./base-url";
import type { ApiResponse } from "@/types";

interface UploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}

function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth-storage");
  if (!raw) return null;
  try {
    const { state } = JSON.parse(raw) as { state?: { token?: string } };
    return typeof state?.token === "string" ? state.token : null;
  } catch {
    return null;
  }
}

/**
 * Multipart uploads must not go through the JSON default headers on `apiClient`;
 * otherwise Axios can serialize FormData incorrectly. `fetch` lets the browser set
 * `multipart/form-data` with the correct boundary.
 */
async function postMultipartUpload(
  file: File,
  folder: string
): Promise<ApiResponse<UploadResponse>> {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const token = readAuthToken();
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${base}/upload`, {
    method: "POST",
    credentials: "include",
    headers,
    body: formData,
  });

  let json: ApiResponse<UploadResponse>;
  try {
    json = (await response.json()) as ApiResponse<UploadResponse>;
  } catch {
    throw new Error(`Upload failed (${response.status})`);
  }

  if (!response.ok || !json.success) {
    throw new Error(json.error || json.message || `Upload failed (${response.status})`);
  }

  return json;
}

export const uploadApi = {
  uploadFile: async (file: File, folder: string) => postMultipartUpload(file, folder),

  uploadThumbnail: async (file: File) => postMultipartUpload(file, "thumbnails"),

  uploadAvatar: async (file: File) => postMultipartUpload(file, "avatars"),
};
