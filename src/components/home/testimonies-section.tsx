"use client";

import Image from "next/image";
import { T } from "@/components/t";

export type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
  avatarUrl?: string;
};

function TestimonialCard({ quote, name, role, avatarUrl }: TestimonialItem) {
  return (
    <div className="flex flex-col w-[280px] sm:w-[320px] md:w-[360px] shrink-0 bg-white rounded-[12px] shadow-sm p-5 md:p-6">
      <div className="mb-4">
        <Image
          src="/Icons/comma.png"
          alt=""
          width={32}
          height={32}
          className="w-8 h-8"
        />
      </div>
      <p className="font-sans text-[#374151] text-sm leading-relaxed mb-6 flex-1">
        {quote}
      </p>
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          <Image
            src={avatarUrl ?? "/Icons/Avatar (2).png"}
            alt={name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="font-sans font-semibold text-black text-sm truncate">{name}</p>
          <p className="font-sans text-gray-500 text-xs truncate">{role}</p>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({
  testimonials,
  direction,
}: {
  testimonials: TestimonialItem[];
  direction: "left" | "right";
}) {
  const cards = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div className="relative overflow-hidden py-3">
      <div
        className={`flex gap-6 ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        }`}
      >
        {cards.map((item, idx) => (
          <TestimonialCard key={`${item.name}-${idx}`} {...item} />
        ))}
      </div>
    </div>
  );
}

/**
 * Testimonies section – header and two rows of horizontally sliding cards.
 * Renders only when testimonials are provided (e.g. from the backend). No mock data.
 */
export function TestimoniesSection({
  testimonials = [],
}: {
  testimonials?: TestimonialItem[];
}) {
  if (!testimonials.length) {
    return null;
  }

  const mid = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, mid);
  const row2 = testimonials.slice(mid);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#f5f5f5] overflow-hidden">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 md:px-5 md:py-2.5 mb-4 md:mb-6 shadow-sm">
            <span className="text-xs md:text-base text-gray-600 font-medium">
              <T>On a mandate to reach the last man!</T>
            </span>
          </div>

          <h2 className="font-sans text-2xl sm:text-4xl md:text-5xl font-bold text-black leading-tight text-center max-w-2xl">
            <span className="block"><T>Testimonies from</T></span>
            <span className="block"><T>Global Ministers</T></span>
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:gap-6 px-0">
        <div className="md:hidden overflow-hidden">
          <MarqueeRow testimonials={row1.length ? row1 : testimonials} direction="left" />
        </div>
        <div className="hidden md:flex flex-col gap-6">
          <MarqueeRow testimonials={row1.length ? row1 : testimonials} direction="left" />
          <MarqueeRow testimonials={row2.length ? row2 : testimonials} direction="right" />
        </div>
      </div>
    </section>
  );
}
