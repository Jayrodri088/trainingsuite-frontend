"use client";

import { useEffect, useState } from "react";
import type { Course } from "@/types";
import { coursePlaceholderGradientClass, normalizeUploadUrl } from "@/lib/utils";

/** Gradient fallback + load error handling for course banner images (dashboard, cards, etc.). */
export function useCourseThumbnail(course: Course | null) {
  const thumbSrc = course ? normalizeUploadUrl(course.thumbnail) : undefined;
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [thumbSrc]);
  const gradientClass = course
    ? coursePlaceholderGradientClass(course._id)
    : "bg-gradient-to-br from-slate-400 to-slate-600";
  return {
    thumbSrc,
    showImage: Boolean(thumbSrc) && !failed,
    onImageError: () => setFailed(true),
    gradientClass,
  };
}
