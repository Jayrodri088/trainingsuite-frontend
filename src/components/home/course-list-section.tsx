"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CourseCard } from "./course-card";
import { PageLoader } from "@/components/ui/page-loader";
import type { Course, Enrollment } from "@/types";
import { T } from "@/components/t";

interface CourseListSectionProps {
  courses: Course[];
  enrollmentMap: Map<string, Enrollment>;
  isLoading: boolean;
}

export function CourseListSection({
  courses,
  enrollmentMap,
  isLoading,
}: CourseListSectionProps) {
  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-white">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div id="training-programs" className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 lg:mb-16 gap-4 md:gap-6">
          <div className="max-w-2xl">
            <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3 text-black">
              <T>Training Programs</T>
            </h2>
            <p className="text-sm md:text-lg text-gray-600 md:text-black font-normal">
              <T>Select a comprehensive module to begin your preparation journey.</T>
            </p>
          </div>
          <Link
            href="/courses"
            className="flex items-center gap-2 text-sm md:text-base font-medium text-[#0052CC] hover:text-[#0052CC]/80 transition-colors self-start md:self-auto"
          >
            <T>Full Curriculum</T>
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center sm:justify-items-stretch">
          {(
            courses.map((course) => (
              <div key={course._id} className="w-full max-w-[280px] sm:max-w-none md:max-w-none">
                <CourseCard
                  course={course}
                  enrollment={enrollmentMap.get(course._id)}
                />
              </div>
            ))
          )}
        </div>

        {/* <Link
          href="/courses"
          className="md:hidden mt-6 flex items-center justify-center gap-2 h-12 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <T>Full Curriculum</T>
          <ArrowRight className="h-4 w-4" />
        </Link> */}
      </div>
    </section>
  );
}
