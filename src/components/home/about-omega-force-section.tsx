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
    <section className="relative overflow-hidden min-h-0 lg:min-h-[62vh] flex flex-col lg:flex-row lg:items-center bg-linear-to-br from-white via-blue-50/30 to-white py-10 sm:py-14 md:py-16 lg:py-20 border-b border-gray-100">
      <div className="container relative z-10 order-1 w-full max-w-7xl shrink-0 px-4 sm:px-6 lg:px-8 lg:pl-20 flex flex-col items-center lg:items-stretch">
        <div className="max-w-xl lg:max-w-2xl w-full text-center lg:text-left">
          <h2 className="font-sans text-2xl sm:text-4xl md:text-5xl font-bold text-black mb-3 sm:mb-4">
            <T>About Rhapsody Omega Force</T>
          </h2>
          <p className="font-sans text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed whitespace-pre-line">
            <T>{`A specially trained workforce of the Rhapsody Global Network, equipped to propagate the gospel in this terminal generation till the last lost soul is brought in.

This site will inspire, edify and equip you better as a Rhapsody Ambassador; you will improve personally, Excel as a Rhapsody Missionary and become a leading force in the organization of Rhapsody End-Time Teaching Crusades.`}</T>
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
      <div className="relative order-2 lg:absolute lg:right-8 lg:top-1/2 lg:-translate-y-1/2 lg:order-0 mt-8 sm:mt-10 lg:mt-0 w-full max-w-[min(88vw,300px)] sm:max-w-[320px] mx-auto lg:mx-0 lg:w-[45%] lg:min-w-[300px] lg:max-w-[560px] aspect-square min-h-[220px] sm:min-h-[250px] lg:min-h-0 pointer-events-auto opacity-90 lg:opacity-95 flex items-center justify-center [&>div]:w-full [&>div]:h-full [&>div]:min-h-full z-0 lg:z-auto">
        <InteractiveGlobe />
      </div>
    </section>
  );
}
