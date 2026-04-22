"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { T } from "@/components/t";

const InteractiveGlobe = dynamic<{ className?: string }>(
  () => import("@/components/three/interactive-globe").then((m) => m.default),
  { ssr: false }
);

export function AboutOmegaForceSection() {
  return (
    <section className="relative overflow-hidden min-h-0 lg:min-h-[70vh] flex flex-col lg:flex-row lg:items-center bg-linear-to-br from-white via-blue-50/30 to-white py-12 sm:py-16 md:py-20 lg:py-28 border-b border-gray-100">
      <div className="container relative z-10 order-1 w-full max-w-7xl shrink-0 px-4 sm:px-6 lg:px-8 flex flex-col items-center lg:items-stretch">
        <div className="max-w-xl lg:max-w-2xl w-full text-center lg:text-left">
          <h2 className="font-sans text-2xl sm:text-4xl md:text-5xl font-bold text-black mb-3 sm:mb-4">
            <T>About Rhapsody Omega Force</T>
          </h2>
          <p className="font-sans text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
            <T>
              A specially trained workforce of the Rhapsody Global Network, trained and equipped to propagate the gospel in this terminal generation till the last lost soul is brought in.
            </T>
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
            <Button
              asChild
              size="lg"
              className="rounded-lg h-11 px-6 sm:px-8 w-full sm:w-auto bg-[#0052CC] hover:bg-[#003d99] text-white font-bold"
            >
              <Link href="/about">
                <T>Learn more</T>
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="relative order-2 lg:absolute lg:right-4 lg:top-1/2 lg:-translate-y-1/2 lg:order-0 mt-8 sm:mt-10 lg:mt-0 w-full max-w-[min(90vw,320px)] sm:max-w-[340px] mx-auto lg:mx-0 lg:w-[48%] lg:min-w-[320px] lg:max-w-[620px] aspect-square min-h-[220px] sm:min-h-[260px] lg:min-h-0 pointer-events-auto opacity-90 lg:opacity-95 flex items-center justify-center [&>div]:w-full [&>div]:h-full [&>div]:min-h-full z-0 lg:z-auto">
        <InteractiveGlobe />
      </div>
    </section>
  );
}
