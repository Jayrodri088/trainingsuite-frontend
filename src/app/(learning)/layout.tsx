"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LanguageSelector } from "@/components/language-selector";
import { useAuth } from "@/hooks";

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth();
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (auth.user && !auth.user.portalAccessPaidAt) {
      router.replace("/complete-access");
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, router]);

  if (!auth.isLoading && (!auth.isAuthenticated || !auth.user?.portalAccessPaidAt)) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[#f5f5f5]">
        <div className="sticky top-0 z-30 flex justify-end border-b border-gray-200 bg-[#FAFAFA] px-4 py-2 sm:px-6">
          <LanguageSelector />
        </div>
        {children}
      </div>
    </QueryClientProvider>
  );
}
