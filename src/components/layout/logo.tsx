import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: "default" | "light";
}

export function Logo({ className, iconOnly = false, variant = "default" }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          variant === "light" ? "bg-white/10" : "bg-primary"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "h-5 w-5",
            variant === "light" ? "text-white" : "text-primary-foreground"
          )}
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>
      {!iconOnly && (
        <span
          className={cn(
            "text-xl font-bold",
            variant === "light" ? "text-white" : "text-foreground"
          )}
        >
          Training Suite
        </span>
      )}
    </Link>
  );
}
