"use client";

import Image from "next/image";
import { T, useT } from "@/components/t";

// Row 1 testimonials (slides left)
const ROW_1_TESTIMONIALS = [
  {
    quoteKey: "The classes from Missionaries Portal have been really helpful in equipping me carry out our mandate to reach the last man. Thanks a lot to all the teacher.",
    name: "Pastor Rachael Esther",
    roleKey: "Minister",
  },
  {
    quoteKey: "The classes from Missionaries Portal have been really helpful in equipping me carry out our mandate to reach the last man. Thanks a lot to all the teacher.",
    name: "Deaconess Bunmi",
    roleKey: "Minister",
  },
  {
    quoteKey: "The classes from Missionaries Portal have been really helpful in equipping me carry out our mandate to reach the last man. Thanks a lot to all the teacher.",
    name: "Brother Samuel",
    roleKey: "Minister",
  },
] as const;

// Row 2 testimonials (slides right)
const ROW_2_TESTIMONIALS = [
  {
    quoteKey: "The classes from Missionaries Portal have been really helpful in equipping me carry out our mandate to reach the last man. Thanks a lot to all the teacher.",
    name: "Sister Sadie Sinks",
    roleKey: "Minister",
  },
  {
    quoteKey: "The classes from Missionaries Portal have been really helpful in equipping me carry out our mandate to reach the last man. Thanks a lot to all the teacher.",
    name: "Sister Anna De Amas",
    roleKey: "Minister",
  },
  {
    quoteKey: "The classes from Missionaries Portal have been really helpful in equipping me carry out our mandate to reach the last man. Thanks a lot to all the teacher.",
    name: "Brother Emmanuel",
    roleKey: "Minister",
  },
] as const;

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <div className="flex flex-col w-[280px] sm:w-[320px] md:w-[360px] shrink-0 bg-white rounded-[12px] shadow-sm p-5 md:p-6">
      {/* Blue quote icon */}
      <div className="mb-4">
        <Image
          src="/Icons/comma.png"
          alt=""
          width={32}
          height={32}
          className="w-8 h-8"
        />
      </div>
      {/* Quote text */}
      <p className="font-sans text-[#374151] text-sm leading-relaxed mb-6 flex-1">
        {quote}
      </p>
      {/* Avatar + name/role */}
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          <Image
            src="/Icons/Avatar (2).png"
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
  testimonials: { quote: string; name: string; role: string }[];
  direction: "left" | "right";
}) {
  // Duplicate cards for seamless infinite scroll
  const cards = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div className="relative overflow-hidden py-3">
      <div
        className={`flex gap-6 ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        }`}
      >
        {cards.map((item, idx) => (
          <TestimonialCard
            key={idx}
            quote={item.quote}
            name={item.name}
            role={item.role}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Testimonies section – header (pill + two-line heading) and two rows of horizontally sliding cards.
 */
export function TestimoniesSection() {
  const { t } = useT();

  const row1 = ROW_1_TESTIMONIALS.map((item) => ({
    quote: t(item.quoteKey),
    name: item.name,
    role: t(item.roleKey),
  }));

  const row2 = ROW_2_TESTIMONIALS.map((item) => ({
    quote: t(item.quoteKey),
    name: item.name,
    role: t(item.roleKey),
  }));

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#f5f5f5] overflow-hidden">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
          {/* Pill-shaped tag */}
          <div className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 md:px-5 md:py-2.5 mb-4 md:mb-6 shadow-sm">
            <span className="text-xs md:text-base text-gray-600 font-medium">
              <T>On a mandate to reach the last man!</T>
            </span>
          </div>

          {/* Main heading – two lines, large bold black, centered */}
          <h2 className="font-sans text-2xl sm:text-4xl md:text-5xl font-bold text-black leading-tight text-center max-w-2xl">
            <span className="block"><T>Testimonies from</T></span>
            <span className="block"><T>Global Ministers</T></span>
          </h2>
        </div>
      </div>

      {/* Sliding testimonial rows – on mobile: single row with peek; desktop: two rows */}
      <div className="flex flex-col gap-4 md:gap-6 px-0">
        <div className="md:hidden overflow-hidden">
          <MarqueeRow testimonials={row1} direction="left" />
        </div>
        <div className="hidden md:flex flex-col gap-6">
          <MarqueeRow testimonials={row1} direction="left" />
          <MarqueeRow testimonials={row2} direction="right" />
        </div>
      </div>
    </section>
  );
}
