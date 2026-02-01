"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { T } from "@/components/t";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

const HERO_IMAGES = [
  "/Images/course-1.png",
  "/Images/course.png",
  "/Images/course-1.png",
  "/Images/course.png",
] as const;

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative bg-white py-6 sm:py-8 md:py-10">
      {/* Contained hero: bg does not span full width on large screens; rounded corners */}
      <div
        className="relative min-h-[min(85vh,780px)] w-full max-w-7xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-0"
        style={{ backgroundImage: "url(/Images/bg-world.png)" }}
      >
        {/* Headline – white, large, bold */}
        <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 max-w-4xl leading-tight">
          <T>Equipping Ministers for Global Impact.</T>
        </h1>

        {/* Subheading – white, smaller */}
        <p className="text-white/95 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-8 font-normal">
          <T>A professional training portal designed for the rigorous spiritual and practical development of ministers worldwide.</T>
        </p>

        {/* CTAs – royal blue + white bg / dark text / grey border for View Curriculum */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 sm:mb-16 md:mb-20">
          {isAuthenticated ? (
            <Button
              asChild
              className="rounded-[10px] h-12 px-8 text-sm font-bold bg-[#0052CC] hover:bg-[#003d99] text-white border-0 uppercase tracking-wide w-full sm:w-auto"
              size="lg"
            >
              <Link href="/dashboard"><T>Access Dashboard</T></Link>
            </Button>
          ) : (
            <Button
              asChild
              className="rounded-[10px] h-12 px-8 text-sm font-bold bg-[#0052CC] hover:bg-[#003d99] text-white border-0 uppercase tracking-wide w-full sm:w-auto"
              size="lg"
            >
              <Link href="/register"><T>Begin Training</T></Link>
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-[10px] h-12 px-8 text-sm font-semibold bg-white! text-gray-800! hover:bg-gray-50! border border-gray-300 uppercase tracking-wide w-full sm:w-auto"
          >
            <Link href="/courses"><T>View Curriculum</T></Link>
          </Button>
        </div>

        {/* Carousel: break out of hero padding so it touches left/right edges of the dark section */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] overflow-hidden mt-auto pb-10 sm:pb-12 md:pb-14">
          <div className="flex animate-hero-carousel gap-4 sm:gap-5 md:gap-6">
            {[...HERO_IMAGES, ...HERO_IMAGES].map((src, i) => (
              <div
                key={i}
                className="relative shrink-0 w-[220px] sm:w-[260px] md:w-[300px] aspect-4/3 rounded-[12px] overflow-hidden border-2 border-white/40 bg-white/5 shadow-lg"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
