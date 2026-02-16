"use client";

import { Target, Zap, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks";
import { T, useT } from "@/components/t";

const values = [
  { icon: Target, title: "Quality Education", description: "We believe in providing high-quality, accessible education that transforms lives and careers." },
  { icon: Zap, title: "Innovation", description: "We continuously innovate our platform and learning methods to deliver the best experience." },
  { icon: Heart, title: "Community", description: "We foster a supportive community where learners and instructors can connect and grow together." },
  { icon: Sparkles, title: "Excellence", description: "We strive for excellence in everything we do, from course content to platform features." },
];

export default function AboutPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useT();

  return (
    <div className="min-h-screen bg-white">
      <section className="py-14 sm:py-20 md:py-24 border-b border-gray-200">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4">
            <T>About Rhapsody Omega Force</T>
          </h1>
          <p className="font-sans text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            <T>We&apos;re on a mandate to equip ministers worldwide with world-class training materials and live mentorship for global impact.</T>
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-[10px] h-11 px-8 bg-[#0052CC] hover:bg-[#0052CC]/90 text-white font-bold">
              <Link href="/courses"><T>Explore Courses</T></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-[10px] h-11 px-8 border-gray-300 text-gray-800 hover:bg-gray-50 font-medium">
              <Link href="/contact"><T>Contact Us</T></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-white">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans text-2xl md:text-3xl font-bold text-black text-center mb-8"><T>Our Story</T></h2>
            <div className="font-sans text-gray-600 space-y-4 leading-relaxed">
              <p>
                <T>Rhapsody Omega Force was founded with a simple yet powerful vision: to equip ministers for global impact. We are building a comprehensive training platform to serve ministers across the globe.</T>
              </p>
              <p>
                <T>Our team recognized that quality theological and practical training should be accessible to every minister. We set out to create a platform that offers structured curriculum, HD video lessons, live mentorship, and official certification—all designed for the next level of impact.</T>
              </p>
              <p>
                <T>We are committed to helping ministers advance their calling, reach the last man, and fulfill the mandate through excellent training and community.</T>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-[#f5f5f5] border-y border-gray-200">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-sans text-2xl md:text-3xl font-bold text-black text-center mb-12"><T>Our Values</T></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
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
            <Button asChild size="lg" variant="outline" className="rounded-[10px] h-11 px-8 ml-4 border-white text-white hover:bg-white/10 font-medium" >
              <Link href="/register"><T>Register Now</T></Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
