"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth, useEnrollments } from "@/hooks";
import { coursesApi } from "@/lib/api/courses";
import { liveSessionsApi } from "@/lib/api/live-sessions";
import { isScheduledWindowOver } from "@/lib/live-session-utils";
import type { Course, Enrollment } from "@/types";
import { usePageTranslation, useT } from "@/components/t";
import {
  HeroSection,
  AboutOmegaForceSection,
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
            limit: 8,
          })
        : coursesApi.getAllPublic({
            status: "published",
            sort: "enrollmentCount",
            order: "desc",
            limit: 8,
          }),
  });
  const { data: enrollmentsResponse } = useEnrollments();

  const { data: liveSessionsResponse, isLoading: isLoadingLiveSessions } = useQuery({
    queryKey: ["home-live-sessions"],
    queryFn: () => liveSessionsApi.getAll(1, 10),
    refetchInterval: 30000,
  });

  const { data: endedLiveSessionsResponse, isLoading: isLoadingEndedLiveSessions } = useQuery({
    queryKey: ["home-ended-live-sessions"],
    queryFn: () => liveSessionsApi.getAll(1, 10, "ended"),
    refetchInterval: 30000,
  });

  const courses = (coursesResponse?.data || []).filter(
    (course): course is Course => Boolean(course?._id && course.title)
  );
  const enrollments = enrollmentsResponse?.data || [];
  const liveSessions = liveSessionsResponse?.data || [];
  const endedLiveSessions = endedLiveSessionsResponse?.data || [];
  const staleEndedSessions = liveSessions.filter(
    (s) => (s.status === "live" || s.status === "scheduled") && isScheduledWindowOver(s)
  );

  const sortedLiveSessions = [...liveSessions]
    .filter((s) => (s.status === "live" || s.status === "scheduled") && !isScheduledWindowOver(s))
    .sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (a.status !== "live" && b.status === "live") return 1;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    })
    .slice(0, 4);

  const sortedEndedLiveSessions = [...endedLiveSessions, ...staleEndedSessions]
    .filter((session, index, sessions) =>
      sessions.findIndex((candidate) => candidate._id === session._id) === index
    )
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 4);

  const hasLiveSessions = sortedLiveSessions.length > 0 || sortedEndedLiveSessions.length > 0;

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

  const statementItemKeys = [
    "Organize Rhapsody End-Time Teaching Crusades in Your City",
    "Weekly Prevailing Prayer Sessions for Your Nation",
    "Participate in Ministry Programs with Pastor Chris",
    "Upload Field Work Reports, Testimonies & Footage",
  ];
  const statementItems = statementItemKeys.map((item) => t(item));
  const courseTexts = coursesToShow.flatMap((course) =>
    [course.title, course.description].filter(Boolean) as string[]
  );

  usePageTranslation([
    "Rhapsody Omega Force",
    `A specially trained workforce of the Rhapsody Global Network, equipped to propagate the gospel in this terminal generation till the last lost soul is brought in.

This site will inspire, edify and equip you better as a Rhapsody Ambassador; you will improve personally, Excel as a Rhapsody Missionary and become a leading force in the organization of Rhapsody End-Time Teaching Crusades.`,
    "About Rhapsody Omega Force",
    "Ready to answer the call to service?",
    "Join the Rhapsody Omega Force — the specially trained workforce of the Rhapsody Global Network — as we intensify the search for the last lost soul and advance the gospel with precision.",
    ...statementItemKeys,
    ...courseTexts,
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <HeroSection isAuthenticated={!!isAuthenticated} />
      <AboutOmegaForceSection />
      <InfoGrid />
      <CourseListSection
        courses={coursesToShow}
        enrollmentMap={enrollmentMap}
        isLoading={isLoading}
      />
      <TestimoniesSection />
      {(hasLiveSessions || isLoadingLiveSessions || isLoadingEndedLiveSessions) && (
        <LiveSessionsSection
          sessions={sortedLiveSessions}
          endedSessions={sortedEndedLiveSessions}
          isLoading={isLoadingLiveSessions || isLoadingEndedLiveSessions}
        />
      )}
      <StatementSection
        isAuthenticated={!!isAuthenticated}
        statementItems={statementItems}
      />
    </div>
  );
}
