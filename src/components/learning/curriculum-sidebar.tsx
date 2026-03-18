"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { LessonItem } from "./lesson-item";
import type { Module, Lesson } from "@/types";
import { T, useT } from "@/components/t";

export function CurriculumSidebar({
  modules,
  currentLessonId,
  onSelectLesson,
  courseProgress,
  completedLessonIds,
  courseSlug,
}: {
  modules: Module[];
  currentLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  courseProgress: number;
  completedLessonIds: Set<string>;
  courseSlug: string;
}) {
  const { t } = useT();
  const defaultOpenModules = modules.map((m) => m._id);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 sm:p-4 pt-14 lg:pt-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-sans font-medium text-black"><T>Course Progress</T></span>
          <span className="text-sm text-gray-500">{courseProgress}%</span>
        </div>
        <Progress value={courseProgress} className="h-2" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4">
          <Accordion type="multiple" defaultValue={defaultOpenModules} className="space-y-2">
            {modules.map((module, moduleIndex) => {
              const lessons = (module.lessons || []) as Lesson[];
              const completedLessonsCount = lessons.filter((l) => completedLessonIds.has(l._id)).length;

              return (
                <AccordionItem
                  key={module._id}
                  value={module._id}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                >
                  <AccordionTrigger className="px-3 sm:px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-2 sm:gap-3 text-left min-w-0">
                      <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-[#0052CC]/10 text-[#0052CC] text-xs font-medium">
                        {moduleIndex + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-sans font-medium text-sm text-black truncate">{t(module.title)}</p>
                        <p className="text-xs text-gray-500">
                          {completedLessonsCount}/{lessons.length} <T>lessons</T>
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 sm:px-4 pb-3">
                    <div className="space-y-1">
                      {lessons.map((lesson) => (
                        <LessonItem
                          key={lesson._id}
                          lesson={lesson}
                          isActive={currentLessonId === lesson._id}
                          isCompleted={completedLessonIds.has(lesson._id)}
                          isLocked={false}
                          onClick={() => onSelectLesson(lesson)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>

      <div className="shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4">
        <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
          <p className="text-xs font-sans font-semibold text-black">
            <T>Course Quiz</T>
          </p>
          <p className="text-xs font-sans text-gray-600">
            {courseProgress >= 100 ? (
              <T>You have completed the course. You can now take the quiz.</T>
            ) : (
              <T>Complete the entire course to unlock the quiz.</T>
            )}
          </p>
          <a
            href={`/courses/${courseSlug}/quiz`}
            className={`mt-1 inline-flex items-center justify-center w-full rounded-md px-3 py-1.5 text-xs font-sans font-semibold shadow-sm ${
              courseProgress >= 100
                ? "bg-[#0052CC] text-white hover:bg-[#003d99]"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            aria-disabled={courseProgress < 100}
            onClick={(e) => {
              if (courseProgress < 100) {
                e.preventDefault();
              }
            }}
          >
            <T>Take Quiz</T>
          </a>
        </div>
      </div>
    </div>
  );
}
