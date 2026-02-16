"use client";

import { useQuery } from "@tanstack/react-query";
import { useCourses, useAuth, useEnrollments } from "@/hooks";
import { liveSessionsApi } from "@/lib/api/live-sessions";
import type { Course, Enrollment } from "@/types";
import { useT } from "@/components/t";
import {
  HeroSection,
  InfoGrid,
  CourseListSection,
  TestimoniesSection,
  LiveSessionsSection,
  StatementSection,
} from "@/components/home";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { t } = useT();

  const { data: coursesResponse, isLoading } = useCourses(
    {
      status: "published",
      sort: "enrollmentCount",
      order: "desc",
      limit: 50,
    },
    { enabled: true }
  );
  const { data: enrollmentsResponse } = useEnrollments();

  const { data: liveSessionsResponse, isLoading: isLoadingLiveSessions } = useQuery({
    queryKey: ["home-live-sessions"],
    queryFn: () => liveSessionsApi.getAll(1, 10),
    refetchInterval: 30000,
  });

  const courses = coursesResponse?.data || [];
  const enrollments = enrollmentsResponse?.data || [];
  const liveSessions = liveSessionsResponse?.data || [];

  const sortedLiveSessions = [...liveSessions]
    .filter((s) => s.status === "live" || s.status === "scheduled")
    .sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (a.status !== "live" && b.status === "live") return 1;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    })
    .slice(0, 4);

  const hasLiveSessions = sortedLiveSessions.length > 0;
  const hasLiveNow = sortedLiveSessions.some((s) => s.status === "live");

  const enrollmentMap = new Map<string, Enrollment>();
  if (enrollments) {
    enrollments.forEach((enrollment) => {
      if (!enrollment.course) return;
      const courseId =
        typeof enrollment.course === "object" ? enrollment.course._id : enrollment.course;
      enrollmentMap.set(courseId, enrollment);
    });
  }

  const coursesToShow: Course[] = courses;

  const statementItems = [
    t("Global Networking"),
    t("Resource Library Access"),
    t("Priority Event Registration"),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <HeroSection isAuthenticated={!!isAuthenticated} />
      <InfoGrid />
      <CourseListSection
        courses={coursesToShow}
        enrollmentMap={enrollmentMap}
        isLoading={isLoading}
      />
      <TestimoniesSection />
      {(hasLiveSessions || isLoadingLiveSessions) && (
        <LiveSessionsSection
          sessions={sortedLiveSessions}
          isLoading={isLoadingLiveSessions}
          hasLiveNow={hasLiveNow}
        />
      )}
      <StatementSection
        isAuthenticated={!!isAuthenticated}
        statementItems={statementItems}
      />
    </div>
  );
}
