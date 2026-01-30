"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course, Enrollment } from "@/types";
import { normalizeUploadUrl } from "@/lib/utils";
import { T, useT } from "@/components/t";

export function CourseCard({ course, enrollment }: { course: Course; enrollment?: Enrollment }) {
  const { t } = useT();
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;
  const isCompleted = enrollment?.status === "completed" || progress >= 100;

  const thumbnailSrc = normalizeUploadUrl(course.thumbnail) || "/Images/course.png";

  return (
    <Link href={`/courses/${course.slug || course._id}`} className="block h-full group">
      <div className="h-full flex flex-col bg-white border border-gray-200 rounded-[12px] overflow-hidden transition-colors hover:border-gray-300">
        <div className="relative aspect-video bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-xl">
          <Image
            src={thumbnailSrc}
            alt={t(course.title)}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col flex-1 p-5">
          <div className="flex justify-between items-center mb-3">
            {course.rating != null && course.rating > 0 ? (
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-black">{course.rating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">{course.ratingCount ?? 0} <T>ratings</T></span>
            )}
            <span className="text-sm text-gray-500"><T>Video Course</T></span>
          </div>

          <h3 className="font-sans text-lg font-bold text-black mb-4 leading-tight line-clamp-2 group-hover:underline decoration-1 underline-offset-2">
            {t(course.title)}
          </h3>

          <div className="mt-auto pt-2">
            {isEnrolled ? (
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <T>Progress</T>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0052CC] rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="inline-flex w-full justify-center rounded-lg border border-gray-300 bg-gray-50 py-2.5 text-sm font-medium text-gray-800">
                  {isCompleted ? <T>Review</T> : <T>Continue</T>}
                </span>
              </div>
            ) : (
              <span
                className="inline-flex w-full justify-center rounded-[12px] border border-[#D4D4D4] bg-white py-2.5 text-sm font-medium text-gray-800 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)] outline outline-1 outline-white/10 outline-offset-0 group-hover:bg-gray-50 transition-colors"
              >
                <T>Start Learning</T>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden h-full bg-white">
      <Skeleton className="aspect-video w-full rounded-t-xl rounded-b-none" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-12 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
        <Skeleton className="h-5 w-full rounded-md" />
        <Skeleton className="h-5 w-4/5 rounded-md" />
        <div className="pt-2">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
