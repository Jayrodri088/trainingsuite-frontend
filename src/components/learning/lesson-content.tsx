"use client";

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RichContentRenderer } from "@/components/lessons/rich-content-renderer";
import type { Lesson } from "@/types";
import { T, useT } from "@/components/t";

export function LessonContent({ lesson }: { lesson: Lesson | null }) {
  const { t } = useT();

  if (!lesson) {
    return (
      <div className="p-6 text-center text-gray-600 font-sans">
        <T>Select a lesson to view its content</T>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white">
      <h2 className="text-xl font-sans font-bold text-black mb-4">{t(lesson.title)}</h2>

      {lesson.content ? (
        <RichContentRenderer content={lesson.content} />
      ) : (
        <p className="text-gray-600 font-sans">
          <T>Watch the video above to complete this lesson.</T>
        </p>
      )}

      {lesson.materials && lesson.materials.length > 0 && (
        <div className="mt-8">
          <h3 className="font-sans font-semibold text-black mb-4 flex items-center gap-2">
            <Download className="h-5 w-5" />
            <T>Lesson Materials</T>
          </h3>
          <div className="space-y-2">
            {lesson.materials.map((material: { name?: string }, index: number) => (
              <Card key={index} className="rounded-[12px] border-gray-200 shadow-sm">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-sans text-gray-700">{t(material.name || `Material ${index + 1}`)}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-[10px]">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
