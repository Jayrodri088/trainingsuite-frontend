import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookLoader } from "./book-loader";

export function PageLoader() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 dark:bg-black/30 backdrop-blur-md"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <BookLoader />
    </div>
  );
}

export function InlineLoader({ size = "md", text }: { size?: "sm" | "md" | "lg"; text?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center gap-2">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}
