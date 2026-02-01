"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CourseCardPublicSkeleton } from "./course-card-public";

export function CoursesLoading() {
  return (
    <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2 rounded-[10px]" />
        <Skeleton className="h-5 w-72 rounded-[10px]" />
      </div>
      <div className="flex gap-3 mb-6">
        <Skeleton className="h-10 w-64 rounded-[10px]" />
        <Skeleton className="h-10 w-44 rounded-[10px]" />
      </div>
      <div className="flex gap-8">
        <aside className="hidden lg:block w-[200px] shrink-0">
          <Skeleton className="h-96 w-full rounded-[12px]" />
        </aside>
        <div className="flex-1">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <CourseCardPublicSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
