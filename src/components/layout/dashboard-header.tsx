"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  BookOpen,
  Award,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications, useMarkAsRead } from "@/hooks";
import { getInitials } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { LanguageSelector } from "@/components/language-selector";
import { T, useT } from "@/components/t";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();
  const { user, logout, isLoggingOut } = useAuth();
  const { data: notificationsResponse } = useNotifications();
  const markAsRead = useMarkAsRead();
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useT();

  const notifications = notificationsResponse?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-4 border-b border-gray-200 bg-[#FAFAFA] px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9 rounded-[10px] text-gray-700 hover:text-gray-900 hover:bg-gray-200 border-0 focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-0"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("Search training...")}
            className="w-full pl-9 h-9 rounded-[10px] bg-white border border-gray-200 text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-[10px] text-gray-600 hover:text-gray-900 hover:bg-gray-200 border-0 focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-0"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-[9999px] bg-red-500 ring-2 ring-[#FAFAFA]" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 rounded-[12px] border border-gray-200 bg-white text-gray-900 shadow-lg p-0"
          >
            <DropdownMenuLabel className="flex items-center justify-between p-4 pb-2 font-sans border-b border-gray-100">
              <span className="font-bold text-gray-900"><T>Notifications</T></span>
              {unreadCount > 0 && (
                <span className="text-xs text-gray-500">{unreadCount} <T>unread</T></span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-100" />
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem
                key={notification._id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer rounded-[8px] hover:bg-gray-50 focus:bg-gray-50 font-sans text-gray-900"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <p className="text-sm font-medium flex-1 line-clamp-1"><T>{notification.title}</T></p>
                      {!notification.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0052CC] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      <T>{notification.message}</T>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-gray-500 font-sans">
                  <T>No new notifications</T>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 pl-2 pr-1 h-10 rounded-[10px] hover:bg-gray-200 hover:text-gray-900 text-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-0"
              >
                <Avatar className="h-8 w-8 border border-gray-200 rounded-[9999px]">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gray-200 text-gray-900 text-xs font-sans font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start gap-0.5 text-sm font-sans">
                  <span className="font-semibold text-gray-900 leading-none">{user.name.split(" ")[0]}</span>
                </div>
                <ChevronDown className="h-3 w-3 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-[12px] border border-gray-200 bg-white text-gray-900 shadow-lg font-sans p-0"
            >
              <DropdownMenuLabel className="font-normal p-4 pb-2 border-b border-gray-100">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
                  <p className="text-xs text-gray-500 leading-none truncate">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem asChild className="rounded-[8px] cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-900">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  <T>Home</T>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-[8px] cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-900">
                <Link href="/dashboard">
                  <User className="mr-2 h-4 w-4" />
                  <T>Dashboard</T>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-[8px] cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-900">
                <Link href="/my-courses">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <T>My Courses</T>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-[8px] cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-900">
                <Link href="/certificates">
                  <Award className="mr-2 h-4 w-4" />
                  <T>Certificates</T>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-[8px] cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-900">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <T>Settings</T>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                onClick={logout}
                disabled={isLoggingOut}
                variant="destructive"
                className="rounded-[8px] cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? <T>Signing out...</T> : <T>Sign out</T>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
