import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: "default" | "light";
  reload?: boolean;
}

export function Logo({ className, iconOnly = false, variant = "default", reload = false }: LogoProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (reload) {
      e.preventDefault();
      window.location.href = "/";
    }
  };

  return (
    <Link
      href="/"
      onClick={handleClick}
      className={cn("flex items-center gap-3", className)}
    >
      <Image
        src="/logo.webp"
        alt="Rhapsody Global Missionary Portal"
        width={36}
        height={36}
        className="h-9 w-auto shrink-0"
      />
      {!iconOnly && (
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "text-sm font-heading font-bold leading-tight tracking-tight",
              variant === "light" ? "text-white" : "text-gray-900"
            )}
          >
            Rhapsody Global
          </span>
          <span 
            className={cn(
              "text-xs font-medium",
              variant === "light" ? "text-white/80" : "text-gray-600"
            )}
          >
            Missionary Portal
          </span>
        </div>
      )}
    </Link>
  );
}
