"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CourseCard, CourseCardSkeleton } from "./course-card";
import type { Course, Enrollment } from "@/types";
import { T } from "@/components/t";

interface CourseListSectionProps {
  courses: Course[];
  enrollmentMap: Map<string, Enrollment>;
  isLoading: boolean;
  useMockCoursesOnly: boolean;
}

export function CourseListSection({
  courses,
  enrollmentMap,
  isLoading,
  useMockCoursesOnly,
}: CourseListSectionProps) {
  const showSkeletons = !useMockCoursesOnly && isLoading;

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container max-w-7xl px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-sans text-3xl md:text-4xl font-bold mb-3 text-black">
              <T>Training Programs</T>
            </h2>
            <p className="text-base md:text-lg text-black font-normal">
              <T>Select a comprehensive module to begin your preparation journey.</T>
            </p>
          </div>
          <Link
            href="/courses"
            className="hidden md:flex items-center gap-2 text-base font-medium text-[#0052CC] hover:text-[#0052CC]/80 transition-colors"
          >
            <T>Full Curriculum</T>
            <ArrowRight className="h-5 w-5 shrink-0" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {showSkeletons ? (
            Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                enrollment={enrollmentMap.get(course._id)}
              />
            ))
          )}
        </div>

        <Link
          href="/courses"
          className="md:hidden mt-8 flex items-center justify-center h-12 border border-border text-sm font-bold uppercase tracking-widest hover:bg-secondary transition-colors"
        >
          <T>Full Curriculum</T>
          <ArrowRight className="ml-3 h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
