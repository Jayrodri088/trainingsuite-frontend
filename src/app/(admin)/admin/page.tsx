"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Users,
  BookOpen,
  TrendingUp,
  Eye,
  Award,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminApi } from "@/lib/api/admin";
import { coursesApi } from "@/lib/api/courses";
import { getInitials, formatDate } from "@/lib/utils";
import type { OverviewAnalytics, Course } from "@/types";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}

function StatCard({ title, value, icon, color, isLoading }: StatCardProps) {
  // Ensure the icon component accepts a className prop
  const Icon = icon as React.ComponentType<{ className?: string }>;

  return (
    <Card className="rounded-xl border-gray-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-sans text-gray-600 truncate">{title}</p>
            {isLoading ? (
              <Skeleton className="h-6 sm:h-7 w-20 mt-1 rounded-lg" />
            ) : (
              <p className="text-lg sm:text-xl font-sans font-bold text-black mt-1">{value}</p>
            )}
          </div>
          <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  // Fetch overview analytics
  const { data: analyticsResponse, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminApi.getOverview(),
  });

  // Fetch top courses
  const { data: coursesResponse, isLoading: coursesLoading } = useQuery({
    queryKey: ["admin-top-courses"],
    queryFn: () => coursesApi.getAll({ limit: 5, sort: "enrollmentCount", order: "desc" }),
  });

  const analytics: OverviewAnalytics | undefined = analyticsResponse?.data;
  const topCourses = coursesResponse?.data || [];
  const isLoading = analyticsLoading || coursesLoading;

  const stats = [
    {
      title: "Total Users",
      value: analytics?.users?.total?.toLocaleString() || "0",
      icon: Users,
      color: "bg-blue-600",
    },
    {
      title: "Total Courses",
      value: analytics?.courses?.total?.toString() || "0",
      icon: BookOpen,
      color: "bg-violet-600",
    },
    {
      title: "Enrollments",
      value: analytics?.enrollments?.total?.toLocaleString() || "0",
      icon: TrendingUp,
      color: "bg-emerald-600",
    },
    {
      title: "Completed",
      value: analytics?.enrollments?.completed?.toLocaleString() || "0",
      icon: Award,
      color: "bg-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-base font-bold uppercase tracking-wide">New Users</CardTitle>
            <CardDescription>Joined this month</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {analyticsLoading ? (
              <Skeleton className="h-10 w-20 rounded-[10px]" />
            ) : (
              <div className="text-4xl font-light text-blue-600">
                {analytics?.users?.newThisMonth || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-base font-bold uppercase tracking-wide">Active Learners</CardTitle>
            <CardDescription>Currently enrolled</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {analyticsLoading ? (
              <Skeleton className="h-10 w-20 rounded-[10px]" />
            ) : (
              <div className="text-4xl font-light text-green-600">
                {analytics?.enrollments?.active || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-base font-bold uppercase tracking-wide">Certificates</CardTitle>
            <CardDescription>Total awarded</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {analyticsLoading ? (
              <Skeleton className="h-10 w-20 rounded-[10px]" />
            ) : (
              <div className="text-4xl font-light text-amber-600">
                {analytics?.enrollments?.completed || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
          <CardHeader className="p-6 border-b border-gray-200 bg-gray-50">
            <CardTitle className="font-sans font-bold text-black text-lg">Platform Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
                <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-600">Published Courses</span>
                  <span className="font-bold font-mono">{analytics?.courses?.published || 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-600">Completed Enrollments</span>
                  <span className="font-bold font-mono">{analytics?.enrollments?.completed || 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-600">Upcoming Sessions</span>
                  <span className="font-bold font-mono">{analytics?.liveSessions?.upcoming || 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-600">Live Sessions Now</span>
                  <Badge variant={analytics?.liveSessions?.live ? "default" : "secondary"} className="rounded-[8px]">
                    {analytics?.liveSessions?.live || 0}
                  </Badge>
                </div>
              </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
          <CardHeader className="p-6 border-b border-gray-200 bg-gray-50">
            <CardTitle className="font-sans font-bold text-black text-lg">Quick Actions</CardTitle>
            <CardDescription>Administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 rounded-[12px] border-gray-200 bg-white shadow-sm hover:bg-muted" asChild>
                <Link href="/admin/users">
                  <Users className="h-8 w-8 text-gray-600" />
                  <span className="text-xs font-sans font-semibold">Manage Users</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 rounded-[12px] border-gray-200 bg-white shadow-sm hover:bg-muted" asChild>
                <Link href="/admin/courses">
                  <BookOpen className="h-8 w-8 text-gray-600" />
                  <span className="text-xs font-sans font-semibold">Manage Courses</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 rounded-[12px] border-gray-200 bg-white shadow-sm hover:bg-muted" asChild>
                <Link href="/admin/categories">
                  <TrendingUp className="h-8 w-8 text-gray-600" />
                  <span className="text-xs font-sans font-semibold">Categories</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-6 flex flex-col items-center gap-3 rounded-[12px] border-gray-200 bg-white shadow-sm hover:bg-muted" asChild>
                <Link href="/admin/announcements">
                  <Megaphone className="h-8 w-8 text-gray-600" />
                  <span className="text-xs font-sans font-semibold">Announcements</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <CardTitle className="font-sans font-bold text-black text-lg">Top Performing Courses</CardTitle>
            <CardDescription>Highest enrollment counts</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="rounded-[10px] border-gray-200 hover:bg-gray-50 hover:text-[#0052CC] text-sm font-semibold" asChild>
            <Link href="/admin/courses">View All Courses</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {topCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No courses published yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-transparent">
                    <TableHead className="pl-6">Course</TableHead>
                    <TableHead className="text-right">Enrollments</TableHead>
                    <TableHead className="text-right">Level</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="w-[80px] pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCourses.map((course: Course) => (
                    <TableRow key={course._id} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-16 bg-muted flex items-center justify-center overflow-hidden border border-gray-200 rounded-[10px]">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <BookOpen className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{course.title}</p>
                            <Badge variant={course.status === "published" ? "default" : "secondary"} className="mt-1 rounded-[8px] text-[10px] h-5 font-semibold">
                              {course.status}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {(course.enrollmentCount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="rounded-[8px] font-sans font-medium text-gray-600 border-gray-200">{course.level || "All Levels"}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {course.rating?.toFixed(1) || "N/A"}
                      </TableCell>
                      <TableCell className="pr-6">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[10px] hover:bg-[#0052CC]/10 hover:text-[#0052CC]" asChild>
                          <Link href={`/courses/${course.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
