"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizzesApi } from "@/lib/api";

export function useQuiz(id: string) {
  return useQuery({
    queryKey: ["quiz", id],
    queryFn: () => quizzesApi.getById(id),
    enabled: !!id,
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, answers }: { quizId: string; answers: Record<string, string> }) =>
      quizzesApi.submit(quizId, answers),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}
