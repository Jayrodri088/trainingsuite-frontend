"use client";

import { use, useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle, Menu, BookOpen, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
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
import { getErrorMessage } from "@/lib/utils";

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

  const { data: courseResponse, isLoading: courseLoading, isError: courseError, refetch: refetchCourse } = useCourse(resolvedParams.slug);
  const { data: curriculumResponse, isLoading: curriculumLoading, isError: curriculumError, refetch: refetchCurriculum } = useCourseCurriculum(resolvedParams.slug);
  const { data: enrollmentResponse, isLoading: enrollmentLoading, isError: enrollmentError, refetch: refetchEnrollment } = useEnrollment(resolvedParams.slug);

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
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        toast({ title: t("Not enrolled"), description: t("You must be enrolled in this course to track progress."), variant: "destructive" });
      } else {
        toast({ title: getErrorMessage(error), description: t("Something went wrong. Try again."), variant: "destructive" });
      }
    },
  });

  const curriculumData = curriculumResponse?.data as { curriculum?: Module[] } | undefined;
  const modules = (curriculumData?.curriculum || []) as Module[];
  const allLessons = useMemo(() => modules.flatMap((m) => (m.lessons || []) as Lesson[]), [modules]);
  const firstLesson = allLessons[0];
  const nextIncompleteLesson = useMemo(() => {
    return allLessons.find((l) => !baseCompletedFromEnrollment.has(l._id)) ?? firstLesson;
  }, [allLessons, baseCompletedFromEnrollment, firstLesson]);

  useEffect(() => {
    if (currentLesson !== null || !nextIncompleteLesson) return;
    setCurrentLesson(nextIncompleteLesson ?? null);
  }, [currentLesson, nextIncompleteLesson]);

  const activeLesson = currentLesson || nextIncompleteLesson || firstLesson || null;

  function handleVideoEnd() {
    if (activeLesson && !completedLessonIds.has(activeLesson._id) && !markCompleteMutation.isPending) {
      markCompleteMutation.mutate(activeLesson._id);
    }
  }

  const isLoading = courseLoading || curriculumLoading || enrollmentLoading;
  const hasError = courseError || curriculumError || enrollmentError;
  const course = courseResponse?.data as Course | undefined;
  const courseProgress = enrollmentResponse?.data?.progress || 0;
  const isEnrolled = !!enrollmentResponse?.data;

  const currentIndex = useMemo(() => {
    const activeId = activeLesson?._id;
    if (!activeId) return -1;
    return allLessons.findIndex((l) => l._id === activeId);
  }, [allLessons, activeLesson?._id]);

  const lessonPosition = useMemo(() => {
    if (currentIndex < 0) return null;
    return { current: currentIndex + 1, total: allLessons.length };
  }, [currentIndex, allLessons.length]);

  const prevLesson = useMemo(() => {
    if (currentIndex <= 0) return null;
    return allLessons[currentIndex - 1] ?? null;
  }, [allLessons, currentIndex]);

  const nextLesson = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= allLessons.length - 1) return null;
    return allLessons[currentIndex + 1] ?? null;
  }, [allLessons, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable;
      if (isInput) return;
      if (e.key === "ArrowLeft" && prevLesson) {
        e.preventDefault();
        setCurrentLesson(prevLesson);
      } else if (e.key === "ArrowRight" && nextLesson) {
        e.preventDefault();
        setCurrentLesson(nextLesson);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevLesson, nextLesson]);

  useEffect(() => {
    if (isLoading) return;
    if (!course) return;
    if (isEnrolled) return;
    router.replace(`/courses/${course.slug || course._id}`);
  }, [course, isEnrolled, isLoading, router]);

  const refetchAll = useCallback(() => {
    refetchCourse();
    refetchCurriculum();
    refetchEnrollment();
  }, [refetchCourse, refetchCurriculum, refetchEnrollment]);

  if (isLoading) return <PageLoader />;

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-sans font-bold text-black"><T>Something went wrong</T></h1>
          <p className="font-sans text-gray-600 mt-2"><T>We couldn&apos;t load this page. Please try again.</T></p>
          <Button className="mt-4 rounded-lg bg-[#0052CC] hover:bg-[#003d99] text-white font-sans font-bold" onClick={() => refetchAll()}>
            <T>Try again</T>
          </Button>
          <Button variant="outline" className="mt-3 ml-2 rounded-lg" onClick={() => router.push("/courses")}>
            <T>Back to Courses</T>
          </Button>
        </div>
      </div>
    );
  }

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
    return null;
  }

  const courseSlug = course.slug || course._id;
  const courseHref = `/courses/${courseSlug}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="shrink-0 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-600 font-sans mb-2">
            <Link href="/courses" className="hover:text-[#0052CC] transition-colors"><T>Courses</T></Link>
            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
            <Link href={courseHref} className="truncate max-w-[200px] sm:max-w-none hover:text-[#0052CC] transition-colors">{t(course.title)}</Link>
            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-black font-medium"><T>Learn</T></span>
          </nav>
          <div className="h-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg font-sans font-medium text-gray-700 hover:text-[#0052CC] hover:bg-[#0052CC]/5 shrink-0"
                onClick={() => router.push(courseHref)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <T>Back to Course</T>
              </Button>
              <div className="hidden sm:block min-w-0">
                <h1 className="font-sans font-semibold text-sm text-black truncate">{t(course.title)}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {lessonPosition && (
                <span className="text-sm text-gray-600 font-sans">
                  <T>Lesson</T> {lessonPosition.current} <T>of</T> {lessonPosition.total}
                </span>
              )}
              <div className="hidden sm:flex items-center gap-2 min-w-[100px]">
                <Progress value={courseProgress} className="h-2 w-20" />
                <span className="text-sm text-gray-500 font-sans whitespace-nowrap">{courseProgress}%</span>
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
                  courseSlug={courseSlug}
                />
              </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-w-0 max-w-[1600px] w-full mx-auto">
          <div className="px-4 sm:px-6 pt-4 sm:pt-5">
            <LearningVideoPlayer lesson={activeLesson} onVideoEnd={handleVideoEnd} lessonId={activeLesson?._id} />
          </div>

          <div className="flex items-center justify-between px-4 sm:px-6 py-3 mt-1 bg-white border-y border-gray-200">
            <Button variant="ghost" size="sm" disabled={!prevLesson} className="rounded-lg font-sans" onClick={() => prevLesson && setCurrentLesson(prevLesson)} title={t("Previous lesson (← Left arrow)")}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              <T>Previous</T>
            </Button>
            {completedLessonIds.has(activeLesson?._id || "") && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 font-sans font-semibold text-sm border border-green-200">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span><T>Completed</T></span>
              </div>
            )}
            <Button variant="ghost" size="sm" disabled={!nextLesson} className="rounded-lg font-sans" onClick={() => nextLesson && setCurrentLesson(nextLesson)} title={t("Next lesson (→ Right arrow)")}>
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
            courseSlug={courseSlug}
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
