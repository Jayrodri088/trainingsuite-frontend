"use client";

import { useQuery } from "@tanstack/react-query";
import { coursesApi } from "@/lib/api";
import type { CourseFilters } from "@/types";

export function useCourses(filters?: CourseFilters) {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => coursesApi.getAll(filters),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => coursesApi.getById(id),
    enabled: !!id,
  });
}

export function useCourseCurriculum(id: string) {
  return useQuery({
    queryKey: ["course", id, "curriculum"],
    queryFn: () => coursesApi.getCurriculum(id),
    enabled: !!id,
  });
}

export function useCourseRatings(id: string, page = 1) {
  return useQuery({
    queryKey: ["course", id, "ratings", page],
    queryFn: () => coursesApi.getRatings(id, page),
    enabled: !!id,
  });
}
