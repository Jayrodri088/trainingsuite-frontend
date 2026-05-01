"use client";

import Image from "next/image";
import { useT } from "@/components/t";
import { cn } from "@/lib/utils";

type FrameCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type IconPosition = "left" | "right";

const DEFAULT_INFO_ITEMS_KEYS = [
  {
    titleKey: "Structured Curriculum",
    descKey: "Theological and practical training materials curated for depth.",
    image: "/Images/image 1.png",
    frameCorner: "top-left" as FrameCorner,
    iconPosition: "left" as IconPosition,
  },
  {
    titleKey: "HD Video Lessons",
    descKey: "On-demand high-definition content from senior leadership.",
    image: "/Images/hd-film 1.png",
    frameCorner: "top-right" as FrameCorner,
    iconPosition: "right" as IconPosition,
  },
  {
    titleKey: "Live Mentorship",
    descKey: "Real-time interactive sessions and spiritual guidance.",
    image: "/Images/image 3.png",
    frameCorner: "bottom-left" as FrameCorner,
    iconPosition: "left" as IconPosition,
  },
  {
    titleKey: "Official Certification",
    descKey: "Recognized validation of completed ministry training.",
    image: "/Images/certificate 1.png",
    frameCorner: "bottom-right" as FrameCorner,
    iconPosition: "right" as IconPosition,
  },
] as const;

const HOMEPAGE_INFO_ITEMS_KEYS = [
  {
    titleKey: "HD Video Lessons",
    descKey: "On-demand high-definition content from senior leadership.",
    image: "/Images/rhap-tv.png",
    frameCorner: "top-right" as FrameCorner,
    iconPosition: "right" as IconPosition,
    isPhoto: true,
  },
  {
    titleKey: "Live Mentorship",
    descKey: "Join weekly prayer sessions",
    image: "/Images/pastor-c.jpg",
    frameCorner: "bottom-left" as FrameCorner,
    iconPosition: "left" as IconPosition,
    isPhoto: true,
  },
  {
    titleKey: "Official Certification",
    descKey: "Recognized validation of completed ministry training.",
    image: "/Images/certificate 1.png",
    frameCorner: "bottom-right" as FrameCorner,
    iconPosition: "right" as IconPosition,
    isPhoto: false,
  },
] as const;

/* Mobile: frame at top center. sm+: frame in corner */
const FRAME_POSITION_CLASSES: Record<FrameCorner, string> = {
  "top-left":
    "top-0 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-3 sm:right-auto sm:bottom-auto",
  "top-right":
    "top-0 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-3 sm:bottom-auto",
  "bottom-left":
    "top-0 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:top-auto sm:bottom-0 sm:left-3 sm:right-auto",
  "bottom-right":
    "top-0 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:top-auto sm:bottom-0 sm:left-auto sm:right-3",
};

const FRAME_OBJECT_POSITION: Record<FrameCorner, string> = {
  "top-left": "object-center sm:object-left-top",
  "top-right": "object-center sm:object-right-top",
  "bottom-left": "object-center sm:object-left-bottom",
  "bottom-right": "object-center sm:object-right-bottom",
};

/* Top cards use frame-1.png; bottom cards use frame.png */
const FRAME_IMAGE: Record<FrameCorner, string> = {
  "top-left": "/Images/frame-1.png",
  "top-right": "/Images/frame-1.png",
  "bottom-left": "/Images/frame-2.png",
  "bottom-right": "/Images/frame-2.png",
};

interface InfoGridProps {
  variant?: "default" | "homepage";
}

