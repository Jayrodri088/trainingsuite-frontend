"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { T, usePageTranslation, useT } from "@/components/t";
import { cn } from "@/lib/utils";
import { InfoGrid } from "@/components/home";

gsap.registerPlugin(ScrollTrigger);

const InteractiveGlobe = dynamic<{ className?: string }>(
  () => import("@/components/three/interactive-globe").then((m) => m.default),
  { ssr: false }
);

const leadership = [
  {
    image: "/Images/Pastor.webp",
    name: "Rev. Dr. Chris Oyakhilome D.Sc., D.D.",
    titleKey: "President, LoveWorld Inc. & Author, Rhapsody of Realities",
    bioKey: "Through an anointed ministry spanning over 30 years, Pastor, teacher, healing minister, television host, and best-selling author Rev. Dr. Chris Oyakhilome Dsc. DSc DD. has helped millions experience a victorious and purposeful life in God's word. He is the author of the best-seller Rhapsody of Realities, the number one daily devotional around the world. Several millions of copies of the best-selling daily devotional and Bible-study guide have been distributed in over 8123 languages of the world including Afrikaans, Arabic, Cantonese, Croatian, Dutch, English, Finnish, French, German, Hindi, Icelandic, Italian, Mandarin, Myanmar, Portuguese, Russian, Spanish, Swahili…and still counting! New languages are added regularly, making the devotional accessible to many more in different parts of the globe, thus bringing the richness of God's Word into their lives. Little wonder the devotional, oftentimes, is referred to as the \"Messenger Angel\"",
  },
  {
    image: "/Images/CEO.webp",
    name: "Pastor Yemisi Kudehinbu",
    titleKey: "Director, Rhapsody of Realities & Zonal Director, Christ Embassy Lagos Virtual Zone",
    bioKey: "Pastor Yemisi Kudehinbu serves as the Director of Rhapsody of Realities, the best-selling daily devotional that has transformed lives across the globe. She also serves as Zonal Director of Christ Embassy Lagos Virtual Zone (CELVZ) and Director of Loveworld Publications. Pastor Yemisi is a recognized leader within the LoveWorld ministry, having been awarded the Partners' Department of the Year Award for Rhapsody of Realities. She drives the vision of Rhapsody Omega Force, ensuring ministers across the globe have access to a structured curriculum, live mentorship to equip them for the next level of impact.",
  },
];

const ABOUT_PREFETCH_TEXTS: string[] = [
  "Rhapsody Omega Force",
  `A specially trained workforce of the Rhapsody Global Network, equipped to propagate the gospel in this terminal generation till the last lost soul is brought in.

This site will inspire, edify and equip you better as a Rhapsody Ambassador; you will improve personally, Excel as a Rhapsody Missionary and become a leading force in the organization of Rhapsody End-Time Teaching Crusades.`,
  "Explore Courses",
  "View Curriculum",
  "What Rhapsody Omega Force Is About",
  "Rhapsody Omega Force is a specially trained workforce of the Rhapsody Global Network. These individuals are consistently trained to carry out specific missionary assignments with precision — using the Rhapsody of Realities — as we intensify our search for the last lost soul. At the core of the training is organizing Rhapsody End-Time Teaching Crusades in cities across the globe, alongside door-to-door evangelism, church planting, prevailing prayer, and strategic city transformation. The platform also offers weekly prayer sessions, field report uploads, ministry program participation, and the Ask Pastor Chris dashboard for direct mentorship.",
  "Our Mission",
  "The site offers a variety of mission-focused courses — including organizing Rhapsody End-Time Teaching Crusades in your city, door-to-door evangelism, church planting, winning through prevailing prayer, discipleship, and Christianizing your city using Rhapsody of Realities strategically.",
  "Beyond training, the platform enables ministers to participate in ministry programs with Pastor Chris, upload testimonies, field reports and footage from their countries, and access the exclusive Ask Pastor Chris dashboard for life and ministry guidance.",
  "Start Learning",
  "Behind Rhapsody Omega Force is the excellent leadership of those committed to equipping ministers for global impact. Meet the people driving this vision.",
  "Continue Your Learning Journey",
  "Ready to Start Learning?",
  "Continue your missionary training and stay equipped for precision gospel work with Rhapsody Omega Force.",
  "Join the Rhapsody Omega Force workforce. Browse our courses and begin your missionary training today.",
  "Browse Courses",
  "Register Now",
  ...leadership.flatMap((p) => [p.titleKey, p.bioKey]),
];

