"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Play,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { liveSessionsApi } from "@/lib/api/live-sessions";
import { getInitials } from "@/lib/utils";
import type { LiveSession, LiveSessionStatus } from "@/types";
import { format, parseISO, isAfter, isBefore, differenceInMinutes } from "date-fns";

export default function LiveSessionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ["live-sessions"],
    queryFn: () => liveSessionsApi.getAll(1, 100),
  });

  const sessions = sessionsData?.data || [];
  const now = new Date();

  // Filter sessions by tab
  const upcomingSessions = sessions.filter(
    (s) => s.status === "scheduled" || s.status === "live"
  );
  const pastSessions = sessions.filter(
    (s) => s.status === "ended"
  );

  const filteredSessions = (activeTab === "upcoming" ? upcomingSessions : pastSessions)
    .filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const getStatusBadge = (session: LiveSession) => {
    if (session.status === "live") {
      return (
        <Badge className="bg-red-600 animate-pulse">
          <span className="mr-1 h-2 w-2 rounded-full bg-white inline-block" />
          Live Now
        </Badge>
      );
    }
    if (session.status === "scheduled") {
      const scheduledAt = parseISO(session.scheduledAt);
      const minutesUntil = differenceInMinutes(scheduledAt, now);
      if (minutesUntil <= 30 && minutesUntil > 0) {
        return <Badge className="bg-yellow-500">Starting Soon</Badge>;
      }
      return <Badge className="bg-blue-600">Scheduled</Badge>;
    }
    if (session.status === "ended" && session.recordingUrl) {
      return <Badge variant="secondary">Recording Available</Badge>;
    }
    return <Badge variant="secondary">Ended</Badge>;
  };

  const getTimeDisplay = (session: LiveSession) => {
    const scheduledAt = parseISO(session.scheduledAt);
    if (session.status === "live") {
      return "Happening now";
    }
    if (session.status === "scheduled") {
      const minutesUntil = differenceInMinutes(scheduledAt, now);
      if (minutesUntil <= 60 && minutesUntil > 0) {
        return `Starts in ${minutesUntil} minutes`;
      }
      return format(scheduledAt, "MMM d, yyyy 'at' h:mm a");
    }
    return format(scheduledAt, "MMM d, yyyy");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Live Sessions</h1>
        <p className="text-muted-foreground">
          Join live sessions or watch recordings from your instructors.
        </p>
      </div>

      {/* Live Now Banner */}
      {sessions.some((s) => s.status === "live") && (
        <Card className="bg-gradient-to-r from-red-600 to-red-500 text-white border-0">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Video className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Sessions are live now!</h3>
                  <p className="text-red-100">
                    {sessions.filter((s) => s.status === "live").length} session(s) currently streaming
                  </p>
                </div>
              </div>
              <Button variant="secondary" asChild>
                <Link href="#live-sessions">
                  <Play className="h-4 w-4 mr-2" />
                  Join Now
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Sessions ({pastSessions.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Sessions Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No sessions found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery
                ? "Try adjusting your search"
                : activeTab === "upcoming"
                ? "No upcoming sessions scheduled"
                : "No past sessions available"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div id="live-sessions" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map((session) => (
            <Card key={session._id} className="flex flex-col overflow-hidden">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted">
                {session.thumbnail ? (
                  <img
                    src={session.thumbnail}
                    alt={session.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Video className="h-12 w-12 text-primary/50" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  {getStatusBadge(session)}
                </div>
                {session.status === "live" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Button size="lg" className="bg-red-600 hover:bg-red-700" asChild>
                      <Link href={`/live-sessions/${session._id}`}>
                        <Play className="h-5 w-5 mr-2" />
                        Join Now
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{session.title}</CardTitle>
                {session.description && (
                  <CardDescription className="line-clamp-2">
                    {session.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="flex-1">
                {/* Instructor */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.instructor?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(session.instructor?.name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{session.instructor?.name || "Instructor"}</p>
                    {session.course && (
                      <p className="text-muted-foreground text-xs">{session.course.title}</p>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{getTimeDisplay(session)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{session.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {session.attendeeCount || 0}
                      {session.maxAttendees && ` / ${session.maxAttendees}`} attendees
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                {session.status === "live" ? (
                  <Button className="w-full bg-red-600 hover:bg-red-700" asChild>
                    <Link href={`/live-sessions/${session._id}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Join Live
                    </Link>
                  </Button>
                ) : session.status === "scheduled" ? (
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/live-sessions/${session._id}`}>
                      View Details
                    </Link>
                  </Button>
                ) : session.recordingUrl ? (
                  <Button className="w-full" asChild>
                    <Link href={`/live-sessions/${session._id}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Watch Recording
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    No Recording Available
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
