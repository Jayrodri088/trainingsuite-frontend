"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Play,
  CheckCircle,
  Star,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses, useAuth, useEnrollments } from "@/hooks";
import type { Course, Enrollment } from "@/types";

const features = [
  {
    icon: BookOpen,
    title: "Training Materials",
    description: "Access comprehensive training materials to prepare for effective ministry.",
  },
  {
    icon: Video,
    title: "Video Training",
    description: "Learn through high-quality video content from experienced ministers.",
  },
  {
    icon: Users,
    title: "Live Sessions",
    description: "Join interactive live training sessions and workshops.",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Earn certificates upon completing your training programs.",
  },
];


// Course card color gradients based on index
const cardGradients = [
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-amber-500 to-orange-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-blue-500 to-indigo-600",
];

function CourseCard({ course, index, enrollment }: { course: Course; index: number; enrollment?: Enrollment }) {
  const gradient = cardGradients[index % cardGradients.length];
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;
  const isCompleted = enrollment?.status === "completed" || progress >= 100;
  const isInProgress = isEnrolled && progress > 0 && !isCompleted;

  const getEnrollmentBadge = () => {
    if (isCompleted) {
      return <Badge className="bg-green-600 hover:bg-green-600 text-xs">Completed</Badge>;
    }
    if (isInProgress) {
      return <Badge className="bg-blue-600 hover:bg-blue-600 text-xs">In Progress</Badge>;
    }
    if (isEnrolled) {
      return <Badge className="bg-slate-600 hover:bg-slate-600 text-xs">Enrolled</Badge>;
    }
    return null;
  };

  return (
    <Link href={`/courses/${course.slug || course._id}`}>
      <Card className="overflow-hidden group cursor-pointer h-full hover:shadow-lg transition-shadow">
        <div className={`h-36 ${gradient} relative`}>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {course.level}
            </Badge>
            {getEnrollmentBadge()}
          </div>
          <div className="absolute bottom-3 left-3">
            <div className="h-8 w-8 rounded-full bg-black/30 flex items-center justify-center">
              <Play className="h-4 w-4 text-white fill-white" />
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-medium">{course.rating?.toFixed(1) || "N/A"}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({(course.enrollmentCount || 0).toLocaleString()} enrolled)
            </span>
          </div>
          {isEnrolled ? (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">
                  {isCompleted ? "Completed" : `${progress}% complete`}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-primary"}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <Button size="sm" className={`h-7 text-xs w-full mt-2 ${isCompleted ? "bg-green-600 hover:bg-green-700" : ""}`}>
                {isCompleted ? "Review Course" : "Continue"}
              </Button>
            </div>
          ) : (
            <div className="mt-3">
              <Button size="sm" className="h-7 text-xs w-full">Start Training</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-36 w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-7 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { data: coursesResponse, isLoading } = useCourses({
    status: "published",
    limit: 4,
    sort: "enrollmentCount",
    order: "desc",
  });
  const { data: enrollmentsResponse } = useEnrollments();

  const courses = coursesResponse?.data || [];
  const enrollments = enrollmentsResponse?.data || [];

  // Create a map of course ID to enrollment for quick lookup
  const enrollmentMap = new Map<string, Enrollment>();
  enrollments.forEach((enrollment) => {
    if (!enrollment.course) return; // Skip enrollments with null/undefined course
    const courseId = typeof enrollment.course === "object" ? enrollment.course._id : enrollment.course;
    enrollmentMap.set(courseId, enrollment);
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50/50 to-white py-16 lg:py-24">
        <div className="container max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 text-xs">
              Preparatory Training Portal
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Equipping Ministers for{" "}
              <span className="text-primary">Effective Ministry</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
              Access comprehensive training materials, video lessons, and live sessions
              designed to prepare you for impactful ministry work worldwide.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated ? (
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild>
                  <Link href="/register">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link href="/courses">View Training Materials</Link>
              </Button>
            </div>
            {!isAuthenticated && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Free access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Video training</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Live sessions</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight">Your Training Journey</h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to prepare for effective ministry
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border bg-background">
                  <CardContent className="p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border bg-background">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Training Materials Section */}
      <section className="py-16">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Training Materials</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Start your preparation with our training resources
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/courses">
                View All Training
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <>
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
              </>
            ) : courses.length > 0 ? (
              courses.map((course, index) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  index={index}
                  enrollment={enrollmentMap.get(course._id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No training materials available yet.</p>
                <Button className="mt-4" asChild>
                  <Link href="/courses">Browse All Training</Link>
                </Button>
              </div>
            )}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/courses">
                View All Training
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              {isAuthenticated ? "Continue Your Training" : "Ready to Begin Your Training?"}
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              {isAuthenticated
                ? "Pick up where you left off or explore new training materials."
                : "Start your preparation journey today. Access training materials and live sessions."}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated ? (
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/my-courses">
                    My Training
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register">
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="border-white/50 text-white bg-white/10 hover:bg-white/20 hover:text-white"
                asChild
              >
                <Link href="/courses">Explore Training</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