export default function AboutPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useT();
  usePageTranslation(ABOUT_PREFETCH_TEXTS);
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroButtonsRef = useRef<HTMLDivElement>(null);
  const missionSectionRef = useRef<HTMLElement>(null);
  const missionGridRef = useRef<HTMLDivElement>(null);
  const leadershipIntroRef = useRef<HTMLDivElement>(null);
  const leadershipCardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const ctaInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero: staggered entrance on load
      const heroTl = gsap.timeline({ defaults: { duration: 0.7, ease: "power2.out" } });
      heroTl
        .set([heroTitleRef.current, heroSubtitleRef.current, heroButtonsRef.current], { opacity: 0, y: 28 })
        .to(heroTitleRef.current, { opacity: 1, y: 0 })
        .to(heroSubtitleRef.current, { opacity: 1, y: 0 }, "-=0.5")
        .to(heroButtonsRef.current, { opacity: 1, y: 0 }, "-=0.5");

      // Hero section: fade out as you scroll down, fade in as you scroll up
      if (heroSectionRef.current) {
        gsap.fromTo(
          heroSectionRef.current,
          { opacity: 1 },
          {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: heroSectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      // Mission section: scroll-triggered fade-up
      gsap.set(missionGridRef.current, { opacity: 0, y: 40 });
      gsap.to(missionGridRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: missionSectionRef.current, start: "top 70%", end: "top 45%", toggleActions: "play none none none" },
      });

      // Leadership intro + cards
      gsap.set(leadershipIntroRef.current, { opacity: 0, y: 32 });
      gsap.to(leadershipIntroRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: leadershipIntroRef.current, start: "top 82%", toggleActions: "play none none none" },
      });
      const cards = leadershipCardsRef.current?.children;
      if (cards?.length) {
        gsap.set(cards, { opacity: 0, y: 48 });
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: { trigger: leadershipCardsRef.current!, start: "top 78%", toggleActions: "play none none none" },
        });
      }

      // CTA section
      if (ctaInnerRef.current) {
        gsap.set(ctaInnerRef.current, { opacity: 0, y: 36 });
        gsap.to(ctaInnerRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: ctaRef.current!, start: "top 80%", toggleActions: "play none none none" },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      {/* Who We Are – stacked through laptop sizes; side-by-side from xl upward */}
      <section ref={heroSectionRef} className="relative overflow-hidden min-h-0 xl:min-h-[70vh] flex flex-col xl:flex-row xl:items-center bg-linear-to-br from-white via-blue-50/30 to-white py-12 sm:py-16 md:py-20 xl:py-28">
        {/* Content – centered on smaller screens, left-aligned on wider desktop */}
        <div className="container relative z-10 order-1 w-full max-w-7xl shrink-0 px-4 sm:px-6 lg:px-8 flex flex-col items-center xl:items-stretch">
          <div className="max-w-xl xl:max-w-2xl w-full text-center xl:text-left">
            <h1 ref={heroTitleRef} className="font-sans text-2xl sm:text-4xl md:text-5xl font-bold text-black mb-3 sm:mb-4 opacity-0">
              <T>Rhapsody Omega Force</T>
            </h1>
            <p ref={heroSubtitleRef} className="font-sans text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 opacity-0 leading-relaxed whitespace-pre-line">
              <T>{`A specially trained workforce of the Rhapsody Global Network, equipped to propagate the gospel in this terminal generation till the last lost soul is brought in.

This site will inspire, edify and equip you better as a Rhapsody Ambassador; you will improve personally, Excel as a Rhapsody Missionary and become a leading force in the organization of Rhapsody End-Time Teaching Crusades.`}</T>
            </p>
            <div ref={heroButtonsRef} className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 opacity-0 justify-center xl:justify-start">
              <Button asChild size="lg" className="rounded-lg h-11 px-6 sm:px-8 w-full sm:w-auto bg-[#0052CC] hover:bg-[#003d99] text-white font-bold">
                <Link href="/courses"><T>Explore Courses</T></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-lg h-11 px-6 sm:px-8 w-full sm:w-auto border-gray-300 text-gray-800 hover:bg-gray-50 font-medium">
                <Link href="/courses"><T>View Curriculum</T></Link>
              </Button>
            </div>
          </div>
        </div>
        {/* 3D Globe – below content on mobile/tablet/laptop, right side on xl desktop */}
        <div className="relative order-2 xl:absolute xl:right-4 xl:top-1/2 xl:-translate-y-1/2 xl:order-0 mt-8 sm:mt-10 xl:mt-0 w-full max-w-[min(88vw,340px)] sm:max-w-[360px] lg:max-w-[420px] mx-auto xl:mx-0 xl:w-[46%] xl:min-w-[360px] xl:max-w-[620px] aspect-square min-h-[220px] sm:min-h-[260px] xl:min-h-0 pointer-events-auto opacity-90 xl:opacity-95 flex items-center justify-center [&>div]:w-full [&>div]:h-full [&>div]:min-h-full z-0 xl:z-auto">
          <InteractiveGlobe />
        </div>
      </section>

      {/* Mission section */}
      <section ref={missionSectionRef} className="py-10 sm:py-14 md:py-20 bg-[#f5f5f5] border-y border-gray-200">
        <div className="container max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          {/* Image beside text – stacks on mobile */}
          <div ref={missionGridRef} className="grid grid-cols-1 md:grid-cols-[min(100%,20rem)_1fr] gap-6 sm:gap-8 md:gap-12 items-center rounded-xl overflow-hidden opacity-0 w-full">
            <div className="relative aspect-4/3 md:aspect-square w-full max-w-sm mx-auto md:mx-0 md:max-w-[20rem] rounded-xl overflow-hidden border border-gray-200 shadow-md bg-gray-100">
              <Image
                src="/Images/bg-world.png"
                alt="Rhapsody Omega Force"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="space-y-3 sm:space-y-4 text-center md:text-left">
              <h3 className="font-sans text-lg sm:text-xl font-bold text-black">
                <T>Our Mission</T>
              </h3>
              <p className="font-sans text-sm sm:text-base text-gray-600 leading-relaxed">
                <T>To Raise a workforce united in spirit, faith and purpose, Trained and equipped to locate and safe the Last Lost Soul, thereby wrapping up the church age in glory and victory.</T>
              </p>
              <Button asChild className="rounded-lg bg-[#0052CC] hover:bg-[#003d99] text-white font-semibold mt-2 w-full sm:w-auto">
                <Link href="/courses"><T>Start Learning</T></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <InfoGrid />

      {/* Meet Our Leadership – Image beside text layout */}
      <section className="py-10 sm:py-14 md:py-20 bg-white">
        <div className="container max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <div ref={leadershipIntroRef} className="max-w-3xl mx-auto mb-10 sm:mb-16 md:mb-20 text-center opacity-0">
            <p className="font-sans text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
              <T>Behind Rhapsody Omega Force is the excellent leadership of those committed to equipping ministers for global impact. Meet the people driving this vision.</T>
            </p>
          </div>

          <div ref={leadershipCardsRef} className="space-y-12 sm:space-y-16 md:space-y-20 [&>div]:opacity-0">
            {leadership.map((person, index) => (
              <div
                key={person.name}
                className={cn(
                  "grid grid-cols-1 md:grid-cols-[min(100%,18rem)_1fr] gap-6 sm:gap-8 md:gap-12 items-center w-full",
                  index % 2 === 1 ? "md:[direction:rtl]" : ""
                )}
              >
                {/* Image */}
                <div className={cn("relative aspect-4/5 w-full max-w-[16rem] sm:max-w-xs mx-auto md:mx-0 rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-gray-100", index % 2 === 1 ? "md:[direction:ltr]" : "")}>
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                {/* Text */}
                <div className={cn("space-y-3 sm:space-y-4 text-center md:text-left", index % 2 === 1 ? "md:[direction:ltr]" : "")}>
                  <h3 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold text-black">{person.name}</h3>
                  <p className="font-sans text-xs sm:text-sm md:text-base text-[#0052CC] font-medium">{t(person.titleKey)}</p>
                  <p className="font-sans text-gray-600 leading-relaxed text-sm md:text-base">
                    {t(person.bioKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="py-10 sm:py-14 md:py-20 bg-[#0052CC] text-white">
        <div ref={ctaInnerRef} className="container max-w-7xl w-full px-4 sm:px-6 lg:px-8 text-center opacity-0">
          <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
            {isAuthenticated ? <T>Continue Your Learning Journey</T> : <T>Ready to Start Learning?</T>}
          </h2>
          <p className="font-sans text-white/90 max-w-2xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base md:text-lg">
            {isAuthenticated
              ? <T>Continue your missionary training and stay equipped for precision gospel work with Rhapsody Omega Force.</T>
              : <T>Join the Rhapsody Omega Force workforce. Browse our courses and begin your missionary training today.</T>}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <Button asChild size="lg" className="rounded-lg h-11 px-6 sm:px-8 w-full sm:w-auto bg-white text-[#0052CC] hover:bg-white/90 font-bold">
              <Link href="/courses"><T>Browse Courses</T></Link>
            </Button>
            {!isAuthenticated && (
              <Button asChild size="lg" variant="outline" className="rounded-lg h-11 px-6 sm:px-8 w-full sm:w-auto border-white text-white hover:bg-white/10 font-medium">
                <Link href="/register"><T>Register Now</T></Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
