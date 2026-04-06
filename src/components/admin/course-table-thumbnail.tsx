"use client";

import { BookOpen } from "lucide-react";
import type { Course } from "@/types";
import { useCourseThumbnail } from "@/hooks";
import { cn } from "@/lib/utils";

/** Small course thumbnail for admin tables: gradient fallback, no broken-image icon. */
export function CourseTableThumbnail({
  course,
  className,
}: {
  course: Course;
  className?: string;
}) {
  const thumb = useCourseThumbnail(course);
  return (
    <div
      className={cn(
        "h-12 w-16 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 rounded-lg relative",
        thumb.gradientClass,
        className
      )}
    >
      {thumb.showImage && thumb.thumbSrc ? (
        <img
          src={thumb.thumbSrc}
          alt={course.title}
          className="absolute inset-0 h-full w-full object-cover"
          onError={thumb.onImageError}
        />
      ) : (
        <BookOpen className="h-5 w-5 text-white/90 shrink-0" />
      )}
    </div>
  );
}
