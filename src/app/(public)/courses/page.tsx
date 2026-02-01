"use client";

import { useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, Grid3X3, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCourses, useCategories, useEnrollments } from "@/hooks";
import type { Course, CourseFilters, Enrollment } from "@/types";
import { T, useT } from "@/components/t";
import { CourseCardPublic } from "@/components/courses/course-card-public";
import { CoursesFilterSidebar, COURSE_LANGUAGES } from "@/components/courses/courses-filter-sidebar";
import { CoursesLoading } from "@/components/courses/courses-loading";
import { PageLoader } from "@/components/ui/page-loader";

function CoursesContent() {
  const searchParams = useSearchParams();
  const { t } = useT();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState<CourseFilters>({
    status: "published",
    sort: "enrollmentCount",
    order: "desc",
    limit: 50,
  });

  const sortOptions = [
    { value: "enrollmentCount", label: t("Most Popular") },
    { value: "rating", label: t("Highest Rated") },
    { value: "createdAt", label: t("Newest") },
    { value: "title", label: t("Title") },
  ];

  const { data: coursesResponse, isLoading } = useCourses({
    ...filters,
    search: searchQuery || undefined,
  });

  const { data: categoriesResponse } = useCategories();
  const { data: enrollmentsResponse } = useEnrollments();

  const courses = coursesResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  const enrollmentMap = useMemo(() => {
  const enrollments = enrollmentsResponse?.data || [];
    const map = new Map<string, Enrollment>();
  enrollments.forEach((enrollment) => {
    const courseId = typeof enrollment.course === "object" && enrollment.course ? enrollment.course._id : enrollment.course;
      map.set(courseId, enrollment);
    });
    return map;
  }, [enrollmentsResponse?.data]);

  const activeFiltersCount = [filters.category, filters.level, filters.language].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div className="mb-8">
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-black tracking-tight">
            <T>Training Materials</T>
          </h1>
          <p className="font-sans text-gray-600 mt-1">
          <T>Browse our training resources and start your preparation</T>
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="space-y-3 mb-6">
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("Search training materials...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full rounded-[10px] border-gray-200 bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-[#0052CC]/30"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-gray-700"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden h-9 rounded-[10px] border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-sans font-medium"
                >
                <Filter className="h-4 w-4 mr-2" />
                <T>Filters</T>
                {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 rounded-[8px] bg-gray-100 text-gray-700">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] border-gray-200 bg-white">
              <SheetHeader>
                  <SheetTitle className="font-sans font-bold text-black"><T>Filters</T></SheetTitle>
              </SheetHeader>
              <div className="mt-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                  <CoursesFilterSidebar filters={filters} setFilters={setFilters} categories={categories} />
              </div>
            </SheetContent>
          </Sheet>

          <Select
            value={filters.sort}
              onValueChange={(value) => setFilters({ ...filters, sort: value as CourseFilters["sort"] })}
          >
              <SelectTrigger className="w-[140px] sm:w-[180px] h-9 rounded-[10px] border-gray-200 bg-white text-gray-700 font-sans">
              <SelectValue placeholder={t("Sort by")} />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

            <div className="flex border border-gray-200 rounded-[10px] overflow-hidden ml-auto bg-white">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
                className={`rounded-none h-9 w-9 ${viewMode === "grid" ? "bg-[#0052CC]/10 text-[#0052CC]" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
                className={`rounded-none h-9 w-9 ${viewMode === "list" ? "bg-[#0052CC]/10 text-[#0052CC]" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[200px] shrink-0">
            <div className="sticky top-20 rounded-[12px] border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans font-semibold text-black"><T>Filters</T></h3>
              {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="rounded-[8px] bg-gray-100 text-gray-700">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <CoursesFilterSidebar filters={filters} setFilters={setFilters} categories={categories} />
          </div>
        </aside>

        {/* Courses Grid */}
        <div className="flex-1">
            <p className="text-sm font-sans text-gray-600 mb-4">
            {isLoading ? (
              <T>Loading...</T>
            ) : (
              <>
                <T>Showing</T>{" "}
                  <span className="font-medium text-black">{courses.length}</span>
                  {coursesResponse?.pagination?.total ? (
                    <> {t("of")} {coursesResponse.pagination.total}</>
                  ) : null}{" "}
                <T>training materials</T>
              </>
            )}
          </p>

          {isLoading ? (
              <PageLoader />
          ) : courses.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-8"
              }
            >
                {courses.map((course: Course, index: number) => (
                  <CourseCardPublic
                  key={course._id}
                  course={course}
                  index={index}
                  enrollment={enrollmentMap.get(course._id)}
                  viewMode={viewMode}
                    languages={COURSE_LANGUAGES}
                />
              ))}
            </div>
          ) : (
              <div className="rounded-[12px] border border-gray-200 bg-white p-12 text-center shadow-sm">
                <p className="font-sans text-gray-600"><T>No training materials found.</T></p>
                <p className="text-sm font-sans text-gray-500 mt-1">
                <T>Try adjusting your search or filters.</T>
              </p>
              <Button
                variant="outline"
                  className="mt-4 rounded-[10px] border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-sans font-medium"
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ status: "published" });
                }}
              >
                <T>Clear all filters</T>
              </Button>
            </div>
          )}

          {coursesResponse?.pagination && coursesResponse.pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
                <p className="text-sm font-sans text-gray-600">
                  <T>Page</T> {coursesResponse.pagination.page} <T>of</T> {coursesResponse.pagination.totalPages}
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<CoursesLoading />}>
      <CoursesContent />
    </Suspense>
  );
}
