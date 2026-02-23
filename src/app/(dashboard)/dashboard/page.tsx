"use client";

import Link from "next/link";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  PlayCircle,
  ArrowRight,
  Calendar,
  Bell,
  ChevronRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/page-loader";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useEnrollments, useCertificates, useNotifications } from "@/hooks";
import { formatDistanceToNow } from "date-fns";
import type { Enrollment, Course } from "@/types";
import { T, useT } from "@/components/t";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
}) {
  return (
    <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-[12px] ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-3xl font-sans font-bold text-black">{value}</p>
            <p className="text-sm font-sans text-gray-600 mt-1">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseProgressCard({ enrollment }: { enrollment: Enrollment }) {
  const { t } = useT();
  const course = typeof enrollment.course === "object" ? enrollment.course : null;
  const progress = enrollment.progress || 0;

  if (!course) return null;

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-[12px] border border-gray-200 bg-white shadow-sm hover:border-gray-300 transition-colors">
      <div className="relative h-20 w-full sm:w-32 bg-gray-100 rounded-[10px] flex items-center justify-center overflow-hidden shrink-0 group-hover:opacity-90 transition-opacity">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={t(course.title)}
            className="absolute inset-0 w-full h-full object-cover rounded-[10px]"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[#0052CC]/10 rounded-[10px]" />
            <PlayCircle className="h-8 w-8 text-[#0052CC] relative z-10 group-hover:scale-110 transition-transform" />
          </>
        )}
        <Badge className="absolute top-2 left-2 rounded-[8px] text-[10px] font-semibold border-0 bg-white/90 text-gray-800 backdrop-blur-sm" variant="secondary">
          {t(course.level || "beginner")}
        </Badge>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-sans font-medium text-[#0052CC]"><T>Course</T></span>
        <h4 className="font-sans font-bold text-black text-sm truncate mt-0.5">{t(course.title)}</h4>
        <div className="mt-3 flex items-center gap-3">
          <Progress value={progress} className="h-1.5 flex-1 rounded-full bg-gray-200 [&>div]:bg-[#0052CC]" />
          <span className="text-xs font-sans text-gray-600 whitespace-nowrap">
            {progress}%
          </span>
        </div>
      </div>
      <Button asChild className="rounded-[10px] text-xs font-semibold h-9 w-full sm:w-auto bg-[#0052CC] hover:bg-[#003d99] text-white">
        <Link href={`/courses/${course.slug || course._id}/learn`}><T>Continue</T></Link>
      </Button>
    </div>
  );
}

function NotificationItem({
  title,
  message,
  time,
  isUnread,
}: {
  title: string;
  message: string;
  time: string;
  isUnread?: boolean;
}) {
  return (
    <div className={`p-4 transition-colors hover:bg-gray-50 rounded-[10px] ${isUnread ? "bg-[#0052CC]/5" : ""}`}>
      <div className="flex items-start gap-3">
        <div
          className={`h-2 w-2 mt-2 shrink-0 rounded-full ${isUnread ? "bg-[#0052CC]" : "bg-transparent"
            }`}
        />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-sans ${isUnread ? "font-bold text-black" : "font-medium text-gray-900"}`}><T>{title}</T></p>
          <p className="text-sm font-sans text-gray-600 line-clamp-2 mt-1"><T>{message}</T></p>
          <p className="text-xs font-sans text-gray-500 mt-2">{time}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useT();
  const { data: enrollmentsResponse, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: certificatesResponse, isLoading: certificatesLoading } = useCertificates();
  const { data: notificationsResponse, isLoading: notificationsLoading } = useNotifications();

  const isLoading = enrollmentsLoading;

  if (isLoading) {
    return <PageLoader />;
  }

  const enrollments = (enrollmentsResponse?.data || []) as Enrollment[];
  const certificates = certificatesResponse?.data || [];
  const notifications = notificationsResponse?.data || [];

  const activeEnrollments = enrollments.filter(
    (e: Enrollment) => e.status === "active" && (e.progress || 0) < 100
  );
  const completedCourses = enrollments.filter((e: Enrollment) => (e.progress || 0) >= 100).length;

  // course.duration is in minutes (calculated from lesson videoDuration which is in minutes)
  const totalLearningMinutes = enrollments.reduce((acc: number, e: Enrollment) => {
    const course = typeof e.course === "object" ? e.course : null;
    return acc + ((course as Course)?.duration || 0);
  }, 0);

  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc: number, e: Enrollment) => acc + (e.progress || 0), 0) / enrollments.length)
    : 0;

  const stats = [
    { label: t("Enrolled Courses"), value: enrollments.length.toString(), icon: BookOpen, color: "text-blue-600 border-blue-200 bg-blue-50" },
    { label: t("Minutes Learned"), value: totalLearningMinutes > 0 ? totalLearningMinutes.toString() : "-", icon: Clock, color: "text-green-600 border-green-200 bg-green-50" },
    { label: t("Certificates"), value: certificates.length.toString(), icon: Award, color: "text-amber-600 border-amber-200 bg-amber-50" },
    { label: t("Avg. Progress"), value: `${avgProgress}%`, icon: TrendingUp, color: "text-violet-600 border-violet-200 bg-violet-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-black tracking-tight">
          <T>Welcome back,</T> <span className="text-[#0052CC]">{user?.name?.split(" ")[0] || t("Learner")}</span>
        </h1>
        <p className="font-sans text-gray-600 mt-1">
          {activeEnrollments.length > 0
            ? <T>Continue your learning journey. You're making great progress!</T>
            : <T>Start your learning journey today by enrolling in a course.</T>}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-sans font-bold text-black"><T>Continue Learning</T></h2>
              <p className="text-sm font-sans text-gray-600"><T>Pick up where you left off</T></p>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-[10px] border-gray-200 hover:bg-gray-50 hover:text-[#0052CC] text-sm font-semibold">
              <Link href="/my-courses">
                <T>View all</T> <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {activeEnrollments.length > 0 ? (
              activeEnrollments.slice(0, 3).map((enrollment) => (
                <CourseProgressCard key={enrollment._id} enrollment={enrollment} />
              ))
            ) : (
              <Card className="rounded-[12px] border-gray-200 border-dashed bg-white shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-[12px] border border-gray-200 bg-gray-50 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="font-sans font-bold text-black text-lg mb-1"><T>No courses in progress</T></h3>
                  <p className="font-sans text-gray-600 text-sm max-w-xs mb-6"><T>Start your journey by exploring our available courses.</T></p>
                  <Button className="rounded-[10px] bg-[#0052CC] hover:bg-[#003d99] text-white font-bold" asChild>
                    <Link href="/courses"><T>Browse Courses</T></Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Notifications / Activity */}
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-sans font-bold text-black flex items-center gap-2 shrink-0">
              <Bell className="h-5 w-5 text-[#0052CC]" />
              <T>Notifications</T>
            </h2>
            <Button variant="ghost" size="sm" asChild className="hover:bg-transparent hover:text-[#0052CC] text-sm font-semibold p-0 h-auto shrink-0">
              <Link href="/notifications">
                <T>View All</T>
              </Link>
            </Button>
          </div>

          <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm h-[calc(100%-3rem)]">
            <CardContent className="p-0">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {notifications.slice(0, 5).map((notification: any) => (
                    <NotificationItem
                      key={notification._id}
                      title={notification.title}
                      message={notification.message}
                      time={formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                      isUnread={!notification.isRead}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center h-full min-h-[300px]">
                  <div className="h-10 w-10 rounded-[10px] border border-gray-200 bg-gray-50 flex items-center justify-center mb-3">
                    <Bell className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="text-sm font-sans font-medium text-gray-600"><T>No notifications yet</T></p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-sans font-bold text-black"><T>Recent Certificates</T></h2>
            <Button variant="outline" size="sm" asChild className="rounded-[10px] border-gray-200 hover:bg-gray-50 hover:text-[#0052CC] text-sm font-semibold">
              <Link href="/certificates">
                <T>View All</T> <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.slice(0, 3).map((cert: any) => {
              const course = typeof cert.course === "object" ? cert.course : null;
              return (
                <Card key={cert._id} className="rounded-[12px] border-amber-200 bg-amber-50/50 hover:border-amber-300 transition-colors group shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-[12px] border border-amber-200 bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
                        <Award className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans font-bold text-black text-sm line-clamp-1 group-hover:text-[#0052CC] transition-colors">
                          {course?.title || t("Course Certificate")}
                        </h4>
                        <p className="text-xs font-sans text-gray-600 mt-1">
                          <T>Issued</T> {formatDistanceToNow(new Date(cert.issuedAt || cert.createdAt), { addSuffix: true })}
                        </p>
                        <Button variant="link" className="h-auto p-0 text-xs font-semibold text-[#0052CC] mt-3 group-hover:underline" asChild>
                          <Link href={`/certificates/${cert._id}`}><T>View Certificate</T> <ArrowRight className="ml-1 h-3 w-3" /></Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
