"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi, enrollmentsApi } from "@/lib/api";
import type { CourseQuiz, EnrollmentWithCourse, QuizSubmissionResult } from "@/types";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { T, useT } from "@/components/t";
import { CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react";

export default function CourseQuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useT();

  const [answers, setAnswers] = useState<number[]>([]);
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionResult | null>(null);

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
    onSuccess: async (res) => {
      const result = res.data as QuizSubmissionResult | undefined;
      if (!result) return;
      setSubmissionResult(result);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["enrollment", resolvedParams.slug] }),
        queryClient.invalidateQueries({ queryKey: ["enrollments"] }),
        queryClient.invalidateQueries({ queryKey: ["course-quiz", resolvedParams.slug] }),
        queryClient.invalidateQueries({ queryKey: ["course", resolvedParams.slug] }),
        queryClient.invalidateQueries({ queryKey: ["course-curriculum", resolvedParams.slug] }),
        queryClient.invalidateQueries({ queryKey: ["certificates"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] }),
      ]);
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
    onError: (error: unknown) => {
      toast({ title: getErrorMessage(error) || t("Failed to submit quiz"), variant: "destructive" });
    },
  });

  const enrollment = enrollmentResponse?.data;
  const quiz = quizResponse?.data as CourseQuiz | undefined;
  const courseProgress = enrollment?.progress || 0;
  const canTakeQuiz = courseProgress >= 100;
  const effectiveResult =
    submissionResult ||
    (enrollment?.quizTakenAt
      ? {
          scorePercent: enrollment.quizScore ?? 0,
          passed: Boolean(enrollment.quizPassed),
          totalQuestions: quiz?.questions.length ?? 0,
          correctCount:
            quiz?.questions.length && enrollment?.quizScore !== undefined
              ? Math.round((enrollment.quizScore / 100) * quiz.questions.length)
              : 0,
          requiredToPass: quiz?.passPercentage ?? 70,
          quizTakenAt: enrollment.quizTakenAt,
        }
      : null);

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

  const handleRetry = () => {
    setSubmissionResult(null);
    setAnswers(quiz.questions.map(() => -1));
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

        {effectiveResult ? (
          <div
            className={`overflow-hidden rounded-2xl border font-sans shadow-sm ${
              effectiveResult.passed
                ? "border-green-200 bg-white text-green-900"
                : "border-red-200 bg-white text-red-900"
            }`}
          >
            <div className={`px-6 py-7 text-white ${
              effectiveResult.passed ? "bg-[#0f7b42]" : "bg-[#b42318]"
            }`}>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                  {effectiveResult.passed ? <Trophy className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {effectiveResult.passed ? <T>Quiz passed!</T> : <T>Quiz not passed</T>}
                  </h2>
                  <p className="mt-1 text-sm text-white/85">
                    {effectiveResult.passed
                      ? t("Your result has been recorded and the rest of your dashboard is refreshing.")
                      : t("Review the material and try again when you’re ready.")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-black">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500"><T>Your score</T></p>
                  <p className="mt-2 text-3xl font-bold">{effectiveResult.scorePercent}%</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-black">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500"><T>Correct answers</T></p>
                  <p className="mt-2 text-3xl font-bold">{effectiveResult.correctCount}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-black">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500"><T>Total questions</T></p>
                  <p className="mt-2 text-3xl font-bold">{effectiveResult.totalQuestions}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-black">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500"><T>Pass mark</T></p>
                  <p className="mt-2 text-3xl font-bold">{effectiveResult.requiredToPass}%</p>
                </div>
              </div>

              <div className={`rounded-xl border px-4 py-3 text-sm ${
                effectiveResult.passed
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}>
                <div className="flex items-start gap-3">
                  {effectiveResult.passed ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  ) : (
                    <RotateCcw className="mt-0.5 h-5 w-5 shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {effectiveResult.passed ? <T>You passed this course quiz.</T> : <T>You have not reached the pass mark yet.</T>}
                    </p>
                    <p className="mt-1">
                      {effectiveResult.passed
                        ? t("You can return to learning or check your updated course progress and rewards.")
                        : t("Retake the quiz now or go back to the course to review the lessons.")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/courses/${resolvedParams.slug}/learn`)}
                >
                  <T>Back to Learning</T>
                </Button>
                {!effectiveResult.passed && (
                  <Button onClick={handleRetry}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    <T>Try Again</T>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
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
                        disabled={submitMutation.isPending}
                        onChange={() => handleAnswerChange(index, oIndex)}
                      />
                      <span className="text-gray-900 font-sans">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end">
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending || Boolean(effectiveResult)}
            className="rounded-lg"
          >
            {submitMutation.isPending
              ? <T>Submitting...</T>
              : effectiveResult
                ? <T>Result Recorded</T>
                : <T>Submit Quiz</T>}
          </Button>
        </div>
      </div>
    </div>
  );
}
