"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { T } from "@/components/t";

interface StatementSectionProps {
  isAuthenticated: boolean;
  statementItems: string[];
}

export function StatementSection({ isAuthenticated, statementItems }: StatementSectionProps) {
  return (
    <section className="relative py-14 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
      {/* Background image – slightly reduced size */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 ">
          <Image
            src="/Images/bg-ready.jpg"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Single row container: image height = content + CTA height */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-8 md:gap-10 lg:gap-12">
          {/* Mobile: image on top. Desktop: image left. Two separate containers: empty frame + course image. */}
          <div className="order-1 lg:order-1 lg:min-w-0 lg:flex-1 lg:max-w-[50%] flex min-h-[240px] sm:min-h-[280px] lg:min-h-0 lg:h-full">
            {/* Wrapper: aspect-4/3 gives explicit size so Next Image fill can render */}
            <div className="relative w-full max-w-lg mx-auto lg:mx-0 aspect-4/3 min-h-[260px] rounded-[16px] overflow-visible">
              {/* Container 1 – empty.png only (narrower, shifted left) */}
              <div className="absolute -left-3 top-0 bottom-0 w-[65%] rounded-[16px] overflow-hidden shadow-2xl bg-[#4D4D4D] z-0">
                <Image
                  src="/Images/empty.png"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Container 2 – course.png only (separate container, in front) */}
              <div className="absolute top-6 left-6 right-4 bottom-4 rounded-[12px] overflow-hidden shadow-xl z-10">
                <Image
                  src="/Images/course.png"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>

          {/* Right – content + CTA. Mobile: below image. Desktop: right column. */}
          <div className="order-2 lg:order-2 lg:flex-1 lg:min-w-0 flex flex-col justify-center space-y-4 md:space-y-6 text-center lg:text-left">
            <h2 className="font-sans text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight">
              <T>Ready to answer the call to service?</T>
            </h2>

            <p className="text-sm md:text-lg text-white/90 leading-relaxed max-w-lg mx-auto lg:mx-0">
              <T>Join a global network of ministers equipping themselves for the next level of impact through the Rhapsody Global Missionaries Portal.</T>
            </p>

            <ul className="space-y-2 text-white/90 text-left mx-auto lg:mx-0 max-w-sm lg:max-w-none">
              {statementItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  <span className="text-sm md:text-base">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 flex justify-center lg:justify-start">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-lg bg-white text-black hover:bg-white/90 font-medium text-sm w-full sm:w-auto"
                  asChild
                >
                  <Link href="/dashboard"><T>Continue Learning</T></Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-[12px] bg-white text-black hover:bg-white/90 font-medium text-sm w-full sm:w-auto"
                  asChild
                >
                  <Link href="/register"><T>Register Now</T></Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
