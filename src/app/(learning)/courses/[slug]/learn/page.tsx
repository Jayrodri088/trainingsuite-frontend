"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle, Menu, BookOpen, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCourse, useCourseCurriculum, useEnrollment } from "@/hooks";
import { LessonComments } from "@/components/lessons/lesson-comments";
import { CourseCompletionDialog } from "@/components/courses/course-completion-dialog";
import { useToast } from "@/hooks/use-toast";
import { lessonsApi } from "@/lib/api/lessons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Module, Lesson, Course } from "@/types";
import { T, useT } from "@/components/t";
import { PageLoader } from "@/components/ui/page-loader";
import { LearningVideoPlayer } from "@/components/learning/video-player";
import { CurriculumSidebar } from "@/components/learning/curriculum-sidebar";
import { LessonContent } from "@/components/learning/lesson-content";
import { LessonNotesPanel } from "@/components/learning/lesson-notes-panel";

export default function CourseLearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useT();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [extraCompletedIds, setExtraCompletedIds] = useState<Set<string>>(new Set());

  const { data: courseResponse, isLoading: courseLoading } = useCourse(resolvedParams.slug);
  const { data: curriculumResponse, isLoading: curriculumLoading } = useCourseCurriculum(resolvedParams.slug);
  const { data: enrollmentResponse, isLoading: enrollmentLoading } = useEnrollment(resolvedParams.slug);

  const baseCompletedFromEnrollment = useMemo(() => {
    const completed = enrollmentResponse?.data?.completedLessons;
    return completed ? new Set(completed as string[]) : new Set<string>();
  }, [enrollmentResponse]);

  const completedLessonIds = useMemo(() => {
    const set = new Set(baseCompletedFromEnrollment);
    extraCompletedIds.forEach((id) => set.add(id));
    return set;
  }, [baseCompletedFromEnrollment, extraCompletedIds]);

  const markCompleteMutation = useMutation({
    mutationFn: (lessonId: string) => lessonsApi.markComplete(lessonId),
    onSuccess: (response, lessonId) => {
      setExtraCompletedIds((prev) => new Set([...prev, lessonId]));
      queryClient.invalidateQueries({ queryKey: ["enrollment", resolvedParams.slug] });
      toast({ title: "Lesson completed!" });
      if (response?.data?.certificateIssued) {
        setCompletionDialogOpen(true);
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string }; status?: number } }) => {
      const status = error.response?.status;
      const message = error.response?.data?.message || "Failed to mark lesson as complete";
      if (status === 403) {
        toast({ title: "Not enrolled", description: "You must be enrolled in this course to track progress.", variant: "destructive" });
      } else {
        toast({ title: message, variant: "destructive" });
      }
    },
  });

  const curriculumData = curriculumResponse?.data as { curriculum?: Module[] } | undefined;
  const modules = (curriculumData?.curriculum || []) as Module[];
  const firstLesson = modules[0]?.lessons?.[0] as Lesson | undefined;
  const activeLesson = currentLesson || firstLesson || null;

  function handleVideoEnd() {
    if (activeLesson && !completedLessonIds.has(activeLesson._id) && !markCompleteMutation.isPending) {
      markCompleteMutation.mutate(activeLesson._id);
    }
  }

  const isLoading = courseLoading || curriculumLoading || enrollmentLoading;
  if (isLoading) return <PageLoader />;

  const course = courseResponse?.data as Course | undefined;
  const courseProgress = enrollmentResponse?.data?.progress || 0;
  const isEnrolled = !!enrollmentResponse?.data;

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <h1 className="text-2xl font-sans font-bold text-black"><T>Course not found</T></h1>
          <p className="font-sans text-gray-600 mt-2"><T>The course you are looking for does not exist.</T></p>
          <Button className="mt-4 rounded-lg bg-[#0052CC] hover:bg-[#003d99] text-white font-sans font-bold" onClick={() => router.push("/courses")}>
            <T>Browse Courses</T>
          </Button>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    router.replace(`/courses/${course.slug || course._id}`);
    return null;
  }

  const allLessons = modules.flatMap((m) => (m.lessons || []) as Lesson[]);
  const currentIndex = allLessons.findIndex((l) => l._id === activeLesson?._id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="h-14 shrink-0 border-b border-gray-200 bg-white shadow-sm">
        <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg font-sans font-medium text-gray-700 hover:text-[#0052CC] hover:bg-[#0052CC]/5 shrink-0"
              onClick={() => router.push(`/courses/${course.slug || course._id}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <T>Back to Course</T>
            </Button>
            <div className="hidden sm:block min-w-0">
              <h1 className="font-sans font-semibold text-sm text-black truncate">{t(course.title)}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 font-sans">
              <span>{courseProgress}% <T>complete</T></span>
            </div>
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden rounded-lg border-gray-200 font-sans font-medium">
                  <Menu className="h-4 w-4 mr-2" />
                  <T>Curriculum</T>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0 border-gray-200 bg-white">
                <CurriculumSidebar
                  modules={modules}
                  currentLessonId={activeLesson?._id || null}
                  onSelectLesson={(lesson) => {
                    setCurrentLesson(lesson);
                    setSidebarOpen(false);
                  }}
                  courseProgress={courseProgress}
                  completedLessonIds={completedLessonIds}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-w-0 max-w-[1600px] w-full mx-auto">
          <div className="px-4 sm:px-6 pt-4 sm:pt-5">
            <LearningVideoPlayer lesson={activeLesson} onVideoEnd={handleVideoEnd} lessonId={activeLesson?._id} />
          </div>

          <div className="flex items-center justify-between px-4 sm:px-6 py-3 mt-1 bg-white border-y border-gray-200">
            <Button variant="ghost" size="sm" disabled={!prevLesson} className="rounded-lg font-sans" onClick={() => prevLesson && setCurrentLesson(prevLesson)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              <T>Previous</T>
            </Button>
            {completedLessonIds.has(activeLesson?._id || "") && (
              <div className="flex items-center gap-2 text-sm text-green-600 font-sans">
                <CheckCircle className="h-4 w-4 mr-2" />
                <T>Completed</T>
              </div>
            )}
            <Button variant="ghost" size="sm" disabled={!nextLesson} className="rounded-lg font-sans" onClick={() => nextLesson && setCurrentLesson(nextLesson)}>
              <T>Next</T>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <Tabs defaultValue="content" className="flex-1 flex flex-col min-h-0 mt-1 bg-white border-t border-gray-200">
            <div className="px-4 sm:px-6 pt-4">
              <TabsList className="w-full justify-start rounded-xl border border-gray-200 bg-gray-100 h-12 px-2 overflow-x-auto flex-nowrap gap-1">
                <TabsTrigger value="content" className="shrink-0 rounded-lg px-4 data-[state=active]:bg-white data-[state=active]:text-[#0052CC] data-[state=active]:shadow-sm font-sans font-medium text-gray-600 data-[state=active]:font-semibold">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <T>Content</T>
                </TabsTrigger>
                <TabsTrigger value="discussion" className="shrink-0 rounded-lg px-4 font-sans font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-[#0052CC] data-[state=active]:shadow-sm data-[state=active]:font-semibold">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <T>Discussion</T>
                </TabsTrigger>
                <TabsTrigger value="notes" className="shrink-0 rounded-lg px-4 font-sans font-medium text-gray-600 data-[state=active]:bg-white data-[state=active]:text-[#0052CC] data-[state=active]:shadow-sm data-[state=active]:font-semibold">
                  <FileText className="h-4 w-4 mr-2" />
                  <T>Notes</T>
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="content" className="mt-0 flex-1 min-h-0 px-4 sm:px-6 pb-6 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-420px)] min-h-[280px] rounded-xl border border-gray-200 bg-gray-50/50">
                <div className="p-4 sm:p-5">
                  <LessonContent lesson={activeLesson} />
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="discussion" className="mt-0 flex-1 min-h-0 overflow-auto">
              <div className="px-4 sm:px-6 pb-6">
                <LessonComments lessonId={activeLesson?._id || ""} />
              </div>
            </TabsContent>
            <TabsContent value="notes" className="mt-0 flex-1 min-h-0 overflow-auto px-4 sm:px-6 pb-6">
              <div className="h-full min-h-[320px]">
                <LessonNotesPanel lessonId={activeLesson?._id || ""} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="w-72 xl:w-80 shrink-0 border-l border-gray-200 bg-white hidden lg:block overflow-hidden">
          <CurriculumSidebar
            modules={modules}
            currentLessonId={activeLesson?._id || null}
            onSelectLesson={setCurrentLesson}
            courseProgress={courseProgress}
            completedLessonIds={completedLessonIds}
          />
        </aside>
      </div>

      <CourseCompletionDialog
        open={completionDialogOpen}
        onOpenChange={setCompletionDialogOpen}
        course={course}
        onCertificateGenerated={() => queryClient.invalidateQueries({ queryKey: ["certificates"] })}
      />
    </div>
  );
}
