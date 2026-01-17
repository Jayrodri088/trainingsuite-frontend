"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Star,
  Award,
  Mail,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usersApi } from "@/lib/api/users";
import { coursesApi } from "@/lib/api/courses";
import { formatCurrency } from "@/lib/utils";
import type { Course, User } from "@/types";

function InstructorProfileSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="container max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-4 text-center md:text-left">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-20 w-full max-w-xl" />
            </div>
          </div>
        </div>
      </div>
      <div className="container max-w-6xl py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const instructor = typeof course.instructor === "object" ? course.instructor : null;

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="aspect-video bg-gradient-to-br from-violet-500 to-purple-600 relative">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-white/60" />
            </div>
          )}
          {course.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-amber-500">Featured</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {course.level && (
              <Badge variant="outline" className="text-xs">
                {course.level}
              </Badge>
            )}
            {course.category && typeof course.category === "object" && (
              <Badge variant="secondary" className="text-xs">
                {course.category.name}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold line-clamp-2 mb-2">{course.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {course.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>{course.rating?.toFixed(1) || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{course.enrollmentCount || 0}</span>
            </div>
          </div>
          <p className="font-semibold text-primary">
            {course.isFree ? "Free" : formatCurrency(course.price, course.currency)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function InstructorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  // First try to get courses to extract instructor info as fallback
  const { data: coursesResponse, isLoading: coursesLoading } = useQuery({
    queryKey: ["instructor-courses", resolvedParams.id],
    queryFn: () => coursesApi.getAll({ instructor: resolvedParams.id, status: "published" }),
  });

  // Try direct instructor endpoint, or extract from courses
  const { data: userResponse, isLoading: userLoading, error } = useQuery({
    queryKey: ["instructor", resolvedParams.id],
    queryFn: async () => {
      try {
        return await usersApi.getInstructorProfile(resolvedParams.id);
      } catch {
        // Fallback: try to get instructor info from courses data
        const courses = coursesResponse?.data || [];
        const courseWithInstructor = courses.find(
          (c) => typeof c.instructor === "object" && c.instructor?._id === resolvedParams.id
        );
        if (courseWithInstructor && typeof courseWithInstructor.instructor === "object") {
          return { data: courseWithInstructor.instructor as User, success: true };
        }
        // Try the authenticated endpoint as last resort
        return await usersApi.getById(resolvedParams.id);
      }
    },
    enabled: !coursesLoading,
  });

  if (userLoading || coursesLoading) {
    return <InstructorProfileSkeleton />;
  }

  const instructor = userResponse?.data;

  if (!instructor || error) {
    return (
      <div className="container max-w-6xl py-16 text-center">
        <h1 className="text-2xl font-bold">Instructor not found</h1>
        <p className="text-muted-foreground mt-2">
          The instructor you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button className="mt-6" onClick={() => router.push("/courses")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Browse Courses
        </Button>
      </div>
    );
  }

  const courses = coursesResponse?.data || [];
  const totalStudents = courses.reduce((acc, course) => acc + (course.enrollmentCount || 0), 0);
  const avgRating = courses.length > 0
    ? courses.reduce((acc, course) => acc + (course.rating || 0), 0) / courses.length
    : 0;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="container max-w-6xl">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 text-slate-300 hover:text-white hover:bg-white/10"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <Avatar className="h-32 w-32 border-4 border-white/20">
              <AvatarImage src={instructor.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                {instructor.name?.charAt(0) || "I"}
              </AvatarFallback>
            </Avatar>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{instructor.name}</h1>
              <p className="text-slate-300 text-lg mb-4">
                {instructor.title || "Instructor"}
              </p>

              {instructor.bio && (
                <p className="text-slate-400 max-w-2xl leading-relaxed mb-6">
                  {instructor.bio}
                </p>
              )}

              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-violet-400" />
                  <span>
                    <strong className="text-white">{courses.length}</strong>{" "}
                    <span className="text-slate-400">Courses</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-violet-400" />
                  <span>
                    <strong className="text-white">{totalStudents.toLocaleString()}</strong>{" "}
                    <span className="text-slate-400">Students</span>
                  </span>
                </div>
                {avgRating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <span>
                      <strong className="text-white">{avgRating.toFixed(1)}</strong>{" "}
                      <span className="text-slate-400">Avg Rating</span>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-violet-400" />
                  <span className="text-slate-400">
                    Joined {new Date(instructor.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="container max-w-6xl py-12">
        <h2 className="text-2xl font-bold mb-6">
          Courses by {instructor.name?.split(" ")[0]}
        </h2>

        {coursesLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No courses yet</h3>
            <p className="text-muted-foreground mt-1">
              This instructor hasn&apos;t published any courses yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
