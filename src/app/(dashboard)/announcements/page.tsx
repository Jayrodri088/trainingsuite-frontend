"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Megaphone,
  AlertCircle,
  Info,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { announcementsApi } from "@/lib/api";
import type { Announcement, AnnouncementPriority } from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";

const priorityConfig: Record<AnnouncementPriority, { icon: typeof AlertCircle; color: string; bgColor: string }> = {
  high: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  medium: {
    icon: Bell,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  low: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
};

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const config = priorityConfig[announcement.priority] || priorityConfig.low;
  const Icon = config.icon;

  return (
    <Card className="overflow-hidden">
      <div className={`h-1 ${announcement.priority === "high" ? "bg-red-500" : announcement.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"}`} />
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className={`h-12 w-12 rounded-full ${config.bgColor} flex items-center justify-center shrink-0`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-semibold text-lg">{announcement.title}</h3>
              <Badge
                variant={announcement.priority === "high" ? "destructive" : announcement.priority === "medium" ? "default" : "secondary"}
                className={announcement.priority === "medium" ? "bg-yellow-500" : ""}
              >
                {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
            <p className="text-sm text-muted-foreground mt-4">
              {formatDistanceToNow(parseISO(announcement.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnnouncementSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnnouncementsPage() {
  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => announcementsApi.getAll(1, 50),
  });

  const announcements = announcementsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground mt-1">
          Stay updated with the latest news and updates from the platform.
        </p>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <AnnouncementSkeleton key={i} />
          ))}
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <AnnouncementCard key={announcement._id} announcement={announcement} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold">No announcements</h3>
            <p className="text-muted-foreground mt-1">
              There are no announcements at this time. Check back later!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
