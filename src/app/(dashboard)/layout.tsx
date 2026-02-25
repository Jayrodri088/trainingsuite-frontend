"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated) {
      router.replace("/login?redirect=/dashboard");
      return;
    }
    const isAdmin = auth.user?.role === "admin";
    if (auth.user && !isAdmin && !auth.user.portalAccessPaidAt) {
      router.replace("/complete-access");
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, router]);

  const isAdmin = auth.user?.role === "admin";
  const hasAccess =
    auth.isAuthenticated && auth.user && (isAdmin || auth.user.portalAccessPaidAt);
  if (!auth.isLoading && (!auth.isAuthenticated || !hasAccess)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[260px] border-r border-border">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <DashboardSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          sidebarCollapsed ? "lg:pl-[70px]" : "lg:pl-[260px]"
        )}
      >
        <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
