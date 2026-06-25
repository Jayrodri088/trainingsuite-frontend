"use client";

import Image from "next/image";

const CAMPAIGN_URL = "https://rimpartnership.org";

export function DollarCampaignBanner() {
  return (
    <section className="bg-white border-b border-gray-200 py-10 sm:py-12">
      <div className="container max-w-6xl px-4 sm:px-6 lg:px-8 mx-auto">
        <a
          href={CAMPAIGN_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join in the $1 Race to The Last Man Campaign — Partner with $1"
          className="group relative block w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0052CC] focus-visible:ring-offset-2"
        >
          <div className="relative w-full aspect-[1997/788]">
            <Image
              src="/Images/dollar-campaign.png"
              alt="$1 Campaign — In this Terminal Generation, the Last Lost Soul will be Saved. Be a part of 1 million people to partner with a minimum of $1 each, as we reach the ends of the earth with the gospel."
              fill
              priority
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 1152px) 100vw, 1152px"
            />
          </div>
        </a>
      </div>
    </section>
  );
}
