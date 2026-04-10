"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Users, Radio, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { LiveSession } from "@/types";
import { normalizeUploadUrl } from "@/lib/utils";
import { isLiveOnAir, isScheduledWindowOver } from "@/lib/live-session-utils";
import { format, parseISO } from "date-fns";
import { T, useT } from "@/components/t";

export function LiveSessionCard({ session }: { session: LiveSession }) {
  const { t: translate } = useT();
  const [timeSync, setTimeSync] = useState(0);

  useEffect(() => {
    if (session.status !== "live" && session.status !== "scheduled") return;
    const id = window.setInterval(() => setTimeSync((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [session.status]);

  void timeSync;
  const onAir = isLiveOnAir(session);
  const staleLive = session.status === "live" && isScheduledWindowOver(session);
  const isScheduled = session.status === "scheduled";

  return (
    <Link href={`/live-sessions/${session._id}`} className="block h-full group">
      <div className="h-full flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden transition-colors hover:border-gray-300 relative">
        {onAir && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 animate-pulse z-10" />
        )}

        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden rounded-t-xl bg-gray-100">
          {normalizeUploadUrl(session.thumbnail) ? (
            <img
              src={normalizeUploadUrl(session.thumbnail)}
              alt={translate(session.title)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center">
              <Radio className="h-12 w-12 text-white/20" />
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-3 right-3 z-10">
            {onAir ? (
              <Badge className="bg-red-600 text-white font-bold rounded-full border-0 uppercase text-[10px] tracking-wider animate-pulse">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white inline-block" />
                <T>Live Now</T>
              </Badge>
            ) : staleLive ? (
              <Badge className="bg-gray-100 text-gray-600 border-gray-200 rounded-full text-xs">
                <T>Ended</T>
              </Badge>
            ) : isScheduled ? (
              <Badge className="bg-white/90 text-gray-700 border-gray-200 rounded-full text-xs">
                <T>Upcoming</T>
              </Badge>
            ) : null}
          </div>

          {/* Viewer count */}
          {onAir && session.attendeeCount > 0 && (
            <div className="absolute bottom-3 left-3 z-10">
              <Badge className="bg-black/60 text-white rounded-full border-0 text-xs">
                <Users className="h-3 w-3 mr-1" />
                {session.attendeeCount} <T>watching</T>
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{format(parseISO(session.scheduledAt), "MMM d, yyyy")}</span>
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              {onAir ? <T>Live Stream</T> : staleLive ? <T>Session ended</T> : <T>Live Session</T>}
            </span>
          </div>

          <h3 className="font-sans text-lg font-bold text-black mb-4 leading-tight line-clamp-2 group-hover:underline decoration-1 underline-offset-2">
            {translate(session.title)}
          </h3>

          {session.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
              {translate(session.description)}
            </p>
          )}

          {/* CTA */}
          <div className="mt-auto pt-2">
            {onAir ? (
              <span className="inline-flex w-full justify-center items-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                <T>Join Live</T>
              </span>
            ) : staleLive ? (
              <span className="inline-flex w-full justify-center items-center rounded-xl border border-[#D4D4D4] bg-white py-2.5 text-sm font-medium text-gray-800 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)] group-hover:bg-gray-50 transition-colors">
                <T>View Session</T>
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            ) : isScheduled ? (
              <span className="inline-flex w-full justify-center items-center rounded-xl border border-[#D4D4D4] bg-white py-2.5 text-sm font-medium text-gray-800 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)] group-hover:bg-gray-50 transition-colors">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                {format(parseISO(session.scheduledAt), "h:mm a")}
                <ArrowRight className="ml-auto h-4 w-4" />
              </span>
            ) : (
              <span className="inline-flex w-full justify-center items-center rounded-xl border border-[#D4D4D4] bg-white py-2.5 text-sm font-medium text-gray-800 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)] group-hover:bg-gray-50 transition-colors">
                <T>View Recording</T>
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LiveSessionCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl h-full bg-white overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-t-xl rounded-b-none" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded-lg" />
        </div>
        <Skeleton className="h-5 w-full rounded-lg" />
        <Skeleton className="h-5 w-4/5 rounded-lg" />
        <div className="pt-2">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
