"use client";

import Link from "next/link";
import { ArrowRight, Users, Radio, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { LiveSession } from "@/types";
import { normalizeUploadUrl } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { T, useT } from "@/components/t";

export function LiveSessionCard({ session }: { session: LiveSession }) {
  const { t: translate } = useT();
  const isLive = session.status === "live";
  const isScheduled = session.status === "scheduled";

  return (
    <Link href={`/live-sessions/${session._id}`} className="block h-full group">
      <div className="h-full flex flex-col border border-border bg-card transition-colors hover:border-foreground/50 relative overflow-hidden">
        {isLive && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 animate-pulse" />
        )}

        <div className="relative aspect-video bg-muted border-b border-border flex items-center justify-center overflow-hidden">
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

          <div className="absolute top-3 right-3 z-10">
            {isLive ? (
              <Badge className="bg-red-600 text-white font-bold rounded-none border-0 uppercase text-[10px] tracking-wider animate-pulse">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white inline-block animate-pulse" />
                <T>Live Now</T>
              </Badge>
            ) : isScheduled ? (
              <Badge variant="outline" className="bg-background text-foreground font-medium rounded-none border-foreground/10 text-xs tracking-wide">
                <T>Upcoming</T>
              </Badge>
            ) : null}
          </div>

          {isLive && session.attendeeCount > 0 && (
            <div className="absolute bottom-3 left-3 z-10">
              <Badge variant="secondary" className="bg-black/60 text-white rounded-none border-0 text-xs">
                <Users className="h-3 w-3 mr-1" />
                {session.attendeeCount} <T>watching</T>
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(parseISO(session.scheduledAt), "MMM d, yyyy")}</span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              {isLive ? <T>Live Stream</T> : <T>Live Session</T>}
            </span>
          </div>

          <h3 className="text-xl font-heading font-bold text-foreground mb-3 leading-tight group-hover:underline decoration-1 underline-offset-4">
            {translate(session.title)}
          </h3>

          {session.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {translate(session.description)}
            </p>
          )}

          <div className="mt-auto pt-4">
            {isLive ? (
              <Button className="w-full rounded-none h-9 text-xs uppercase tracking-wide bg-red-600 hover:bg-red-700 text-white">
                <Radio className="h-3 w-3 mr-2 animate-pulse" />
                <T>Join Live</T>
              </Button>
            ) : isScheduled ? (
              <div className="flex items-center text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                <Clock className="h-4 w-4 mr-2" />
                <span>{format(parseISO(session.scheduledAt), "h:mm a")}</span>
                <ArrowRight className="ml-auto h-4 w-4" />
              </div>
            ) : (
              <div className="flex items-center text-sm font-medium text-muted-foreground">
                <T>View Recording</T>
                <ArrowRight className="ml-auto h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LiveSessionCardSkeleton() {
  return (
    <div className="border border-border h-full bg-card">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-4 w-24 rounded-none" />
        <Skeleton className="h-6 w-full rounded-none" />
        <Skeleton className="h-4 w-3/4 rounded-none" />
        <div className="pt-4 mt-auto">
          <Skeleton className="h-9 w-full rounded-none" />
        </div>
      </div>
    </div>
  );
}
