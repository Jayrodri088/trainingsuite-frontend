"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiProps {
  active: boolean;
  duration?: number;
  className?: string;
}

export function Confetti({ active, duration = 3000 }: ConfettiProps) {
  useEffect(() => {
    if (!active) {
      return;
    }

    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 28,
      spread: 360,
      ticks: 70,
      zIndex: 50,
      disableForReducedMotion: true,
    };

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        window.clearInterval(interval);
        return;
      }

      const particleCount = Math.max(12, Math.round(50 * (timeLeft / duration)));

      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random() * 0.2 + 0.1, y: Math.random() - 0.2 },
      });

      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random() * 0.2 + 0.7, y: Math.random() - 0.2 },
      });
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [active, duration]);

  return null;
}
