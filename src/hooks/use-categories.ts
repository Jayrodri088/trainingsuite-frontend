"use client";

import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll(),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  });
}
