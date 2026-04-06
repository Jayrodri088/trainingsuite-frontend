"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi, coursesApi } from "@/lib/api";
import type { CourseQuiz } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageLoader } from "@/components/ui/page-loader";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { T, useT } from "@/components/t";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface QuizQuestionForm {
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export default function AdminCourseQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const { toast } = useToast();
  const { t } = useT();

  const [questions, setQuestions] = useState<QuizQuestionForm[]>([
    {
      question: "",
      options: ["", ""],
      correctOptionIndex: 0,
    },
  ]);
  const [passPercentage, setPassPercentage] = useState(70);

  const {
    data: courseResponse,
    isLoading: courseLoading,
    isError: courseError,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => coursesApi.getById(courseId),
  });

  const {
    data: quizResponse,
    isLoading: quizLoading,
  } = useQuery({
    queryKey: ["course-quiz-admin", courseId],
    queryFn: () => adminApi.getCourseQuiz(courseId),
    retry: false,
  });

  useEffect(() => {
    const quiz = quizResponse?.data as CourseQuiz | undefined;
    if (quiz?.questions && quiz.questions.length > 0) {
      setQuestions(
        quiz.questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex ?? 0,
        }))
      );
      setPassPercentage(quiz.passPercentage ?? 70);
    }
  }, [quizResponse]);

  const saveMutation = useMutation({
    mutationFn: () =>
      adminApi.saveCourseQuiz(courseId, {
        questions,
        passPercentage,
      }),
    onSuccess: () => {
      toast({ title: t("Quiz saved successfully") });
    },
    onError: (error: unknown) => {
      toast({ title: getErrorMessage(error) || t("Failed to save quiz"), variant: "destructive" });
    },
  });

  const course = courseResponse?.data;

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: "", options: ["", ""], correctOptionIndex: 0 },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, ""] } : q
      )
    );
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        if (q.options.length <= 2) return q;
        const options = q.options.filter((_, idx) => idx !== oIndex);
        let correctIndex = q.correctOptionIndex;
        if (oIndex === correctIndex) correctIndex = 0;
        else if (oIndex < correctIndex) correctIndex = correctIndex - 1;
        return { ...q, options, correctOptionIndex: correctIndex };
      })
    );
  };

  if (courseLoading || quizLoading) {
    return <PageLoader />;
  }

  if (courseError || !course) {
    return (
      <div className="py-10">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/courses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold ml-2">
            <T>Course not found</T>
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/courses/${courseId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              <T>Course Quiz</T>
            </h1>
            <p className="text-sm text-gray-600">
              <T>Define the quiz students must take after completing this course.</T>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-white p-4">
        <div className="flex items-center gap-3">
          <div>
            <Label htmlFor="passPercentage" className="text-sm font-medium">
              <T>Pass percentage</T>
            </Label>
            <p className="text-xs text-gray-500">
              <T>Learners must score at least this percentage to pass.</T>
            </p>
          </div>
          <Input
            id="passPercentage"
            type="number"
            min={1}
            max={100}
            value={passPercentage}
            onChange={(e) =>
              setPassPercentage(Number(e.target.value) || 70)
            }
            className="w-24"
          />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="rounded-lg border bg-white p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Label className="text-xs font-semibold uppercase text-gray-500">
                  <T>Question</T> {qIndex + 1}
                </Label>
                <Textarea
                  value={q.question}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((item, i) =>
                        i === qIndex
                          ? { ...item, question: e.target.value }
                          : item
                      )
                    )
                  }
                  rows={2}
                  placeholder={t("Enter the quiz question here")}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveQuestion(qIndex)}
                disabled={questions.length === 1}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-gray-500">
                <T>Options</T>
              </Label>
              {q.options.map((option, oIndex) => (
                <div
                  key={oIndex}
                  className="flex items-center gap-2 border rounded-md px-2 py-1.5 bg-gray-50"
                >
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    className="h-4 w-4 text-blue-600"
                    checked={q.correctOptionIndex === oIndex}
                    onChange={() =>
                      setQuestions((prev) =>
                        prev.map((item, i) =>
                          i === qIndex
                            ? { ...item, correctOptionIndex: oIndex }
                            : item
                        )
                      )
                    }
                  />
                  <Input
                    value={option}
                    onChange={(e) =>
                      setQuestions((prev) =>
                        prev.map((item, i) =>
                          i === qIndex
                            ? {
                                ...item,
                                options: item.options.map((opt, idx) =>
                                  idx === oIndex ? e.target.value : opt
                                ),
                              }
                            : item
                        )
                      )
                    }
                    className="flex-1 text-sm"
                    placeholder={t("Option") + ` ${oIndex + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(qIndex, oIndex)}
                    disabled={q.options.length <= 2}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddOption(qIndex)}
                className="mt-1"
              >
                <Plus className="h-4 w-4 mr-1" />
                <T>Add option</T>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddQuestion}
        >
          <Plus className="h-4 w-4 mr-1" />
          <T>Add question</T>
        </Button>
        <Button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? <T>Saving...</T> : <T>Save Quiz</T>}
        </Button>
      </div>
    </div>
  );
}
