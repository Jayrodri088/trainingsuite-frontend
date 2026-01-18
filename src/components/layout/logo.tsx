import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: "default" | "light";
}

export function Logo({ className, iconOnly = false, variant = "default" }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo.webp"
        alt="Rhapsody Global Missionaries"
        width={36}
        height={36}
        className="h-9 w-auto shrink-0"
      />
      {!iconOnly && (
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "text-base font-heading font-bold leading-tight tracking-tight",
              variant === "light" ? "text-white" : "text-foreground"
            )}
          >
            Rhapsody Global
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Missionaries Portal
          </span>
        </div>
      )}
    </Link>
  );
}
