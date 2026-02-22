"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Target, Zap, Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { T, useT } from "@/components/t";
import { cn } from "@/lib/utils";

const values = [
  { icon: Target, title: "Quality Education", description: "We believe in providing high-quality, accessible education that transforms lives and careers." },
  { icon: Zap, title: "Innovation", description: "We continuously innovate our platform and learning methods to deliver the best experience." },
  { icon: Heart, title: "Community", description: "We foster a supportive community where learners and instructors can connect and grow together." },
  { icon: BookOpen, title: "Excellence", description: "We strive for excellence in everything we do, from course content to platform features." },
];

const leadership = [
  {
    image: "/Images/Pastor.webp",
    name: "Rev. Dr. Chris Oyakhilome D.Sc., D.D.",
    titleKey: "President, LoveWorld Inc. & Author, Rhapsody of Realities",
    roleKey: "Meet Our Esteemed Pastor",
    bioKey: "Rev. Dr. Chris Oyakhilome is the President of LoveWorld Inc. (Christ Embassy), a global ministry he founded in 1987 that now spans over 100 branches worldwide with approximately 13 million members. He is the author of Rhapsody of Realities—the world's #1 daily devotional—which has reached all 242 countries and territories with over 3.6 billion copies distributed in more than 7,000 languages. With over 40 years of ministry, Pastor Chris has impacted millions through his television broadcast 'Atmosphere for Miracles,' the Healing School, and more than 30 authored books. Under his visionary leadership, Rhapsody Omega Force was established to equip ministers worldwide with world-class training and mentorship for global impact.",
  },
  {
    image: "/Images/CEO.webp",
    name: "Pastor Yemisi Kudehinbu",
    titleKey: "Director, Rhapsody of Realities & Zonal Director, Christ Embassy Lagos Virtual Zone",
    roleKey: "Meet Our Esteemed Director",
    bioKey: "Pastor Yemisi Kudehinbu serves as the Director of Rhapsody of Realities, the best-selling daily devotional that has transformed lives across the globe. She also serves as Zonal Director of Christ Embassy Lagos Virtual Zone (CELVZ) and Director of Loveworld Publications. Pastor Yemisi is a recognized leader within the LoveWorld ministry, having been awarded the Partners' Department of the Year Award for Rhapsody of Realities and the Top Partnering Pastor Award in the Church Pastors/Directors category. She drives the vision of Rhapsody Omega Force—ensuring ministers across the globe have access to structured curriculum, live mentorship, and certification for the next level of impact.",
  },
];

