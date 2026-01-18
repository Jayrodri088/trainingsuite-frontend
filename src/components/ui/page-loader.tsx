"use client";

import { useEffect, useState } from "react";

export function PageLoader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Register the custom element
    import("ldrs").then(({ metronome }) => {
      metronome.register();
      setMounted(true);
    });
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <l-metronome size="50" speed="1.6" color="hsl(var(--primary))"></l-metronome>
      <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

export function InlineLoader({ size = "24", text }: { size?: string; text?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    import("ldrs").then(({ metronome }) => {
      metronome.register();
      setMounted(true);
    });
  }, []);

  if (!mounted) {
    return <div style={{ height: size, width: size }} />;
  }

  return (
    <div className="flex items-center gap-2">
      <l-metronome size={size} speed="1.6" color="hsl(var(--primary))"></l-metronome>
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}
