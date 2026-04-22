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
import { cn } from "@/lib/utils";
import { T, useT } from "@/components/t";

function getLessonId(lesson: Lesson): string {
  const rawId = (lesson as Lesson & { id?: unknown })._id ?? (lesson as Lesson & { id?: unknown }).id;
  return typeof rawId === "string" ? rawId : String(rawId ?? "");
}

export function CurriculumSidebar({
  modules,
  currentLessonId,
  onSelectLesson,
  courseProgress,
  completedLessonIds,
  sheetLayout = false,
}: {
  modules: Module[];
  currentLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  courseProgress: number;
  completedLessonIds: Set<string>;
  /** When true, reserves space for the sheet close control so the progress % does not overlap it */
  sheetLayout?: boolean;
}) {
  const { t } = useT();
  const visibleModules = modules.filter((module) => ((module.lessons || []) as Lesson[]).length > 0);
  const defaultOpenModules = visibleModules.map((m) => m._id);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div
        className={cn(
          "p-3 sm:p-4 pt-14 lg:pt-4 border-b border-gray-200 shrink-0",
          sheetLayout && "pr-12 sm:pr-14"
        )}
      >
        <div className="flex items-center justify-between gap-3 mb-2 min-w-0">
          <span className="text-sm font-sans font-medium text-black min-w-0 truncate">
            <T>Course Progress</T>
          </span>
          <span className="text-sm text-gray-500 shrink-0 tabular-nums">{courseProgress}%</span>
        </div>
        <Progress value={courseProgress} className="h-2" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4">
          <Accordion type="multiple" defaultValue={defaultOpenModules} className="space-y-2">
            {visibleModules.map((module, moduleIndex) => {
              const lessons = (module.lessons || []) as Lesson[];
              const completedLessonsCount = lessons.filter((l) => completedLessonIds.has(getLessonId(l))).length;

              return (
                <AccordionItem
                  key={module._id}
                  value={module._id}
                  className="border border-gray-200 rounded-[12px] overflow-hidden bg-white"
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
                          key={getLessonId(lesson)}
                          lesson={lesson}
                          isActive={currentLessonId === getLessonId(lesson)}
                          isCompleted={completedLessonIds.has(getLessonId(lesson))}
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
    </div>
  );
}
