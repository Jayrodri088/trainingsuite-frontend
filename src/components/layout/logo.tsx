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
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo.webp"
        alt="Rhapsody Global Missionaries"
        width={40}
        height={40}
        className="h-10 w-auto"
      />
      {!iconOnly && (
        <span
          className={cn(
            "text-lg font-heading font-bold leading-tight tracking-tight",
            variant === "light" ? "text-white" : "text-foreground"
          )}
        >
          Rhapsody Global<br />
          <span className="text-sm font-medium text-muted-foreground">Missionaries Portal</span>
        </span>
      )}
    </Link>
  );
}
