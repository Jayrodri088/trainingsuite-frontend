"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LanguageSelector } from "@/components/language-selector";

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

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
