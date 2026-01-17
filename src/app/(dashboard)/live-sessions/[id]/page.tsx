"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Play,
  ArrowLeft,
  ExternalLink,
  Share2,
  Bell,
  CheckCircle,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { liveSessionsApi } from "@/lib/api/live-sessions";
import { getInitials } from "@/lib/utils";
import type { LiveSession } from "@/types";
import { format, parseISO, differenceInMinutes, differenceInSeconds } from "date-fns";

export default function LiveSessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const sessionId = params.id as string;
  const [countdown, setCountdown] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  const { data: sessionData, isLoading } = useQuery({
    queryKey: ["live-session", sessionId],
    queryFn: () => liveSessionsApi.getById(sessionId),
  });

  const joinMutation = useMutation({
    mutationFn: () => liveSessionsApi.join(sessionId),
    onSuccess: () => {
      setHasJoined(true);
      toast({ title: "You've joined the session!" });
    },
    onError: () => {
      toast({ title: "Failed to join session", variant: "destructive" });
    },
  });

  const session = sessionData?.data;

  // Countdown timer for scheduled sessions
  useEffect(() => {
    if (!session || session.status !== "scheduled") return;

    const scheduledAt = parseISO(session.scheduledAt);

    const updateCountdown = () => {
      const now = new Date();
      const diffSeconds = differenceInSeconds(scheduledAt, now);

      if (diffSeconds <= 0) {
        setCountdown(null);
        return;
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

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="aspect-video w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium">Session not found</h2>
        <p className="text-muted-foreground mt-1">
          This session may have been removed or doesn't exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/live-sessions">Back to Sessions</Link>
        </Button>
      </div>
    );
  }

  const getStatusDisplay = () => {
    if (session.status === "live") {
      return (
        <Badge className="bg-red-600 animate-pulse text-base px-4 py-1">
          <span className="mr-2 h-2 w-2 rounded-full bg-white inline-block animate-pulse" />
          Live Now
        </Badge>
      );
    }
    if (session.status === "scheduled") {
      return (
        <Badge className="bg-blue-600 text-base px-4 py-1">
          Scheduled
        </Badge>
      );
    }
    if (session.status === "ended") {
      return (
        <Badge variant="secondary" className="text-base px-4 py-1">
          {session.recordingUrl ? "Recording Available" : "Ended"}
        </Badge>
      );
    }
    return null;
  };

  const renderVideoPlayer = () => {
    // For live sessions or recordings
    if (session.status === "live" || (session.status === "ended" && session.recordingUrl)) {
      const videoUrl = session.status === "live" ? session.streamUrl : session.recordingUrl;

      if (!videoUrl) {
        return (
          <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Stream URL not available</p>
            </div>
          </div>
        );
      }

      // YouTube embed
      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        const videoId = videoUrl.includes("youtu.be")
          ? videoUrl.split("/").pop()
          : new URLSearchParams(new URL(videoUrl).search).get("v");

        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }

      // Vimeo embed
      if (videoUrl.includes("vimeo.com")) {
        const videoId = videoUrl.split("/").pop();
        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }

      // Generic video or external link
      return (
        <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Video className="h-16 w-16 mx-auto mb-4 text-white/50" />
            <Button asChild>
              <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Stream in New Tab
              </a>
            </Button>
          </div>
        </div>
      );
    }

    // For scheduled sessions - show countdown
    if (session.status === "scheduled") {
      return (
        <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">Session Starting Soon</h3>
            {countdown && (
              <div className="text-4xl font-bold text-primary mb-4">{countdown}</div>
            )}
            <p className="text-white/70 mb-4">
              {format(parseISO(session.scheduledAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </p>
            {!hasJoined && (
              <Button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
              >
                <Bell className="h-4 w-4 mr-2" />
                {joinMutation.isPending ? "Joining..." : "Get Notified"}
              </Button>
            )}
            {hasJoined && (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span>You'll be notified when the session starts</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Ended without recording
    return (
      <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">Session Ended</h3>
          <p className="text-white/70">No recording is available for this session.</p>
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
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Video Player */}
      {renderVideoPlayer()}

      {/* Session Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About this session</CardTitle>
            </CardHeader>
            <CardContent>
              {session.description ? (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {session.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">No description provided.</p>
              )}

              {session.course && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-medium mb-2">Related Course</h4>
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
                        <p className="font-medium">{session.course.title}</p>
                        <p className="text-sm text-muted-foreground">View course</p>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
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
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{session.duration} minutes</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {session.attendeeCount || 0}
                    {session.maxAttendees && ` / ${session.maxAttendees}`}
                  </p>
                  <p className="text-sm text-muted-foreground">Attendees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructor */}
          <Card>
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
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
                  <p className="font-medium">{session.instructor?.name || "Instructor"}</p>
                  {session.instructor?.title && (
                    <p className="text-sm text-muted-foreground">{session.instructor.title}</p>
                  )}
                </div>
              </div>
              {session.instructor?.bio && (
                <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                  {session.instructor.bio}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Join/Watch Button */}
          {session.status === "live" && session.streamUrl && (
            <Button className="w-full bg-red-600 hover:bg-red-700" size="lg" asChild>
              <a href={session.streamUrl} target="_blank" rel="noopener noreferrer">
                <Play className="h-5 w-5 mr-2" />
                Join Live Stream
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
