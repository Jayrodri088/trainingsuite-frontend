"use client";

import { useState } from "react";
import Link from "next/link";
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
import { useEnrollments } from "@/hooks";
import type { Enrollment, Course } from "@/types";
import { T, useT } from "@/components/t";

const cardColors = [
  "bg-violet-500/10 border-violet-500/20 text-violet-600",
  "bg-amber-500/10 border-amber-500/20 text-amber-600",
  "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
  "bg-blue-500/10 border-blue-500/20 text-blue-600",
  "bg-pink-500/10 border-pink-500/20 text-pink-600",
  "bg-cyan-500/10 border-cyan-500/20 text-cyan-600",
];

function CourseCard({ enrollment, index }: { enrollment: Enrollment; index: number }) {
  const { t } = useT();
  const course = typeof enrollment.course === "object" ? enrollment.course : null;
  const progress = enrollment.progress || 0;
  const isCompleted = progress >= 100;
  const colorClass = cardColors[index % cardColors.length];

  if (!course) return null;

  return (
    <Link href={`/courses/${course.slug || course._id}/learn`}>
      <Card className="rounded-[12px] border-gray-200 group cursor-pointer h-full hover:border-gray-300 transition-colors bg-white shadow-sm overflow-hidden">
        <div className={`h-32 ${colorClass} border-b border-gray-200 relative flex items-center justify-center overflow-hidden rounded-t-[12px]`}>
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={t(course.title)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <PlayCircle className="h-10 w-10 opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all" />
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="rounded-[8px] text-[10px] font-semibold border-0 bg-white/90 text-gray-800 backdrop-blur-sm">
              {t(course.level || "beginner")}
            </Badge>
          </div>
          {isCompleted && (
            <div className="absolute top-3 right-3">
              <Badge className="rounded-[8px] bg-green-600 hover:bg-green-600 text-[10px] font-semibold border-0">
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
            <Button size="sm" className="h-8 rounded-[10px] text-xs font-semibold border border-gray-300 bg-gray-50 text-gray-800 hover:bg-gray-100">
              {isCompleted ? <T>Review</T> : <T>Continue</T>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CourseListItem({ enrollment, index }: { enrollment: Enrollment; index: number }) {
  const { t } = useT();
  const course = typeof enrollment.course === "object" ? enrollment.course : null;
  const progress = enrollment.progress || 0;
  const isCompleted = progress >= 100;
  const colorClass = cardColors[index % cardColors.length];

  if (!course) return null;

  return (
    <Link href={`/courses/${course.slug || course._id}/learn`}>
      <Card className="rounded-[12px] border-gray-200 group hover:border-gray-300 transition-colors bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
            <div className={`h-32 sm:h-24 w-full sm:w-36 ${colorClass} border border-gray-200 relative shrink-0 flex items-center justify-center overflow-hidden rounded-[10px]`}>
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={t(course.title)}
                  className="absolute inset-0 w-full h-full object-cover rounded-[10px]"
                />
              ) : (
                <PlayCircle className="h-8 w-8 opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all" />
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
                    <Badge variant="outline" className="rounded-[8px] text-[10px] font-semibold border-gray-200">
                      {t(course.level || "beginner")}
                    </Badge>
                    {isCompleted && (
                      <Badge className="rounded-[8px] bg-green-100 text-green-800 text-[10px] font-semibold border-0"><T>Completed</T></Badge>
                    )}
                  </div>
                  <h3 className="font-sans font-bold text-black text-base line-clamp-1 group-hover:text-[#0052CC] transition-colors">{t(course.title)}</h3>
                </div>
                <Button size="sm" className="rounded-[10px] text-xs font-semibold h-8 w-full sm:w-auto border border-gray-300 bg-gray-50 text-gray-800 hover:bg-gray-100">
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
    <Card className="rounded-[12px] border-gray-200 overflow-hidden bg-white">
      <Skeleton className="h-32 w-full rounded-t-[12px]" />
      <CardContent className="p-5 space-y-4">
        <Skeleton className="h-5 w-full rounded-[10px]" />
        <Skeleton className="h-4 w-3/4 rounded-[10px]" />
        <Skeleton className="h-2 w-full mt-2 rounded-full" />
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Skeleton className="h-4 w-12 rounded-[10px]" />
          <Skeleton className="h-8 w-20 rounded-[10px]" />
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
            className="pl-9 rounded-[10px] border-gray-200 bg-white focus:ring-2 focus:ring-[#0052CC]/30"
          />
        </div>
        <div className="flex border border-gray-200 bg-white rounded-[10px] overflow-hidden">
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
        <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start rounded-none h-auto p-0 gap-4 sm:gap-6 overflow-x-auto flex-nowrap">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0052CC] data-[state=active]:bg-transparent px-0 pb-2 mb-[-1px] font-sans font-semibold text-sm text-gray-600 data-[state=active]:text-black shrink-0"
          >
            <T>All</T> <Badge variant="secondary" className="ml-2 rounded-[8px] text-[10px] bg-gray-100 text-gray-600">{filteredEnrollments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="in-progress"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0052CC] data-[state=active]:bg-transparent px-0 pb-2 mb-[-1px] font-sans font-semibold text-sm text-gray-600 data-[state=active]:text-black shrink-0"
          >
            <T>In Progress</T> <Badge variant="secondary" className="ml-2 rounded-[8px] text-[10px] bg-gray-100 text-gray-600">{activeEnrollments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0052CC] data-[state=active]:bg-transparent px-0 pb-2 mb-[-1px] font-sans font-semibold text-sm text-gray-600 data-[state=active]:text-black shrink-0"
          >
            <T>Completed</T> <Badge variant="secondary" className="ml-2 rounded-[8px] text-[10px] bg-gray-100 text-gray-600">{completedEnrollments.length}</Badge>
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
                {filteredEnrollments.map((enrollment, index) => (
                  <CourseCard key={enrollment._id} enrollment={enrollment} index={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEnrollments.map((enrollment, index) => (
                  <CourseListItem key={enrollment._id} enrollment={enrollment} index={index} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20 rounded-[12px] border border-dashed border-gray-200 bg-white">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-sans font-bold text-black"><T>No courses found</T></h3>
              <p className="font-sans text-gray-600 mt-2 text-sm">
                {searchQuery
                  ? <T>Try a different search term</T>
                  : <T>You haven't enrolled in any courses yet</T>}
              </p>
              <Button className="mt-6 rounded-[10px] bg-[#0052CC] hover:bg-[#003d99] text-white font-bold" asChild>
                <Link href="/courses"><T>Browse Courses</T></Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-8">
          {isLoading ? (
            <PageLoader />
          ) : activeEnrollments.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeEnrollments.map((enrollment, index) => (
                  <CourseCard key={enrollment._id} enrollment={enrollment} index={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {activeEnrollments.map((enrollment, index) => (
                  <CourseListItem key={enrollment._id} enrollment={enrollment} index={index} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20 rounded-[12px] border border-dashed border-gray-200 bg-white">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-sans font-bold text-black"><T>No courses in progress</T></h3>
              <p className="font-sans text-gray-600 mt-2 text-sm">
                <T>Start a new course or resume a completed one</T>
              </p>
              <Button className="mt-6 rounded-[10px] bg-[#0052CC] hover:bg-[#003d99] text-white font-bold" asChild>
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
                {completedEnrollments.map((enrollment, index) => (
                  <CourseCard key={enrollment._id} enrollment={enrollment} index={index} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {completedEnrollments.map((enrollment, index) => (
                  <CourseListItem key={enrollment._id} enrollment={enrollment} index={index} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20 rounded-[12px] border border-dashed border-gray-200 bg-white">
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
