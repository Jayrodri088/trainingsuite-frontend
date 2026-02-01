"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Megaphone,
  AlertCircle,
  Info,
  Bell,
} from "lucide-react";
import { T, useT } from "@/components/t";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { announcementsApi } from "@/lib/api";
import type { Announcement, AnnouncementPriority } from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";

const priorityConfig: Record<AnnouncementPriority, { icon: typeof AlertCircle; color: string; bgColor: string; borderColor: string }> = {
  high: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  medium: {
    icon: Bell,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  low: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
};

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const { t } = useT();
  const config = priorityConfig[announcement.priority] || priorityConfig.low;
  const Icon = config.icon;
  
  // Only translate the static priority labels, not dynamic content
  const priorityLabels: Record<AnnouncementPriority, string> = {
    high: t("High"),
    medium: t("Medium"),
    low: t("Low"),
  };

  return (
    <Card className="rounded-[12px] border-gray-200 overflow-hidden bg-white shadow-sm hover:border-gray-300 transition-colors">
      <div className={`h-1 ${announcement.priority === "high" ? "bg-red-500" : announcement.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"}`} />
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className={`h-12 w-12 rounded-[12px] ${config.borderColor} ${config.bgColor} flex items-center justify-center shrink-0`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-sans font-bold text-black text-lg"><T>{announcement.title}</T></h3>
              <Badge
                variant="outline"
                className={`rounded-[8px] border px-2 py-0.5 text-xs font-semibold ${announcement.priority === "high" ? "border-red-200 text-red-700 bg-red-50" :
                    announcement.priority === "medium" ? "border-yellow-200 text-yellow-700 bg-yellow-50" :
                      "border-blue-200 text-blue-700 bg-blue-50"
                  }`}
              >
                {priorityLabels[announcement.priority]}
              </Badge>
            </div>
            <p className="font-sans text-gray-600 whitespace-pre-wrap text-sm leading-relaxed mb-4"><T>{announcement.content}</T></p>
            <div className="flex items-center gap-2">
              <div className="h-px bg-gray-200 flex-1"></div>
              <p className="text-xs font-sans text-gray-500">
                {formatDistanceToNow(parseISO(announcement.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnnouncementSkeleton() {
  return (
    <Card className="rounded-[12px] border-gray-200">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Skeleton className="h-12 w-12 rounded-[12px] shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-48 rounded-[10px]" />
              <Skeleton className="h-5 w-20 rounded-[10px]" />
            </div>
            <Skeleton className="h-4 w-full rounded-[10px]" />
            <Skeleton className="h-4 w-3/4 rounded-[10px]" />
            <div className="flex items-center gap-2 mt-4">
              <Skeleton className="h-px w-full rounded-[10px]" />
              <Skeleton className="h-3 w-24 rounded-[10px]" />
            </div>
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-sans font-bold text-black tracking-tight"><T>Announcements</T></h1>
        <p className="font-sans text-gray-600 mt-1">
          <T>Stay updated with the latest news and updates from the platform.</T>
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
        <Card className="rounded-[12px] border-gray-200 border-dashed bg-white shadow-sm">
          <CardContent className="py-20 text-center">
            <div className="h-16 w-16 mx-auto mb-6 rounded-[12px] border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500">
              <Megaphone className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-sans font-bold text-black"><T>No announcements</T></h3>
            <p className="font-sans text-gray-600 mt-2 text-sm">
              <T>There are no announcements at this time. Check back later!</T>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
