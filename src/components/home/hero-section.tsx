"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { T } from "@/components/t";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

const HERO_IMAGES = [
  "/Images/course-2.png",
  "/Images/course.png",
  "/Images/course-3.png",
  "/Images/course-4.png",
] as const;

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative bg-white py-6 sm:py-8 md:py-10">
      {/* Contained hero: bg does not span full width on large screens; rounded corners */}
      <div
        className="relative min-h-[min(85vh,780px)] w-full max-w-7xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-0"
      >
        <Image
          src="/Images/bg-world.png"
          alt=""
          fill
          priority
          className="object-cover object-center z-0"
          sizes="100vw"
        />
        <h1 className="relative z-10 font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-3 max-w-5xl leading-tight">
          <T>Rhapsody Omega Force</T>
        </h1>

        {/* Subheading – white, smaller */}
        <p className="relative z-10 text-white/95 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-8 font-normal">
          <T>A specially trained workforce of the Rhapsody Global Network, equipped to propagate the gospel in this terminal generation till the last lost soul is brought in. This is accomplished through the Rhapsody End-Time Teaching Crusades.</T>
        </p>

        {/* CTAs – royal blue + white bg / dark text / grey border for View Curriculum */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4 mb-12 sm:mb-16 md:mb-20">
          {isAuthenticated ? (
            <Button
              asChild
              className="rounded-lg h-12 px-8 text-sm font-bold bg-[#0052CC] hover:bg-[#003d99] text-white border-0 uppercase tracking-wide w-full sm:w-auto"
              size="lg"
            >
              <Link href="/dashboard"><T>Access Dashboard</T></Link>
            </Button>
          ) : (
            <Button
              asChild
              className="rounded-lg h-12 px-8 text-sm font-bold bg-[#0052CC] hover:bg-[#003d99] text-white border-0 uppercase tracking-wide w-full sm:w-auto"
              size="lg"
            >
              <Link href="/register"><T>Begin Training</T></Link>
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-lg h-12 px-8 text-sm font-semibold bg-white! text-gray-800! hover:bg-gray-50! border border-gray-300 uppercase tracking-wide w-full sm:w-auto"
          >
            <Link href="/courses"><T>View Curriculum</T></Link>
          </Button>
        </div>

        {/* Carousel: break out of hero padding so it touches left/right edges of the dark section */}
        <div className="relative z-10 -mx-4 sm:-mx-6 lg:-mx-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] overflow-hidden mt-auto pb-10 sm:pb-12 md:pb-14">
          <div className="flex animate-hero-carousel gap-4 sm:gap-5 md:gap-6 [--hero-carousel-distance:944px] sm:[--hero-carousel-distance:1120px] md:[--hero-carousel-distance:1296px]">
            {Array.from({ length: 3 }).flatMap((_, setIndex) =>
              HERO_IMAGES.map((src, imageIndex) => {
                const itemIndex = setIndex * HERO_IMAGES.length + imageIndex;

                return (
                  <div
                    key={`${setIndex}-${src}`}
                    className="relative shrink-0 w-[220px] sm:w-[260px] md:w-[300px] aspect-4/3 rounded-xl overflow-hidden border-2 border-white/40 bg-white/5 shadow-lg"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      priority={itemIndex < HERO_IMAGES.length}
                      className="object-cover"
                      sizes="300px"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
