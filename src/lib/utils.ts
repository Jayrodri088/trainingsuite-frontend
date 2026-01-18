import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("en-US", options || defaultOptions);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  return formatDate(date);
}

export function getLevelBadgeColor(level: string): string {
  switch (level) {
    case "beginner":
      return "bg-green-100 text-green-800";
    case "intermediate":
      return "bg-yellow-100 text-yellow-800";
    case "advanced":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "active":
    case "published":
    case "live":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "draft":
    case "scheduled":
      return "bg-yellow-100 text-yellow-800";
    case "expired":
    case "archived":
    case "cancelled":
      return "bg-gray-100 text-gray-800";
    case "pending":
      return "bg-orange-100 text-orange-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Transform media URLs (avatars, uploads) to use the correct backend URL.
 * Handles URLs that may contain localhost:3001 or relative paths.
 */
export function getMediaUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // If it's already using the correct API URL, return as-is
  if (apiUrl && url.startsWith(apiUrl)) {
    return url;
  }

  // Replace localhost:3001 or localhost:3000 with the API URL
  if (url.includes("localhost:3001") || url.includes("localhost:3000")) {
    const path = url.replace(/https?:\/\/localhost:\d+/, "");
    return apiUrl ? `${apiUrl.replace(/\/$/, "")}${path}` : url;
  }

  // If it's a relative path starting with /uploads, prepend API URL
  if (url.startsWith("/uploads")) {
    return apiUrl ? `${apiUrl.replace(/\/$/, "")}${url}` : url;
  }

  return url;
}