export function InfoGrid({ variant = "default" }: InfoGridProps) {
  const { t } = useT();
  const isHomepageVariant = variant === "homepage";
  const sourceItems =
    isHomepageVariant ? HOMEPAGE_INFO_ITEMS_KEYS : DEFAULT_INFO_ITEMS_KEYS;
  const infoItems = sourceItems.map((item) => ({
    title: t(item.titleKey),
    desc: t(item.descKey),
    image: item.image,
    frameCorner: item.frameCorner,
    iconPosition: item.iconPosition,
    isPhoto: "isPhoto" in item ? item.isPhoto : false,
  }));
  const hasOddItemCount = infoItems.length % 2 !== 0;

  return (
    <section className="border-b border-gray-200 bg-white pt-6 sm:pt-8 pb-12 md:pb-16">
      <div className={cn("container px-4 sm:px-6 lg:px-8 mx-auto", isHomepageVariant ? "max-w-6xl" : "max-w-6xl")}>
        {/* Responsive grid: 1 column mobile, 2 on tablet, 3 on wide screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {infoItems.map((item, idx) => {
            const cardFrameCorner =
              isHomepageVariant ? "bottom-left" : item.frameCorner;
            const cardIconPosition =
              isHomepageVariant ? "left" : item.iconPosition;
            const isLastOddCard =
              !isHomepageVariant && hasOddItemCount && idx === infoItems.length - 1;
            return (
            <div
              key={idx}
              className={cn(
                "group relative mx-auto flex min-h-0 w-full max-w-[320px] min-w-0 flex-col bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden pt-0 sm:mx-0 sm:max-w-none sm:min-h-[180px] sm:flex-row sm:items-center",
                isLastOddCard &&
                  "sm:col-span-2 sm:mx-auto sm:max-w-[680px] xl:col-span-1 xl:max-w-none"
              )}
            >
              {/* sm+: Frame in corner (hidden on mobile) */}
              <div
                className={`absolute z-0 hidden w-28 h-28 sm:block sm:w-32 sm:h-32 md:w-[225px] md:h-[225px] pointer-events-none ${FRAME_POSITION_CLASSES[cardFrameCorner]}`}
              >
                <Image
                  src={FRAME_IMAGE[cardFrameCorner]}
                  alt=""
                  fill
                  className={`object-contain opacity-90 ${FRAME_OBJECT_POSITION[cardFrameCorner]}`}
                  sizes="225px"
                />
              </div>

              {/* Mobile: frame-1.png for all cards, flush to top of card (no spacing above) */}
              <div className="relative mt-0 flex shrink-0 flex-col pt-0 sm:hidden">
                <div className="relative mx-auto flex h-36 w-44 items-center justify-center sm:hidden">
                  <Image
                    src="/Images/frame-1.png"
                    alt=""
                    fill
                    className="object-contain object-top opacity-90"
                    sizes="176px"
                  />
                  <div
                    className={cn(
                      "relative z-10",
                      item.isPhoto ? "h-24 w-24 rounded-lg overflow-hidden" : "h-24 w-24"
                    )}
                  >
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className={item.isPhoto ? "object-cover" : "object-contain"}
                      sizes="96px"
                    />
                  </div>
                </div>
              </div>

              {/* Content: mobile = centered block, text left-aligned; sm+ = horizontal row */}
              <div className="relative z-10 flex flex-1 flex-col p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
                {/* sm+: icon left */}
                {cardIconPosition === "left" && (
                  <div
                    className={cn(
                      "relative hidden shrink-0 sm:block",
                      isHomepageVariant
                        ? "w-28 h-28 sm:w-32 sm:h-32 md:w-32 md:h-32"
                        : item.isPhoto
                          ? "w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-lg overflow-hidden"
                          : "w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-36",
                      item.isPhoto && "rounded-lg overflow-hidden"
                    )}
                  >
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className={item.isPhoto ? "object-cover" : "object-contain"}
                      sizes="160px"
                    />
                  </div>
                )}

                <div
                  className={cn(
                    "mx-auto flex min-w-0 flex-1 flex-col gap-2 text-left sm:mx-0 sm:max-w-none",
                    isHomepageVariant ? "max-w-none" : "max-w-sm"
                  )}
                >
                  <h3 className="font-sans font-bold text-base text-gray-900 sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {item.desc}
                  </p>
                </div>

                {/* sm+: icon right */}
                {cardIconPosition === "right" && (
                  <div
                    className={cn(
                      "relative hidden shrink-0 sm:block",
                      isHomepageVariant
                        ? "w-28 h-28 sm:w-32 sm:h-32 md:w-32 md:h-32"
                        : item.isPhoto
                          ? "w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-lg overflow-hidden"
                          : "w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-36",
                      item.isPhoto && "rounded-lg overflow-hidden"
                    )}
                  >
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className={item.isPhoto ? "object-cover" : "object-contain"}
                      sizes="160px"
                    />
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
