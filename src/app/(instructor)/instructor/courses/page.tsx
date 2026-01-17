"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  Star,
  DollarSign,
  Clock,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { coursesApi } from "@/lib/api/courses";
import type { Course, CourseStatus } from "@/types";
import { format, parseISO } from "date-fns";

export default function InstructorCoursesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["instructor-courses", statusFilter],
    queryFn: () => coursesApi.getAll({
      limit: 50,
      status: statusFilter !== "all" ? statusFilter as CourseStatus : undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
      toast({ title: "Course deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete course", variant: "destructive" });
    },
  });

  const courses = coursesData?.data || [];
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status?: CourseStatus) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-600">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === "published").length,
    draft: courses.filter((c) => c.status === "draft").length,
    totalStudents: courses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">
            Manage and create your courses.
          </p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Edit className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Courses</CardTitle>
              <CardDescription>
                {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No courses found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first course to get started"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button asChild className="mt-4">
                  <Link href="/instructor/courses/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[200px]">{course.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : "Beginner"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(course.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {course.enrollmentCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.isFree ? (
                        <Badge variant="secondary">Free</Badge>
                      ) : (
                        <span className="font-medium">${course.price}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {course.averageRating?.toFixed(1) || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(parseISO(course.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/courses/${course.slug}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Public Page
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/instructor/courses/${course._id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Course
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/instructor/courses/${course._id}/curriculum`}>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Manage Curriculum
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/instructor/courses/${course._id}/students`}>
                              <Users className="h-4 w-4 mr-2" />
                              View Students
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCourse(course);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCourse?.title}"? This action cannot be
              undone and will remove all associated lessons, quizzes, and student enrollments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCourse && deleteMutation.mutate(selectedCourse._id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
