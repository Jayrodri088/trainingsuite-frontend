"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  BookOpen,
  Award,
  MessageSquare,
  Calendar,
  Info,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/types";
import { T, useT } from "@/components/t";

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  course: BookOpen,
  certificate: Award,
  message: MessageSquare,
  session: Calendar,
  info: Info,
  warning: AlertCircle,
};

const notificationColors: Record<string, { bg: string; text: string; border: string }> = {
  course: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  certificate: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  message: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  session: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  info: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
  warning: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
};

function NotificationSkeleton() {
  return (
    <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex gap-5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-[10px]" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-48 rounded-[8px]" />
            <Skeleton className="h-4 w-full rounded-[8px]" />
            <Skeleton className="h-3 w-32 rounded-[8px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onNavigate,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onNavigate: (notification: Notification) => void;
}) {
  const { t } = useT();
  const type = notification.type || "info";
  const Icon = notificationIcons[type] || Info;
  const colors = notificationColors[type] || notificationColors.info;

  const handleClick = () => {
    onNavigate(notification);
  };

  return (
    <Card
      className={`rounded-[12px] border-gray-200 transition-all cursor-pointer hover:border-gray-300 group shadow-sm ${!notification.isRead ? "bg-[#0052CC]/5 border-l-4 border-l-[#0052CC]" : "bg-white"}`}
      onClick={handleClick}
    >
      <CardContent className="p-5">
        <div className="flex gap-5">
          <div className={`h-10 w-10 shrink-0 rounded-[10px] border ${colors.border} ${colors.bg} flex items-center justify-center`}>
            <Icon className={`h-4 w-4 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-sans font-bold text-sm ${!notification.isRead ? "text-[#0052CC]" : "text-black"}`}>
                    <T>{notification.title}</T>
                  </h4>
                  {!notification.isRead && (
                    <Badge className="rounded-[8px] h-4 px-1 text-[10px] font-semibold bg-[#0052CC] border-0"><T>New</T></Badge>
                  )}
                </div>
                <p className="text-sm font-sans text-gray-600 line-clamp-2">
                  <T>{notification.message}</T>
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <p className="text-xs font-sans text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                  {notification.link && (
                    <span className="text-xs font-semibold text-[#0052CC] flex items-center gap-1 group-hover:underline">
                      <ExternalLink className="h-3 w-3" />
                      <T>View Details</T>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification._id);
                    }}
                    className="shrink-0 h-8 w-8 rounded-[10px] hover:bg-gray-100 border border-transparent hover:border-gray-200"
                    title={t("Mark as read")}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { data: notificationsResponse, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = notificationsResponse?.data || [];
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleNavigate = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-black tracking-tight"><T>Notifications</T></h1>
          <p className="font-sans text-gray-600 mt-1">
            <T>Stay updated with your learning journey</T>
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
            className="rounded-[10px] border-gray-200 hover:bg-gray-50 hover:text-[#0052CC] text-sm font-semibold w-full sm:w-auto"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-2" />
            <T>Mark all as read</T>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-[12px] border border-[#0052CC]/20 bg-[#0052CC]/10 flex items-center justify-center text-[#0052CC]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-sans font-bold text-black">{notifications.length}</p>
              <p className="text-sm font-sans text-gray-600 mt-1"><T>Total</T></p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-[12px] border border-blue-200 bg-blue-50 flex items-center justify-center text-blue-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-sans font-bold text-black">{unreadNotifications.length}</p>
              <p className="text-sm font-sans text-gray-600 mt-1"><T>Unread</T></p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-[12px] border border-green-200 bg-green-50 flex items-center justify-center text-green-600">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-sans font-bold text-black">{readNotifications.length}</p>
              <p className="text-sm font-sans text-gray-600 mt-1"><T>Read</T></p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-gray-100 border border-gray-200 w-full justify-start rounded-[10px] h-auto p-1 gap-1 overflow-x-auto flex-nowrap">
          <TabsTrigger
            value="all"
            className="rounded-[8px] border-0 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm px-4 py-2.5 font-sans font-semibold text-sm text-gray-600 transition-none shrink-0"
          >
            <T>All</T> <Badge className="ml-2 rounded-[6px] bg-gray-200 text-gray-700 border-0 text-[10px]">{notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="rounded-[8px] border-0 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm px-4 py-2.5 font-sans font-semibold text-sm text-gray-600 transition-none shrink-0"
          >
            <T>Unread</T> <Badge className="ml-2 rounded-[6px] bg-gray-200 text-gray-700 border-0 text-[10px]">{unreadNotifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="read"
            className="rounded-[8px] border-0 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm px-4 py-2.5 font-sans font-semibold text-sm text-gray-600 transition-none shrink-0"
          >
            <T>Read</T> <Badge className="ml-2 rounded-[6px] bg-gray-200 text-gray-700 border-0 text-[10px]">{readNotifications.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-8">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-[12px] border-gray-200 border-dashed bg-white shadow-sm">
              <CardContent className="py-20 text-center">
                <div className="h-16 w-16 mx-auto mb-6 rounded-[12px] border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500">
                  <BellOff className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-sans font-bold text-black"><T>No notifications</T></h3>
                <p className="font-sans text-gray-600 mt-2 text-sm">
                  <T>You&apos;re all caught up! Check back later for updates.</T>
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-8">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : unreadNotifications.length > 0 ? (
            <div className="space-y-4">
              {unreadNotifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-[12px] border-gray-200 border-dashed bg-white shadow-sm">
              <CardContent className="py-20 text-center">
                <div className="h-16 w-16 mx-auto mb-6 rounded-[12px] border border-gray-200 bg-green-50 flex items-center justify-center text-green-600">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-sans font-bold text-black"><T>All caught up!</T></h3>
                <p className="font-sans text-gray-600 mt-2 text-sm">
                  <T>You have no unread notifications.</T>
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="read" className="mt-8">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : readNotifications.length > 0 ? (
            <div className="space-y-4">
              {readNotifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-[12px] border-gray-200 border-dashed bg-white shadow-sm">
              <CardContent className="py-20 text-center">
                <div className="h-16 w-16 mx-auto mb-6 rounded-[12px] border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500">
                  <Bell className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-sans font-bold text-black"><T>No read notifications</T></h3>
                <p className="font-sans text-gray-600 mt-2 text-sm">
                  <T>Notifications you&apos;ve read will appear here.</T>
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
