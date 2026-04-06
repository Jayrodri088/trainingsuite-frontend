"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  PlayCircle,
  Clock,
  CheckCircle,
  Search,
  Grid3X3,
  List,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollments, useCourseThumbnail } from "@/hooks";
import type { Enrollment, Course } from "@/types";
import { cn } from "@/lib/utils";
import { T, useT } from "@/components/t";

function CourseCard({ enrollment }: { enrollment: Enrollment }) {
  const { t } = useT();
  const course = typeof enrollment.course === "object" ? enrollment.course : null;
  const thumb = useCourseThumbnail(course);
  const progress = enrollment.progress || 0;
  const isCompleted = progress >= 100;

  if (!course) return null;

  return (
    <Link href={`/courses/${course.slug || course._id}/learn`}>
      <Card className="rounded-xl border-gray-200 group cursor-pointer h-full hover:border-gray-300 transition-colors bg-white shadow-sm overflow-hidden">
        <div
          className={cn(
            "h-32 border-b border-gray-200 relative flex items-center justify-center overflow-hidden rounded-t-[12px]",
            thumb.gradientClass
          )}
        >
          {thumb.showImage && thumb.thumbSrc ? (
            <Image
              src={thumb.thumbSrc}
              alt={t(course.title)}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              onError={thumb.onImageError}
            />
          ) : (
            <PlayCircle className="h-10 w-10 text-white/80 opacity-90 group-hover:scale-110 transition-all relative z-0" />
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="rounded-lg text-[10px] font-semibold border-0 bg-white/90 text-gray-800 backdrop-blur-sm">
              {t(course.level || "beginner")}
            </Badge>
          </div>
          {isCompleted && (
            <div className="absolute top-3 right-3">
              <Badge className="rounded-lg bg-green-600 hover:bg-green-600 text-[10px] font-semibold border-0">
                <CheckCircle className="h-3 w-3 mr-1" />
                <T>Completed</T>
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <h3 className="font-sans font-bold text-black text-sm line-clamp-2 min-h-[40px] group-hover:text-[#0052CC] transition-colors">
            {t(course.title)}
          </h3>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-sans text-gray-600 font-medium"><T>Progress</T></span>
              <span className="font-sans text-gray-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 rounded-full bg-gray-200 [&>div]:bg-[#0052CC]" />
          </div>

          <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
            {course.rating && course.rating > 0 ? (
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs font-sans font-semibold">{course.rating.toFixed(1)}</span>
              </div>
            ) : (
              <div />
            )}
            <Button size="sm" className="h-8 rounded-lg text-xs font-semibold border border-gray-300 bg-gray-50 text-gray-800 hover:bg-gray-100">
              {isCompleted ? <T>Review</T> : <T>Continue</T>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CourseListItem({ enrollment }: { enrollment: Enrollment }) {
  const { t } = useT();
  const course = typeof enrollment.course === "object" ? enrollment.course : null;
  const thumb = useCourseThumbnail(course);
  const progress = enrollment.progress || 0;
  const isCompleted = progress >= 100;

  if (!course) return null;

  return (
    <Link href={`/courses/${course.slug || course._id}/learn`}>
      <Card className="rounded-xl border-gray-200 group hover:border-gray-300 transition-colors bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
            <div
              className={cn(
                "h-32 sm:h-24 w-full sm:w-36 border border-gray-200 relative shrink-0 flex items-center justify-center overflow-hidden rounded-lg",
                thumb.gradientClass
              )}
            >
              {thumb.showImage && thumb.thumbSrc ? (
                <Image
                  src={thumb.thumbSrc}
                  alt={t(course.title)}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(min-width: 640px) 9rem, 100vw"
                  onError={thumb.onImageError}
                />
              ) : (
                <PlayCircle className="h-8 w-8 text-white/80 opacity-90 group-hover:scale-110 transition-all relative z-0" />
              )}
              {isCompleted && (
                <div className="absolute top-1 right-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="rounded-lg text-[10px] font-semibold border-gray-200">
                      {t(course.level || "beginner")}
                    </Badge>
                    {isCompleted && (
                      <Badge className="rounded-lg bg-green-100 text-green-800 text-[10px] font-semibold border-0"><T>Completed</T></Badge>
                    )}
                  </div>
                  <h3 className="font-sans font-bold text-black text-base line-clamp-1 group-hover:text-[#0052CC] transition-colors">{t(course.title)}</h3>
                </div>
                <Button size="sm" className="rounded-lg text-xs font-semibold h-8 w-full sm:w-auto border border-gray-300 bg-gray-50 text-gray-800 hover:bg-gray-100">
                  {isCompleted ? <T>Review</T> : <T>Continue</T>}
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={progress} className="h-1.5 rounded-full bg-gray-200 [&>div]:bg-[#0052CC]" />
                </div>
                <span className="text-xs font-sans text-gray-600">{progress}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CourseCardSkeleton() {
  return (
    <Card className="rounded-xl border-gray-200 overflow-hidden bg-white">
      <Skeleton className="h-32 w-full rounded-t-[12px]" />
      <CardContent className="p-5 space-y-4">
        <Skeleton className="h-5 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <Skeleton className="h-2 w-full mt-2 rounded-full" />
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Skeleton className="h-4 w-12 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyCoursesPage() {
  const { t } = useT();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: enrollmentsResponse, isLoading } = useEnrollments();

  const enrollments = (enrollmentsResponse?.data || []) as Enrollment[];

  const filteredEnrollments = enrollments.filter((enrollment: Enrollment) => {
    const course = typeof enrollment.course === "object" ? enrollment.course : null;
    if (!course) return false;
    if (!searchQuery) return true;
    return (course as Course).title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeEnrollments = filteredEnrollments.filter(
    (e: Enrollment) => (e.progress || 0) < 100
  );
  const completedEnrollments = filteredEnrollments.filter(
    (e: Enrollment) => (e.progress || 0) >= 100
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-black tracking-tight"><T>My Courses</T></h1>
        <p className="font-sans text-gray-600 mt-1">
          <T>Track your enrolled courses and continue learning</T>
        </p>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("Search your courses...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-lg border-gray-200 bg-white focus:ring-2 focus:ring-[#0052CC]/30"
          />
        </div>
        <div className="flex border border-gray-200 bg-white rounded-lg overflow-hidden">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-none border-r border-gray-200 h-10 w-10 hover:bg-gray-100 data-[state=active]:bg-[#0052CC]/10 data-[state=active]:text-[#0052CC]"
            onClick={() => setViewMode("grid")}
            data-state={viewMode === "grid" ? "active" : ""}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-none h-10 w-10 hover:bg-gray-100 data-[state=active]:bg-[#0052CC]/10 data-[state=active]:text-[#0052CC]"
            onClick={() => setViewMode("list")}
            data-state={viewMode === "list" ? "active" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-gray-100 border border-gray-200 w-full justify-start rounded-lg h-auto p-1 gap-1 overflow-x-auto flex-nowrap">
          <TabsTrigger
            value="all"
            className="rounded-lg border-0 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm px-4 py-2.5 font-sans font-semibold text-sm text-gray-600 transition-none shrink-0"
          >
            <T>All</T> <Badge className="ml-2 rounded-md bg-gray-200 text-gray-700 border-0 text-[10px]">{filteredEnrollments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="in-progress"
            className="rounded-lg border-0 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm px-4 py-2.5 font-sans font-semibold text-sm text-gray-600 transition-none shrink-0"
          >
            <T>In Progress</T> <Badge className="ml-2 rounded-md bg-gray-200 text-gray-700 border-0 text-[10px]">{activeEnrollments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-lg border-0 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm px-4 py-2.5 font-sans font-semibold text-sm text-gray-600 transition-none shrink-0"
          >
            <T>Completed</T> <Badge className="ml-2 rounded-md bg-gray-200 text-gray-700 border-0 text-[10px]">{completedEnrollments.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredEnrollments.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEnrollments.map((enrollment) => (
                  <CourseCard key={enrollment._id} enrollment={enrollment} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEnrollments.map((enrollment) => (
                  <CourseListItem key={enrollment._id} enrollment={enrollment} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20 rounded-xl border border-dashed border-gray-200 bg-white">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-sans font-bold text-black"><T>No courses found</T></h3>
              <p className="font-sans text-gray-600 mt-2 text-sm">
                {searchQuery
                  ? <T>Try a different search term</T>
                  : <T>You haven&apos;t enrolled in any courses yet</T>}
              </p>
              <Button className="mt-6 rounded-lg bg-[#0052CC] hover:bg-[#003d99] text-white font-bold" asChild>
                <Link href="/courses"><T>Browse Courses</T></Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : activeEnrollments.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeEnrollments.map((enrollment) => (
                  <CourseCard key={enrollment._id} enrollment={enrollment} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {activeEnrollments.map((enrollment) => (
                  <CourseListItem key={enrollment._id} enrollment={enrollment} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20 rounded-xl border border-dashed border-gray-200 bg-white">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-sans font-bold text-black"><T>No courses in progress</T></h3>
              <p className="font-sans text-gray-600 mt-2 text-sm">
                <T>Start a new course or resume a completed one</T>
              </p>
              <Button className="mt-6 rounded-lg bg-[#0052CC] hover:bg-[#003d99] text-white font-bold" asChild>
                <Link href="/courses"><T>Browse Courses</T></Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : completedEnrollments.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {completedEnrollments.map((enrollment) => (
                  <CourseCard key={enrollment._id} enrollment={enrollment} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {completedEnrollments.map((enrollment) => (
                  <CourseListItem key={enrollment._id} enrollment={enrollment} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20 rounded-xl border border-dashed border-gray-200 bg-white">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-sans font-bold text-black"><T>No completed courses</T></h3>
              <p className="font-sans text-gray-600 mt-2 text-sm">
                <T>Keep learning and complete your first course!</T>
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
