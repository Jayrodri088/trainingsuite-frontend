"use client";

import Link from "next/link";
import { Star, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeUploadUrl } from "@/lib/utils";
import type { Course, Enrollment } from "@/types";
import { T, useT } from "@/components/t";

const CARD_GRADIENTS = [
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-amber-500 to-orange-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-pink-500 to-rose-600",
  "bg-gradient-to-br from-cyan-500 to-blue-600",
];

export function getLanguageNamePublic(code: string, languages: { code: string; name: string }[]): string {
  const lang = languages.find((l) => l.code === code?.toLowerCase());
  return lang?.name || code?.toUpperCase() || "Unknown";
}

export function CourseCardPublic({
  course,
  index,
  enrollment,
  viewMode = "grid",
  languages,
}: {
  course: Course;
  index: number;
  enrollment?: Enrollment;
  viewMode?: "grid" | "list";
  languages: { code: string; name: string }[];
}) {
  const { t } = useT();
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;
  const isCompleted = enrollment?.status === "completed" || progress >= 100;
  const isInProgress = isEnrolled && progress > 0 && !isCompleted;
  const isPaidCourse = !course.isFree && (course.price || 0) > 0;

  const getEnrollmentBadge = () => {
    if (isCompleted) return <Badge className="bg-green-600 hover:bg-green-600 text-xs rounded-[8px]"><T>Completed</T></Badge>;
    if (isInProgress) return <Badge className="bg-[#0052CC] hover:bg-[#003d99] text-xs rounded-[8px]"><T>In Progress</T></Badge>;
    if (isEnrolled) return <Badge className="bg-gray-600 hover:bg-gray-600 text-xs rounded-[8px]"><T>Enrolled</T></Badge>;
    return null;
  };

  const cardClass = "overflow-hidden group cursor-pointer rounded-[12px] border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow";
  const titleClass = "font-sans font-semibold text-black group-hover:text-[#0052CC] transition-colors";
  const btnPrimary = "rounded-[10px] bg-[#0052CC] hover:bg-[#003d99] text-white font-sans font-medium";

  if (viewMode === "list") {
    return (
      <Link href={`/courses/${course.slug || course._id}`}>
        <Card className={cardClass + " flex flex-col sm:flex-row"}>
          <div className={`h-40 sm:h-auto sm:w-48 md:w-56 ${gradient} relative overflow-hidden shrink-0`}>
            {normalizeUploadUrl(course.thumbnail) && (
              <img src={normalizeUploadUrl(course.thumbnail)} alt={t(course.title)} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <div className="absolute top-3 left-3 flex gap-2 flex-wrap sm:hidden">
              <Badge variant="secondary" className="text-xs capitalize rounded-[8px] bg-gray-100 text-gray-800">{t(course.level || "beginner")}</Badge>
              {getEnrollmentBadge()}
            </div>
          </div>
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex-1">
              <div className="hidden sm:flex gap-2 flex-wrap mb-2">
                <Badge variant="secondary" className="text-xs capitalize rounded-[8px] bg-gray-100 text-gray-800">{t(course.level || "beginner")}</Badge>
                {course.language && (
                  <Badge variant="outline" className="text-xs rounded-[8px] border-gray-200">
                    <Globe className="h-3 w-3 mr-1" />{getLanguageNamePublic(course.language, languages)}
                  </Badge>
                )}
                {getEnrollmentBadge()}
              </div>
              <h3 className={titleClass + " text-base line-clamp-2"}>{t(course.title)}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2 hidden sm:block">{course.description ? t(course.description.substring(0, 150)) : ""}</p>
              <div className="flex items-center gap-3 mt-2">
                {course.rating && course.rating > 0 ? (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" /><span className="text-xs font-medium">{course.rating.toFixed(1)}</span>
                  </div>
                ) : null}
                <span className="text-xs text-gray-500">{(course.enrollmentCount || 0).toLocaleString()} <T>enrolled</T></span>
                {isPaidCourse && (
                  <span className="text-xs font-medium text-emerald-700">
                    {(course.currency || "USD").toUpperCase()} {Number(course.price || 0).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
              {isEnrolled ? (
                <>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">{isCompleted ? <T>Completed</T> : <>{progress}% <T>complete</T></>}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-[#0052CC]"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                  </div>
                  <Button size="sm" className={`h-8 text-xs rounded-[10px] ${isCompleted ? "bg-green-600 hover:bg-green-700" : btnPrimary}`}>
                    {isCompleted ? <T>Review Course</T> : <T>Continue</T>}
                  </Button>
                </>
              ) : (
                <Button size="sm" className={"h-8 text-xs w-full sm:w-auto " + btnPrimary}>
                  {isPaidCourse ? <T>Buy Course</T> : <T>Start Training</T>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/courses/${course.slug || course._id}`}>
      <Card className={cardClass + " h-full"}>
        <div className={`h-36 ${gradient} relative overflow-hidden`}>
          {normalizeUploadUrl(course.thumbnail) && (
            <img src={normalizeUploadUrl(course.thumbnail)} alt={t(course.title)} className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs capitalize rounded-[8px] bg-white/90 text-gray-800 border-0">{t(course.level || "beginner")}</Badge>
            {course.language && (
              <Badge variant="outline" className="text-xs rounded-[8px] bg-white/90 border-gray-200">
                <Globe className="h-3 w-3 mr-1" />{getLanguageNamePublic(course.language, languages)}
              </Badge>
            )}
            {getEnrollmentBadge()}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className={titleClass + " text-sm line-clamp-2 min-h-[40px]"}>{t(course.title)}</h3>
          <div className="flex items-center gap-2 mt-2">
            {course.rating && course.rating > 0 ? (
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" /><span className="text-xs font-medium">{course.rating.toFixed(1)}</span>
              </div>
            ) : null}
            <span className="text-xs text-gray-500">{(course.enrollmentCount || 0).toLocaleString()} <T>enrolled</T></span>
            {isPaidCourse && (
              <span className="text-xs font-medium text-emerald-700">
                {(course.currency || "USD").toUpperCase()} {Number(course.price || 0).toFixed(2)}
              </span>
            )}
          </div>
          {isEnrolled ? (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">{isCompleted ? <T>Completed</T> : <>{progress}% <T>complete</T></>}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-[#0052CC]"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <Button size="sm" className={`h-7 text-xs w-full mt-2 rounded-[10px] font-sans font-medium ${isCompleted ? "bg-green-600 hover:bg-green-700" : btnPrimary}`}>
                {isCompleted ? <T>Review Course</T> : <T>Continue</T>}
              </Button>
            </div>
          ) : (
            <div className="mt-3">
              <Button size="sm" className={"h-7 text-xs w-full rounded-[10px] " + btnPrimary}>
                {isPaidCourse ? <T>Buy Course</T> : <T>Start Training</T>}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function CourseCardPublicSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[12px] border-gray-200 bg-white shadow-sm">
      <Skeleton className="h-36 w-full rounded-t-[12px] rounded-b-none" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-full rounded-[10px]" />
        <Skeleton className="h-4 w-3/4 rounded-[10px]" />
        <Skeleton className="h-3 w-1/2 rounded-[10px]" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-16 rounded-[10px]" />
          <Skeleton className="h-7 w-20 rounded-[10px]" />
        </div>
      </CardContent>
    </Card>
  );
}
