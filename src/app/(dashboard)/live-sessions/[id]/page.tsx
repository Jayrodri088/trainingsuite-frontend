"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import {
  Video,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Share2,
  Bell,
  CheckCircle,
  Radio,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageLoader } from "@/components/ui/page-loader";
import { SetReminderDialog } from "@/components/live-sessions/set-reminder-dialog";
import { LiveSessionChat } from "@/components/live-sessions/live-session-chat";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks";
import { liveSessionsApi } from "@/lib/api/live-sessions";
import { getInitials } from "@/lib/utils";
import { LivestreamPlayer, detectStreamType } from "@/components/livestream";
import type { LiveSession, ApiError } from "@/types";
import { format, parseISO, differenceInSeconds, isPast, addMinutes } from "date-fns";
import { T, useT } from "@/components/t";

function formatTimeLeftToFinish(totalSeconds: number): string {
  if (totalSeconds <= 0) return "";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

export default function LiveSessionDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const { t } = useT();
  const sessionId = params.id as string;
  const auth = useAuth();
  const [countdown, setCountdown] = useState<string | null>(null);
  /** Bumps once per second so scheduled end and time-left labels stay accurate */
  const [timeSync, setTimeSync] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const hasRefetchedAfterStartTime = useRef(false);
  const hasRefetchedAfterScheduledEnd = useRef(false);

  const { data: sessionData, isLoading, refetch } = useQuery({
    queryKey: ["live-session", sessionId],
    queryFn: () => liveSessionsApi.getById(sessionId),
    // Polling is handled in useEffect so we can speed up after scheduled end time
    refetchInterval: false,
  });

  const joinMutation = useMutation({
    mutationFn: () => liveSessionsApi.join(sessionId),
    onSuccess: () => {
      setHasJoined(true);
      toast({ title: t("You've joined the session!") });
    },
    onError: (error: ApiError) => {
      // If session is not live yet, just mark as notified locally
      if (error?.response?.status === 400) {
        setHasJoined(true);
        toast({ title: t("You'll be notified when the session starts!") });
      } else {
        toast({ title: t("Failed to join session"), variant: "destructive" });
      }
    },
  });

  const session = sessionData?.data;
  const scheduledEndAt = session
    ? addMinutes(parseISO(session.scheduledAt), session.duration)
    : null;
  const secondsToScheduledEnd =
    session && scheduledEndAt
      ? differenceInSeconds(scheduledEndAt, new Date())
      : 0;
  const pastScheduledEnd = session && scheduledEndAt ? secondsToScheduledEnd <= 0 : false;

  useEffect(() => {
    hasRefetchedAfterStartTime.current = false;
  }, [sessionId, session?.scheduledAt]);

  // Auto-join when session is live (silent join without toast)
  useEffect(() => {
    if (!session) return;
    if (session.status === "live" && !hasJoined) {
      // Use mutate with callbacks to handle silently
      liveSessionsApi.join(sessionId)
        .then(() => {
          setHasJoined(true);
          // Refetch to get updated attendee count
          refetch();
        })
        .catch(() => {
          // Silently mark as joined even on error (user is still watching)
          setHasJoined(true);
        });
    }
  }, [session?.status, sessionId, hasJoined, refetch]);

  // Countdown timer for scheduled sessions
  useEffect(() => {
    if (!session) return;
    
    // If session is already live or ended, no need for countdown
    if (session.status === "live" || session.status === "ended") {
      setCountdown(null);
      setShouldRefresh(false);
      return;
    }
    
    if (session.status !== "scheduled") return;

    const scheduledAt = parseISO(session.scheduledAt);

    const updateCountdown = () => {
      const now = new Date();
      const diffSeconds = differenceInSeconds(scheduledAt, now);

      // If time has passed, trigger refetch to get updated status
      if (diffSeconds <= 0) {
        setCountdown(null);
        setShouldRefresh(true);
        // Trigger a single immediate refetch when the scheduled time is reached.
        if (!hasRefetchedAfterStartTime.current) {
          hasRefetchedAfterStartTime.current = true;
          refetch();
        }
        return;
      }

      // Enable auto-refresh when within 2 minutes of start time
      if (diffSeconds <= 120) {
        setShouldRefresh(true);
      }

      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setCountdown(`${days}d ${hours % 24}h ${minutes}m`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${minutes}m ${seconds}s`);
      }
    };

    const initialTick = window.setTimeout(updateCountdown, 0);
    const interval = window.setInterval(updateCountdown, 1000);
    return () => {
      window.clearTimeout(initialTick);
      window.clearInterval(interval);
    };
  }, [session, refetch]);

  useEffect(() => {
    hasRefetchedAfterScheduledEnd.current = false;
  }, [sessionId, session?.scheduledAt, session?.duration]);

  // One immediate refetch when the scheduled end (start + duration) is reached — server may still say "live"
  useEffect(() => {
    if (!session) return;
    if (session.status === "ended" || session.status === "cancelled") return;
    const endAt = addMinutes(parseISO(session.scheduledAt), session.duration);
    const past = differenceInSeconds(endAt, new Date()) <= 0;
    if (past && !hasRefetchedAfterScheduledEnd.current) {
      hasRefetchedAfterScheduledEnd.current = true;
      refetch();
    }
  }, [session, timeSync, refetch]);

  // Poll session while live / near start / past scheduled end until status catches up
  useEffect(() => {
    if (!session) return;
    if (session.status === "ended" || session.status === "cancelled") return;

    let intervalMs: number | false = false;
    if (session.status === "live" && pastScheduledEnd) intervalMs = 5000;
    else if (session.status === "live") intervalMs = 10000;
    else if (shouldRefresh) intervalMs = 10000;
    else if (pastScheduledEnd) intervalMs = 5000;

    if (!intervalMs) return;

    const id = window.setInterval(() => refetch(), intervalMs);
    return () => window.clearInterval(id);
  }, [session, pastScheduledEnd, shouldRefresh, refetch]);

  // Re-render once per second while the session might still be active (for time-left and scheduled-end)
  useEffect(() => {
    if (!session) return;
    if (session.status === "ended" || session.status === "cancelled") return;
    const id = window.setInterval(() => setTimeSync((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [session]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium"><T>Session not found</T></h2>
        <p className="text-muted-foreground mt-1">
          <T>This session may have been removed or doesn&apos;t exist.</T>
        </p>
        <Button asChild className="mt-4">
          <Link href="/live-sessions"><T>Back to Sessions</T></Link>
        </Button>
      </div>
    );
  }

  const getStatusDisplay = () => {
    if (session.status === "live") {
      return (
        <Badge className="bg-red-600 animate-pulse text-base px-4 py-1">
          <span className="mr-2 h-2 w-2 rounded-full bg-white inline-block animate-pulse" />
          <T>Live Now</T>
        </Badge>
      );
    }
    if (session.status === "scheduled") {
      return (
        <Badge className="bg-blue-600 text-base px-4 py-1">
          <T>Scheduled</T>
        </Badge>
      );
    }
    if (session.status === "ended") {
      return (
        <Badge variant="secondary" className="text-base px-4 py-1">
          {session.recordingUrl ? <T>Recording Available</T> : <T>Ended</T>}
        </Badge>
      );
    }
    return null;
  };

  const renderVideoPlayer = () => {
    const scheduledAt = parseISO(session.scheduledAt);
    const isScheduledTimePassed = isPast(scheduledAt);
    
    // Determine if we should show the player
    // Show player if: session is live, OR (session is scheduled but time has passed and has stream URL)
    const shouldShowPlayer = 
      session.status === "live" || 
      (session.status === "ended" && session.recordingUrl) ||
      (session.status === "scheduled" && isScheduledTimePassed && session.streamUrl);

    if (shouldShowPlayer) {
      const videoUrl = session.status === "ended" ? session.recordingUrl : session.streamUrl;

      if (!videoUrl) {
        return (
          <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p><T>Stream URL not available</T></p>
            </div>
          </div>
        );
      }

      const streamType = detectStreamType(videoUrl);
      const isLive = session.status === "live" || (session.status === "scheduled" && isScheduledTimePassed);

      // Scheduled window is over but API may still say live — stop the player and prompt refresh
      if (pastScheduledEnd && session.status !== "ended") {
        return (
          <div className="aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center px-6 text-center text-white">
            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium"><T>Scheduled session time has ended</T></p>
            <p className="mt-2 max-w-md text-sm text-white/75">
              <T>
                Playback has stopped at the scheduled end time. Refresh to check if the session status has updated.
              </T>
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-6"
              onClick={() => refetch()}
            >
              <T>Refresh status</T>
            </Button>
          </div>
        );
      }

      return (
        <div className="relative">
          <LivestreamPlayer
            url={videoUrl}
            title={session.title}
            isLive={isLive}
            autoplay={isLive}
            controls={true}
            onReady={() => {
              // If we're playing and status is still scheduled, it means auto-start worked
              if (session.status === "scheduled" && isScheduledTimePassed) {
                toast({ title: t("Stream is now live!") });
              }
            }}
            onError={(err) => {
              console.error("Stream playback error:", err);
              toast({
                title: t("Playback Error"),
                description: t("Failed to play the stream. Try refreshing the page."),
                variant: "destructive",
              });
            }}
          />
          {/* Stream type indicator */}
          <div className="absolute bottom-4 right-4 z-20">
            <Badge variant="secondary" className="text-xs bg-black/50 text-white">
              <Radio className="h-3 w-3 mr-1" />
              {streamType.toUpperCase()}
            </Badge>
          </div>
        </div>
      );
    }

    // For scheduled sessions that haven't started yet - show countdown
    if (session.status === "scheduled" && !isScheduledTimePassed) {
      return (
        <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2"><T>Session Starting Soon</T></h3>
            {countdown && (
              <div className="text-4xl font-bold text-primary mb-4">{countdown}</div>
            )}
            <p className="text-white/70 mb-4">
              {format(scheduledAt, "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </p>
            {!hasJoined && (
              <Button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
              >
                <Bell className="h-4 w-4 mr-2" />
                {joinMutation.isPending ? <T>Joining...</T> : <T>Get Notified</T>}
              </Button>
            )}
            {hasJoined && (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span><T>You&apos;ll be notified when the session starts</T></span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Ended without recording or scheduled without stream URL
    return (
      <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">
            {session.status === "ended" ? <T>Session Ended</T> : <T>Stream Not Available</T>}
          </h3>
          <p className="text-white/70">
            {session.status === "ended" 
              ? <T>No recording is available for this session.</T>
              : <T>The stream URL has not been configured yet.</T>}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/live-sessions">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{session.title}</h1>
            {getStatusDisplay()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.status === "scheduled" && auth?.user && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-gray-200 hover:bg-[#0052CC]/10 hover:text-[#0052CC] font-sans font-medium"
              onClick={() => setShowReminderDialog(true)}
            >
              <Bell className="h-4 w-4 mr-2" />
              <T>Remind me</T>
            </Button>
          )}
          <Button variant="outline" size="icon" className="rounded-lg">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showReminderDialog && (
        <SetReminderDialog
          sessionId={sessionId}
          sessionTitle={session.title}
          open={showReminderDialog}
          onOpenChange={setShowReminderDialog}
        />
      )}

      {/* Video Player */}
      {renderVideoPlayer()}

      {/* Session Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle><T>About this session</T></CardTitle>
            </CardHeader>
            <CardContent>
              {session.description ? (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {t(session.description)}
                </p>
              ) : (
                <p className="text-muted-foreground italic"><T>No description provided.</T></p>
              )}

              {session.course && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-medium mb-2"><T>Related Course</T></h4>
                    <Link
                      href={`/courses/${session.course.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-12 w-16 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {session.course.thumbnail ? (
                          <img
                            src={session.course.thumbnail}
                            alt={session.course.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Video className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{t(session.course.title)}</p>
                        <p className="text-sm text-muted-foreground"><T>View course</T></p>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <LiveSessionChat session={session} currentUser={auth.user} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle><T>Session Details</T></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {format(parseISO(session.scheduledAt), "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(session.scheduledAt), "h:mm a")}
                  </p>
                </div>
              </div>
              {session.duration && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{session.duration} <T>minutes</T></p>
                    <p className="text-sm text-muted-foreground"><T>Duration</T></p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {session.status === "ended" ? (
                      <T>Ended</T>
                    ) : session.status === "cancelled" ? (
                      <T>Cancelled</T>
                    ) : pastScheduledEnd ? (
                      <T>Scheduled time ended</T>
                    ) : (
                      formatTimeLeftToFinish(secondsToScheduledEnd) || "—"
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <T>Time left to finish</T>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {session.attendeeCount || 0}
                    {session.maxAttendees ? ` / ${session.maxAttendees}` : ` (${t("Unlimited")})`}
                  </p>
                  <p className="text-sm text-muted-foreground"><T>Attendees</T></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructor */}
          <Card>
            <CardHeader>
              <CardTitle><T>Instructor</T></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={session.instructor?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(session.instructor?.name || "?")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{session.instructor?.name || t("Instructor")}</p>
                  {session.instructor?.title && (
                    <p className="text-sm text-muted-foreground">{session.instructor.title}</p>
                  )}
                </div>
              </div>
              {session.instructor?.bio && (
                <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                  {t(session.instructor.bio)}
                </p>
              )}
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}
