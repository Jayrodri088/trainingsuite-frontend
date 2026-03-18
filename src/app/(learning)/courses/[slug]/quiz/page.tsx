"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { coursesApi, enrollmentsApi } from "@/lib/api";
import type { CourseQuiz, QuizSubmissionResult } from "@/types";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { useToast } from "@/hooks/use-toast";
import { T, useT } from "@/components/t";

export default function CourseQuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useT();

  const [answers, setAnswers] = useState<number[]>([]);

  const {
    data: enrollmentResponse,
    isLoading: enrollmentLoading,
    isError: enrollmentError,
  } = useQuery({
    queryKey: ["enrollment", resolvedParams.slug],
    queryFn: () => enrollmentsApi.getByCourse(resolvedParams.slug),
  });

  const {
    data: quizResponse,
    isLoading: quizLoading,
    isError: quizError,
  } = useQuery({
    queryKey: ["course-quiz", resolvedParams.slug],
    queryFn: () => coursesApi.getQuiz(resolvedParams.slug),
    enabled: !!enrollmentResponse?.data,
  });

  const submitMutation = useMutation({
    mutationFn: (payload: { answers: number[] }) =>
      coursesApi.submitQuiz(resolvedParams.slug, payload.answers),
    onSuccess: (res) => {
      const result = res.data as QuizSubmissionResult | undefined;
      if (!result) return;
      if (result.passed) {
        toast({
          title: t("Quiz passed!"),
          description: t(`You scored ${result.scorePercent}%`),
        });
      } else {
        toast({
          title: t("Quiz not passed"),
          description: t(`You scored ${result.scorePercent}%. You can review the course and try again.`),
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        t("Failed to submit quiz");
      toast({ title: message, variant: "destructive" });
    },
  });

  const enrollment = enrollmentResponse?.data;
  const quiz = quizResponse?.data as CourseQuiz | undefined;
  const courseProgress = enrollment?.progress || 0;
  const canTakeQuiz = courseProgress >= 100;

  useEffect(() => {
    if (!quiz?.questions) return;
    // Initialize answers once quiz questions are available.
    setAnswers(quiz.questions.map(() => -1));
  }, [quiz]);

  useEffect(() => {
    if (!enrollmentLoading && !enrollment) {
      toast({ title: t("You must be enrolled in this course to take the quiz."), variant: "destructive" });
      router.replace(`/courses/${resolvedParams.slug}`);
    }
  }, [enrollment, enrollmentLoading, resolvedParams.slug, router, t, toast]);

  if (enrollmentLoading || quizLoading) {
    return <PageLoader />;
  }

  if (enrollmentError || quizError || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-sans font-bold text-black">
            <T>Unable to load quiz</T>
          </h1>
          <p className="font-sans text-gray-600 mt-2">
            <T>Please ensure you have completed the course and try again.</T>
          </p>
          <Button
            className="mt-4 rounded-lg bg-[#0052CC] hover:bg-[#003d99] text-white font-sans font-bold"
            onClick={() => router.push(`/courses/${resolvedParams.slug}/learn`)}
          >
            <T>Back to Learning</T>
          </Button>
        </div>
      </div>
    );
  }

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const handleSubmit = () => {
    if (!canTakeQuiz) {
      toast({
        title: t("Complete the course first"),
        description: t("Finish all lessons to unlock the quiz."),
        variant: "destructive",
      });
      return;
    }

    if (answers.some((a) => a < 0)) {
      toast({
        title: t("Please answer all questions"),
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate({ answers });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-sans font-bold text-black">
              <T>Course Quiz</T>
            </h1>
            <p className="text-sm text-gray-600 mt-1 font-sans">
              <T>
                Answer all questions. You need at least
              </T>{" "}
              {quiz.passPercentage}% <T>to pass.</T>
            </p>
            <p className="text-xs text-gray-500 mt-1 font-sans">
              <T>Current course progress:</T> {courseProgress}%
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/courses/${resolvedParams.slug}/learn`)}
          >
            <T>Back to Learning</T>
          </Button>
        </div>

        {!canTakeQuiz && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 font-sans">
            <T>Complete the entire course to unlock this quiz.</T>
          </div>
        )}

        <div className="space-y-4">
          {quiz.questions.map((q, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3"
            >
              <p className="text-sm font-sans font-medium text-black">
                <span className="text-gray-500 mr-2">Q{index + 1}.</span>
                {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((option, oIndex) => (
                  <label
                    key={oIndex}
                    className="flex items-center gap-2 cursor-pointer rounded-md border border-transparent px-2 py-1 text-sm hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      className="h-4 w-4 text-blue-600"
                      checked={answers[index] === oIndex}
                      onChange={() => handleAnswerChange(index, oIndex)}
                    />
                    <span className="text-gray-900 font-sans">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end">
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="rounded-lg"
          >
            {submitMutation.isPending ? <T>Submitting...</T> : <T>Submit Quiz</T>}
          </Button>
        </div>
      </div>
    </div>
  );
}

