"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  Users,
  LogOut,
  BookOpen,
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications, useMarkAsRead } from "@/hooks";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { LanguageSelector, LanguageSelectorCompact } from "@/components/language-selector";
import { T, useT } from "@/components/t";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const { data: notificationsResponse } = useNotifications();
  const markAsRead = useMarkAsRead();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useT();

  const notifications = notificationsResponse?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
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

  const navItems = [
    { label: t("Home"), href: "/", icon: null },
    { label: t("Curriculum"), href: "/courses", icon: BookOpen },
    { label: t("Mentorship"), href: "/live-sessions", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAFAFA] border-b border-gray-200 shadow-sm">
      <div className="container max-w-7xl flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 min-w-0">
        {/* Left: Logo + Nav on desktop (lg+) */}
        <div className="flex items-center gap-4 lg:gap-8 min-w-0 shrink">
          <Logo reload />
          {/* Desktop Nav – show from lg so tablet uses hamburger */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 shrink-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors pb-0.5 border-b-2 border-transparent",
                    isActive && "text-gray-900 border-[#3498DB] font-semibold"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search + Actions – show from lg */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Desktop Search – from lg; tablet uses menu */}
          <form onSubmit={handleSearch} className="hidden lg:flex relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("Search...")}
              className="w-[200px] xl:w-[260px] 2xl:w-[280px] min-w-0 pl-9 h-9 bg-white border border-gray-200 rounded-[10px] text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-primary/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Language Selector */}
          <div>
            <LanguageSelector />
          </div>

          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-[10px] text-gray-700 hover:text-gray-900 hover:bg-gray-200 border-0 focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-0"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-[9999px] bg-red-500 ring-2 ring-[#FAFAFA]" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 rounded-[12px] border border-gray-200 bg-white text-gray-900 shadow-lg p-0">
                  <DropdownMenuLabel className="flex items-center justify-between p-4 pb-2 border-b border-gray-100">
                    <span className="font-heading font-bold text-gray-900"><T>Notifications</T></span>
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
                          className="flex flex-col items-start gap-1 p-3 cursor-pointer rounded-[8px] hover:bg-gray-50 focus:bg-gray-50 text-gray-900"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <p className="text-sm font-medium flex-1 line-clamp-1 text-gray-900">{notification.title}</p>
                            {!notification.isRead && (
                              <span className="h-1.5 w-1.5 rounded-[9999px] bg-primary shrink-0" />
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
                      <div className="p-8 text-center text-sm text-gray-500">
                        <T>No new notifications</T>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-[9999px] hover:bg-gray-200 border-0 focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-0"
                  >
                    <Avatar className="h-9 w-9 border border-gray-200 rounded-[9999px]">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gray-200 text-gray-900 text-xs font-medium">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-[12px] border border-gray-200 bg-white text-gray-900 shadow-lg p-0">
                  <DropdownMenuLabel className="font-normal p-4 pb-2 border-b border-gray-100">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
                      <p className="text-xs text-gray-500 leading-none truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem asChild className="rounded-[8px] cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-900">
                    <Link href="/dashboard"><T>Dashboard</T></Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-[8px] cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-900">
                    <Link href="/settings"><T>Settings</T></Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem
                    onClick={logout}
                    disabled={isLoggingOut}
                    variant="destructive"
                    className="rounded-[8px] cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600"
                  >
                    <T>Sign out</T>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden lg:flex items-center gap-3 xl:gap-4">
              <Button asChild variant="ghost" className="rounded-[10px] h-9 px-4 xl:px-5 text-sm font-medium bg-[#F5F5F5] text-gray-700 hover:text-gray-900 hover:bg-transparent">
                <Link href="/login"><T>Sign In</T></Link>
              </Button>
              <Button asChild className="rounded-[10px] h-9 px-4 xl:px-6 text-sm font-bold bg-[#0052CC] hover:bg-[#0052CC]/90 text-white border-0">
                <Link href="/register"><T>Get Started</T></Link>
              </Button>
            </div>
          )}

          {/* Mobile + Tablet Menu (below lg) */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 -mr-2 text-gray-700 hover:bg-gray-100 shrink-0" aria-label={t("Open menu")}>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-[85vw] sm:w-[380px] md:w-[420px] lg:w-[420px] p-0 border-l border-border bg-background">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border">
                  <Logo reload />
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                  <form onSubmit={handleSearch} className="mb-8 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("Search curriculum...")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 rounded-[10px] bg-gray-100 border border-gray-200 text-gray-900 placeholder:text-gray-500 text-base"
                    />
                  </form>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4"><T>Menu</T></div>
                      <nav className="flex flex-col space-y-2">
                        {navItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-4 p-3 -mx-3 rounded-[10px] transition-colors border-l-2 border-transparent hover:bg-gray-100",
                              pathname === item.href
                                ? "border-primary font-semibold bg-muted/30"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {item.icon ? <item.icon className="h-5 w-5" /> : <span className="h-5 w-5" />}
                            <span className="text-lg">{item.label}</span>
                          </Link>
                        ))}
                      </nav>
                    </div>

                    {!isAuthenticated && (
                      <div className="space-y-3 pt-6 border-t border-border">
                        <Button asChild size="lg" className="w-full rounded-[10px] h-12 text-base uppercase tracking-wider font-bold">
                          <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                            <T>Start Training</T>
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="w-full rounded-[10px] h-12 text-base uppercase tracking-wider font-bold border border-gray-200">
                          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            <T>Sign In</T>
                          </Link>
                        </Button>
                      </div>
                    )}

                    {isAuthenticated && (
                      <div className="space-y-4 pt-6 border-t border-border">
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-4 p-3 -mx-3 rounded-[10px] hover:bg-gray-100 transition-colors"
                        >
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{user?.name}</div>
                            <div className="text-xs text-muted-foreground"><T>My Dashboard</T></div>
                          </div>
                        </Link>
                        <Button
                          variant="destructive"
                          className="w-full rounded-[10px] justify-start"
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <T>Sign Out</T>
                        </Button>
                      </div>
                    )}

                    {/* Language Selector in Mobile */}
                    <div className="pt-6 border-t border-border">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4"><T>Language</T></div>
                      <LanguageSelectorCompact />
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
