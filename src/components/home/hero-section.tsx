"use client";

import Link from "next/link";
import Image from "next/image";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { T } from "@/components/t";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative pt-8 md:pt-12 pb-0 bg-white">
      <div className="container max-w-7xl px-4 md:px-8 pb-0 mb-0 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2.5 text-blue-600 text-sm font-semibold mb-6">
          <Globe className="h-5 w-5 shrink-0" />
          <span><T>Rhapsody Global Missionaries</T></span>
        </div>

        <h1 className="font-sans text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#4a4a4a] mb-3 leading-tight max-w-4xl">
          <T>Equipping Ministers for Global Impact.</T>
        </h1>

        <p className="text-base md:text-lg text-[#7a7a7a] max-w-2xl leading-relaxed mb-6 font-normal">
          <T>A professional training portal designed for the rigorous spiritual and practical development of ministers worldwide.</T>
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-0">
          {isAuthenticated ? (
            <Button asChild className="rounded-[10px] h-11 px-8 text-sm font-bold bg-[#0052CC] hover:bg-[#0052CC]/90 text-white border-0 uppercase tracking-wide" size="lg">
              <Link href="/dashboard"><T>Access Dashboard</T></Link>
            </Button>
          ) : (
            <Button asChild className="rounded-[10px] h-11 px-8 text-sm font-bold bg-[#0052CC] hover:bg-[#0052CC]/90 text-white border-0 uppercase tracking-wide" size="lg">
              <Link href="/register"><T>Begin Training</T></Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg" className="rounded-[10px] h-11 px-8 text-sm font-semibold text-[#171717] hover:text-[#3a3a3a] hover:bg-gray-50 border border-none bg-white uppercase tracking-wide">
            <Link href="/courses"><T>View Curriculum</T></Link>
          </Button>
        </div>
      </div>

      <div className="w-full mt-4 mb-8 md:mt-8">
        <div className="relative w-full h-[200px] sm:h-[240px] md:h-[280px]">
          <Image
            src="/Images/bg-hero.png"
            alt="Global presence – ministers worldwide"
            fill
            className="object-contain object-center object-top"
            sizes="100vw"
          />
        </div>
      </div>
    </section>
  );
}