export default function AboutPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useT();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Who We Are – Hero */}
      <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: "url(/Images/bg-world.png)" }}
        />
        <div className="container relative max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className={cn(
              "font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <T>Who We Are</T>
          </h1>
          <p
            className={cn(
              "font-sans text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-6 transition-all duration-700 delay-100",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <T>Rhapsody Omega Force is the training arm of Rhapsody of Realities, committed to equipping ministers for global impact through excellence in education, mentorship, and community.</T>
          </p>
          <div
            className={cn(
              "flex flex-wrap justify-center gap-4 transition-all duration-700 delay-200",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <Button asChild size="lg" className="rounded-[10px] h-11 px-8 bg-[#0052CC] hover:bg-[#003d99] text-white font-bold">
              <Link href="/courses"><T>Explore Courses</T></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-[10px] h-11 px-8 border-gray-300 text-gray-800 hover:bg-gray-50 font-medium">
              <Link href="/courses"><T>View Curriculum</T></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What Omega Force Is About – Platform mission + image beside text */}
      <section className="py-14 sm:py-20 bg-[#f5f5f5] border-y border-gray-200">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-sans text-2xl md:text-3xl font-bold text-black text-center mb-10 animate-about-fade-up">
            <T>What Rhapsody Omega Force Is About</T>
          </h2>
          <p className="font-sans text-gray-700 text-center max-w-3xl mx-auto mb-12 leading-relaxed animate-about-fade-up about-stagger-1 opacity-0 [animation-fill-mode:forwards]">
            <T>The platform is a professional training portal designed for the rigorous spiritual and practical development of ministers worldwide. We exist to equip you with structured curriculum, HD video lessons, live mentorship, and official certification—all aimed at the next level of impact.</T>
          </p>

          {/* Image beside text */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center rounded-[12px] overflow-hidden animate-about-fade-up about-stagger-2 opacity-0 [animation-fill-mode:forwards]">
            <div className="relative aspect-4/3 md:aspect-square rounded-[12px] overflow-hidden border border-gray-200 shadow-md bg-gray-100">
              <Image
                src="/Images/bg-world.png"
                alt="Rhapsody Omega Force"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="space-y-4">
              <h3 className="font-sans text-xl font-bold text-black">
                <T>Our Mission</T>
              </h3>
              <p className="font-sans text-gray-600 leading-relaxed">
                <T>We are building a comprehensive training platform to serve ministers across the globe. Quality theological and practical training should be accessible to every minister—so we offer structured curriculum, live sessions, and certification designed for lasting impact.</T>
              </p>
              <p className="font-sans text-gray-600 leading-relaxed">
                <T>We are committed to helping ministers advance their calling, reach the last man, and fulfill the mandate through excellent training and community.</T>
              </p>
              <Button asChild className="rounded-[10px] bg-[#0052CC] hover:bg-[#003d99] text-white font-semibold mt-2">
                <Link href="/courses"><T>Start Learning</T></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Leadership – Image beside text layout */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-sans text-2xl md:text-3xl font-bold text-black text-center mb-4 animate-about-fade-up">
            <T>Meet Our Leadership</T>
          </h2>
          <p className="font-sans text-gray-600 text-center max-w-2xl mx-auto mb-14 animate-about-fade-up about-stagger-1 opacity-0 [animation-fill-mode:forwards]">
            <T>Behind Rhapsody Omega Force are leaders committed to equipping ministers for global impact.</T>
          </p>

          <div className="space-y-16 md:space-y-20">
            {leadership.map((person, index) => (
              <div
                key={person.name}
                className={cn(
                  "grid md:grid-cols-2 gap-8 md:gap-12 items-center",
                  "animate-about-fade-up opacity-0 [animation-fill-mode:forwards]",
                  index === 0 ? "about-stagger-2" : "about-stagger-3",
                  index % 2 === 1 ? "md:[direction:rtl]" : ""
                )}
              >
                {/* Image */}
                <div className={cn("relative aspect-4/5 rounded-[12px] overflow-hidden border border-gray-200 shadow-lg bg-gray-100", index % 2 === 1 ? "md:[direction:ltr]" : "")}>
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                {/* Text */}
                <div className={cn("space-y-4", index % 2 === 1 ? "md:[direction:ltr]" : "")}>
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#0052CC] bg-[#0052CC]/10 px-3 py-1 rounded-full">
                    <T>{person.roleKey}</T>
                  </span>
                  <h3 className="font-sans text-2xl md:text-3xl font-bold text-black">{person.name}</h3>
                  <p className="font-sans text-sm md:text-base text-[#0052CC] font-medium">{t(person.titleKey)}</p>
                  <p className="font-sans text-gray-600 leading-relaxed text-sm md:text-base">
                    <T>{person.bioKey}</T>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-14 sm:py-20 bg-[#f5f5f5] border-y border-gray-200">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-sans text-2xl md:text-3xl font-bold text-black text-center mb-12">
            <T>Our Values</T>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((value, i) => (
              <div
                key={value.title}
                className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-[#0052CC]/20 transition-all duration-300"
              >
                <div className="h-12 w-12 mb-4 rounded-[10px] bg-[#0052CC]/10 flex items-center justify-center">
                  <value.icon className="h-6 w-6 text-[#0052CC]" />
                </div>
                <h3 className="font-sans text-lg font-bold text-black mb-2">{t(value.title)}</h3>
                <p className="font-sans text-sm text-gray-600 leading-relaxed">{t(value.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 bg-[#0052CC] text-white">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-sans text-2xl md:text-3xl font-bold mb-4">
            {isAuthenticated ? <T>Continue Your Learning Journey</T> : <T>Ready to Start Learning?</T>}
          </h2>
          <p className="font-sans text-white/90 max-w-2xl mx-auto mb-8 text-base md:text-lg">
            {isAuthenticated
              ? <T>Explore our courses and continue building your skills with Rhapsody Omega Force.</T>
              : <T>Join a global network of ministers. Browse our courses and begin your training today.</T>}
          </p>
          <Button asChild size="lg" className="rounded-[10px] h-11 px-8 bg-white text-[#0052CC] hover:bg-white/90 font-bold">
            <Link href="/courses"><T>Browse Courses</T></Link>
          </Button>
          {!isAuthenticated && (
            <Button asChild size="lg" variant="outline" className="rounded-[10px] h-11 px-8 ml-4 border-white text-white hover:bg-white/10 font-medium">
              <Link href="/register"><T>Register Now</T></Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
