"use client";

import { CheckCircle, Circle, Lock, Video, FileText, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Lesson } from "@/types";
import { T, useT } from "@/components/t";

export function LessonItem({
  lesson,
  isActive,
  isCompleted,
  isLocked,
  onClick,
}: {
  lesson: Lesson;
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  onClick: () => void;
}) {
  const { t } = useT();

  const getIcon = () => {
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
    if (isLocked) return <Lock className="h-4 w-4 text-gray-500 shrink-0" />;
    if (lesson.type === "video") return <Video className="h-4 w-4 shrink-0" />;
    if (lesson.type === "text") return <FileText className="h-4 w-4 shrink-0" />;
    return <Circle className="h-4 w-4 shrink-0" />;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      className={
        "w-full text-left p-2 sm:p-3 rounded-[10px] transition-colors font-sans " +
        (isActive ? "bg-[#0052CC]/10 border border-[#0052CC]/30 " : isLocked ? "opacity-50 cursor-not-allowed " : "hover:bg-gray-100 ")
      }
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className={"text-sm font-medium line-clamp-2 wrap-break-word " + (isActive ? "text-[#0052CC]" : "text-black")}>
            {t(lesson.title)}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            {lesson.duration ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                {lesson.duration} <T>min</T>
              </span>
            ) : null}
            {lesson.isFree && !isLocked ? (
              <Badge variant="outline" className="text-xs h-5 rounded-[8px] border-gray-200">
                <T>Preview</T>
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}
