"use client";

import Image from "next/image";
import { useT } from "@/components/t";

const INFO_ITEMS_KEYS = [
  { titleKey: "Structured Curriculum", descKey: "Theological and practical training materials curated for depth.", image: "/Images/image 1.png" },
  { titleKey: "HD Video Lessons", descKey: "On-demand high-definition content from senior leadership.", image: "/Images/hd-film 1.png" },
  { titleKey: "Live Mentorship", descKey: "Real-time interactive sessions and spiritual guidance.", image: "/Images/image 3.png" },
  { titleKey: "Official Certification", descKey: "Recognized validation of completed ministry training.", image: "/Images/certificate 1.png" },
] as const;

export function InfoGrid() {
  const { t } = useT();
  const infoItems = INFO_ITEMS_KEYS.map((item) => ({
    title: t(item.titleKey),
    desc: t(item.descKey),
    image: item.image,
  }));

  return (
    <section className="border-b border-gray-200 bg-white pt-6 sm:pt-8 pb-12 md:pb-16">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {infoItems.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col h-full min-h-[260px] sm:min-h-[280px] min-w-0 w-full max-w-[280px] mx-auto sm:max-w-none sm:mx-0 bg-white rounded-[12px] border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6 pb-6 flex flex-col flex-1 min-h-0 justify-start">
                <h3 className="font-sans font-bold text-lg mb-3 text-[#1D4ED8]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="relative flex-1 min-h-[150px] flex flex-col shrink-0">
                <div className="absolute inset-x-0 inset-y-0 w-full h-full pointer-events-none">
                  <Image
                    src="/Images/Ellipse 1.png"
                    alt=""
                    fill
                    className="object-contain object-top w-full"
                    sizes="(max-width: 640px) 384px, (max-width: 1024px) 50vw, 280px"
                  />
                </div>
                <div className="relative z-10 flex justify-center items-center flex-1 px-4 pb-4 pt-2">
                  <div className="relative w-28 h-24 sm:w-32 sm:h-28 flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="object-contain object-center"
                      sizes="(max-width: 640px) 50vw, 128px"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
