"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LiveSessionCard } from "./live-session-card";
import { LiveSessionCardSkeleton } from "./live-session-card";
import type { LiveSession } from "@/types";
import { T } from "@/components/t";

interface LiveSessionsSectionProps {
  sessions: LiveSession[];
  isLoading: boolean;
  hasLiveNow: boolean;
}

export function LiveSessionsSection({
  sessions,
  isLoading,
  hasLiveNow,
}: LiveSessionsSectionProps) {
  if (sessions.length === 0 && !isLoading) return null;

  return (
    <section className="py-24 md:py-32 border-t border-gray-200 bg-gray-50">
      <div className="container max-w-7xl px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              {hasLiveNow && (
                <Badge className="bg-red-600 text-white font-bold rounded-none border-0 uppercase text-[10px] tracking-wider animate-pulse">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white inline-block animate-pulse" />
                  <T>Live Now</T>
                </Badge>
              )}
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-[#3a3a3a]">
              <T>Live Sessions</T>
            </h2>
            <p className="text-lg text-[#6a6a6a] font-light">
              <T>Join real-time interactive sessions with our leadership and ministry team.</T>
            </p>
          </div>
          <Link
            href="/live-sessions"
            className="hidden md:flex items-center text-sm font-bold uppercase tracking-widest hover:text-muted-foreground transition-colors"
          >
            <T>All Sessions</T>
            <ArrowRight className="ml-3 h-4 w-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(4)].map((_, i) => <LiveSessionCardSkeleton key={i} />)
          ) : (
            sessions.map((session) => (
              <LiveSessionCard key={session._id} session={session} />
            ))
          )}
        </div>

        <Link
          href="/live-sessions"
          className="md:hidden mt-8 flex items-center justify-center h-12 border border-border text-sm font-bold uppercase tracking-widest hover:bg-secondary transition-colors"
        >
          <T>All Sessions</T>
          <ArrowRight className="ml-3 h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
