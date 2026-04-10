"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth, useEnrollments } from "@/hooks";
import { coursesApi } from "@/lib/api/courses";
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

  const { data: coursesResponse, isLoading } = useQuery({
    queryKey: ["home-public-courses", isAuthenticated],
    queryFn: () =>
      isAuthenticated
        ? coursesApi.getAll({
            status: "published",
            sort: "enrollmentCount",
            order: "desc",
            limit: 50,
          })
        : coursesApi.getAllPublic({
            status: "published",
            sort: "enrollmentCount",
            order: "desc",
            limit: 50,
          }),
  });
  const { data: enrollmentsResponse } = useEnrollments();

  const { data: liveSessionsResponse, isLoading: isLoadingLiveSessions } = useQuery({
    queryKey: ["home-live-sessions"],
    queryFn: () => liveSessionsApi.getAll(1, 10),
    refetchInterval: 30000,
  });

  const courses = (coursesResponse?.data || []).filter(
    (course): course is Course => Boolean(course?._id && course.title)
  );
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
    t("Organize Rhapsody End-Time Teaching Crusades in Your City"),
    t("Weekly Prevailing Prayer Sessions for Your Nation"),
    t("Participate in Ministry Programs with Pastor Chris"),
    t("Upload Field Work Reports, Testimonies & Footage"),
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
        />
      )}
      <StatementSection
        isAuthenticated={!!isAuthenticated}
        statementItems={statementItems}
      />
    </div>
  );
}
