import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding/Mission */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div>
          <Logo variant="light" />
        </div>

        <div className="space-y-6 max-w-lg">
          <div className="space-y-4">
            <h1 className="font-heading text-4xl font-bold tracking-tight leading-[1.1]">
              Equipping Ministers for Global Impact.
            </h1>
            <p className="text-primary-foreground/80 text-lg font-light leading-relaxed">
              "To prepare God's people for works of service, so that the body of Christ may be built up."
              <br /><span className="text-sm opacity-70 mt-2 block">— Ephesians 4:12</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs uppercase tracking-widest text-primary-foreground/60 font-medium">
          <span>&copy; {new Date().getFullYear()} Rhapsody of Realities</span>
          <Link href="/privacy" className="hover:text-primary-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-primary-foreground transition-colors">
            Terms
          </Link>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-col bg-background">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-6 border-b border-border">
          <Logo />
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-[400px] space-y-8 animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
