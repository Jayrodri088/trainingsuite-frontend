"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LearnPageSkeleton() {
  return (
    <div className="min-h-screen flex bg-[#f5f5f5]">
      <div className="flex-1">
        <Skeleton className="aspect-video w-full rounded-t-[12px] rounded-b-none" />
        <div className="p-6 space-y-4 bg-white border border-gray-200 border-t-0 rounded-b-[12px] shadow-sm">
          <Skeleton className="h-8 w-2/3 rounded-[10px]" />
          <Skeleton className="h-4 w-full rounded-[10px]" />
          <Skeleton className="h-4 w-full rounded-[10px]" />
          <Skeleton className="h-4 w-3/4 rounded-[10px]" />
        </div>
      </div>
      <div className="w-80 border-l border-gray-200 bg-white hidden lg:block">
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-full rounded-[10px]" />
          <Skeleton className="h-24 w-full rounded-[12px]" />
          <Skeleton className="h-24 w-full rounded-[12px]" />
          <Skeleton className="h-24 w-full rounded-[12px]" />
        </div>
      </div>
    </div>
  );
}
