"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollmentsApi } from "@/lib/api";

export function useEnrollments() {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: () => enrollmentsApi.getAll(),
  });
}

export function useEnrollment(courseId: string) {
  return useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: () => enrollmentsApi.getByCourse(courseId),
    enabled: !!courseId,
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => enrollmentsApi.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      lessonId,
      progress,
    }: {
      enrollmentId: string;
      lessonId: string;
      progress: number;
    }) => enrollmentsApi.updateProgress(enrollmentId, lessonId, progress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}
