"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderTree,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Shield,
  MessageSquare,
  Megaphone,
  LogOut,
  PlusCircle,
  Video,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useNotifications, useMarkAsRead } from "@/hooks";
import { getInitials, cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const adminNavSections = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "Courses",
        href: "/admin/courses",
        icon: BookOpen,
      },
      {
        label: "Create Course",
        href: "/admin/courses/new",
        icon: PlusCircle,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
      },
      {
        label: "Live Sessions",
        href: "/admin/live-sessions",
        icon: Video,
      },
      {
        label: "Discussions",
        href: "/admin/discussions",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Users",
    items: [
      {
        label: "All Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        label: "Students",
        href: "/admin/students",
        icon: GraduationCap,
      },
    ],
  },
  {
    title: "Platform",
    items: [
      {
        label: "Announcements",
        href: "/admin/announcements",
        icon: Megaphone,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: notificationsResponse } = useNotifications();
  const markAsRead = useMarkAsRead();
  const [collapsed, setCollapsed] = useState(false);

  const notifications = notificationsResponse?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-[#FAFAFA] text-gray-900 transition-all duration-300 border-r border-gray-200",
          collapsed ? "w-[70px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 sm:px-5 border-b border-gray-200">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-[10px] bg-[#0052CC] flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-sans font-bold tracking-tight text-sm text-black">Admin Panel</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 hover:text-black hover:bg-gray-200 rounded-[10px] h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-8">
            {adminNavSections.map((section) => (
              <div key={section.title}>
                {!collapsed && (
                  <h3 className="px-2 mb-4 text-xs font-sans font-semibold text-gray-500">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href ||
                      (item.href !== "/admin" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm font-sans font-medium transition-colors border-l-2 border-transparent rounded-[8px] hover:bg-gray-200/60",
                          isActive
                            ? "border-[#0052CC] text-[#0052CC] bg-[#0052CC]/10 font-semibold"
                            : "text-gray-600 hover:text-gray-900",
                          collapsed && "justify-center px-2 border-l-0"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-[#0052CC]")} />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-[#FAFAFA]">
          {collapsed ? (
            <div className="flex justify-center">
              <Avatar className="h-9 w-9 border border-gray-200">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gray-200 text-gray-700 font-sans text-xs font-medium">
                  {getInitials(user?.name || "AD")}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-9 w-9 border border-gray-200">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gray-200 text-gray-700 font-sans text-xs font-medium">
                  {getInitials(user?.name || "AD")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-sans font-semibold truncate text-black">{user?.name}</p>
                <p className="text-xs font-sans text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn("transition-all duration-300 min-h-screen flex flex-col", collapsed ? "ml-[70px]" : "ml-[260px]")}>
        {/* Header */}
        <header className="h-14 sm:h-16 bg-[#FAFAFA] border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-sans font-bold text-black">
              {adminNavSections
                .flatMap((section) => section.items)
                .find((item) =>
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href))
                )?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-[10px] text-gray-600 hover:text-gray-900 hover:bg-gray-200">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-[#FAFAFA]" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-[12px] border-gray-200 shadow-lg">
                <DropdownMenuLabel className="flex items-center justify-between p-4 pb-2 font-sans">
                  <span className="font-bold text-black">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs text-gray-500">{unreadCount} unread</span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem
                        key={notification._id}
                        className="flex flex-col items-start gap-1 p-3 cursor-pointer rounded-lg focus:bg-gray-100 font-sans"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <p className="text-sm font-medium flex-1 line-clamp-1">{notification.title}</p>
                          {!notification.isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#0052CC] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm font-sans text-gray-500">
                      No new notifications
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 h-9 rounded-[10px] hover:bg-gray-200">
                  <Avatar className="h-7 w-7 border border-gray-200">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gray-200 text-gray-700 font-sans text-xs font-medium">
                      {getInitials(user?.name || "AD")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block text-sm font-sans font-medium text-gray-900">
                    Admin
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-[12px] border-gray-200 shadow-lg font-sans">
                <DropdownMenuLabel className="p-4 pb-2">
                  <div className="flex flex-col space-y-1">
                    <span className="font-semibold text-black leading-none">{user?.name}</span>
                    <span className="text-xs text-gray-500 font-normal leading-none">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-gray-100">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    User Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-gray-100">
                  <Link href="/admin/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:text-destructive rounded-lg cursor-pointer focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
