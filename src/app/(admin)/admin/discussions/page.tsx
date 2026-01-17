"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  MessagesSquare,
  Globe,
  BookOpen,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { forumsApi } from "@/lib/api/forums";
import { coursesApi } from "@/lib/api/courses";
import type { Forum } from "@/types";
import { format, parseISO } from "date-fns";

export default function AdminDiscussionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    isGeneral: true,
  });

  const { data: forumsData, isLoading } = useQuery({
    queryKey: ["admin-forums"],
    queryFn: () => forumsApi.getAll(1, 100),
  });

  const { data: coursesData } = useQuery({
    queryKey: ["admin-courses-select"],
    queryFn: () => coursesApi.getAll({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => forumsApi.create({
      title: data.title,
      description: data.description || undefined,
      course: data.isGeneral ? undefined : data.course || undefined,
      isGeneral: data.isGeneral,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forums"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Forum created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create forum", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Forum> }) =>
      forumsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forums"] });
      setDialogOpen(false);
      setSelectedForum(null);
      resetForm();
      toast({ title: "Forum updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update forum", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      course: "",
      isGeneral: true,
    });
  };

  const handleEdit = (forum: Forum) => {
    setSelectedForum(forum);
    setFormData({
      title: forum.title,
      description: forum.description || "",
      course: forum.course || "",
      isGeneral: forum.isGeneral || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedForum) {
      updateMutation.mutate({
        id: selectedForum._id,
        data: {
          title: formData.title,
          description: formData.description || undefined,
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const forums = forumsData?.data || [];
  const courses = coursesData?.data || [];

  const filteredForums = forums.filter((forum) => {
    const matchesSearch = forum.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" ||
      (typeFilter === "general" && forum.isGeneral) ||
      (typeFilter === "course" && !forum.isGeneral);
    return matchesSearch && matchesType;
  });

  const stats = {
    total: forums.length,
    general: forums.filter((f) => f.isGeneral).length,
    courseSpecific: forums.filter((f) => !f.isGeneral).length,
    totalPosts: forums.reduce((acc, f) => acc + (f.postCount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Discussions</h1>
          <p className="text-muted-foreground">
            Manage discussion forums across the platform.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setSelectedForum(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Forum
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Forums</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.general}</p>
                <p className="text-sm text-muted-foreground">General Forums</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.courseSpecific}</p>
                <p className="text-sm text-muted-foreground">Course Forums</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <MessagesSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPosts}</p>
                <p className="text-sm text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forums Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Forums</CardTitle>
              <CardDescription>
                {filteredForums.length} forum{filteredForums.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
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
          ) : filteredForums.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No forums found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first discussion forum"}
              </p>
              {!searchQuery && typeFilter === "all" && (
                <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Forum
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Forum</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForums.map((forum) => (
                  <TableRow key={forum._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{forum.title}</p>
                        {forum.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {forum.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {forum.isGeneral ? (
                        <Badge className="bg-blue-600">General</Badge>
                      ) : (
                        <Badge variant="secondary">Course</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MessagesSquare className="h-4 w-4 text-muted-foreground" />
                        {forum.postCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {(forum as unknown as { memberCount?: number }).memberCount || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {forum.createdAt && format(parseISO(forum.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(forum)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedForum(forum);
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedForum ? "Edit Forum" : "Create Forum"}
            </DialogTitle>
            <DialogDescription>
              {selectedForum
                ? "Update the forum details."
                : "Create a new discussion forum."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Forum title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Forum description..."
                  rows={3}
                />
              </div>
              {!selectedForum && (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isGeneral">General Forum</Label>
                    <Switch
                      id="isGeneral"
                      checked={formData.isGeneral}
                      onCheckedChange={(checked) => setFormData({ ...formData, isGeneral: checked })}
                    />
                  </div>
                  {!formData.isGeneral && (
                    <div className="space-y-2">
                      <Label htmlFor="course">Related Course</Label>
                      <Select
                        value={formData.course}
                        onValueChange={(value) => setFormData({ ...formData, course: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course._id} value={course._id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : selectedForum
                  ? "Update"
                  : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Forum</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedForum?.title}&quot;? This will also delete all posts and comments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedForum(null);
                toast({ title: "Forum deleted successfully" });
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
