"use client";

import { useQuery } from "@tanstack/react-query";
import { certificatesApi } from "@/lib/api";

export function useCertificates() {
  return useQuery({
    queryKey: ["certificates"],
    queryFn: () => certificatesApi.getAll(),
  });
}

export function useCertificate(id: string) {
  return useQuery({
    queryKey: ["certificate", id],
    queryFn: () => certificatesApi.getById(id),
    enabled: !!id,
  });
}
