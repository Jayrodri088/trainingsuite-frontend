"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveSessionCard } from "./live-session-card";
import { LiveSessionCardSkeleton } from "./live-session-card";
import type { LiveSession } from "@/types";
import { isLiveOnAir } from "@/lib/live-session-utils";
import { T } from "@/components/t";

interface LiveSessionsSectionProps {
  sessions: LiveSession[];
  endedSessions: LiveSession[];
  isLoading: boolean;
}

type SessionView = "live" | "ended";

export function LiveSessionsSection({
  sessions,
  endedSessions,
  isLoading,
}: LiveSessionsSectionProps) {
  const [activeView, setActiveView] = useState<SessionView>("live");
  const [timeSync, setTimeSync] = useState(0);

  useEffect(() => {
    if (!sessions.length) return;
    const id = window.setInterval(() => setTimeSync((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [sessions]);

  void timeSync;
  const hasLiveNow = sessions.some(isLiveOnAir);
  const visibleSessions = activeView === "live" ? sessions : endedSessions;
  const emptyMessage =
    activeView === "live"
      ? "No live or upcoming sessions available."
      : "No ended sessions available.";

  if (sessions.length === 0 && endedSessions.length === 0 && !isLoading) return null;

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 border-t border-gray-200 bg-gray-50">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 lg:mb-16 gap-4 md:gap-6">
          <div className="max-w-2xl">
            {hasLiveNow && (
              <div className="mb-3">
                <Badge className="bg-red-600 text-white font-bold rounded-full border-0 uppercase text-[10px] tracking-wider animate-pulse">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white inline-block" />
                  <T>Live Now</T>
                </Badge>
              </div>
            )}
            <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3 text-black">
              <T>Live Sessions</T>
            </h2>
            <p className="text-sm md:text-lg text-gray-600 font-normal">
              <T>Join real-time interactive sessions with our leadership and ministry team.</T>
            </p>
          </div>
          <Link
            href="/live-sessions"
            className="flex items-center gap-2 text-sm md:text-base font-medium text-[#0052CC] hover:text-[#0052CC]/80 transition-colors self-start md:self-auto"
          >
            <T>All Sessions</T>
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
          </Link>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <Button
              type="button"
              variant={activeView === "live" ? "default" : "ghost"}
              className="h-9 rounded-md px-4 text-sm"
              onClick={() => setActiveView("live")}
            >
              <T>Live Sessions</T>
            </Button>
            <Button
              type="button"
              variant={activeView === "ended" ? "default" : "ghost"}
              className="h-9 rounded-md px-4 text-sm"
              onClick={() => setActiveView("ended")}
            >
              <T>Ended Sessions</T>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(4)].map((_, i) => <LiveSessionCardSkeleton key={i} />)
          ) : visibleSessions.length > 0 ? (
            visibleSessions.map((session) => (
              <LiveSessionCard key={session._id} session={session} />
            ))
          ) : (
            <div className="sm:col-span-2 lg:col-span-4 rounded-lg border border-gray-200 bg-white px-6 py-10 text-center">
              <p className="text-sm font-medium text-gray-600">
                <T>{emptyMessage}</T>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
