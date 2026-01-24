"use client";

import {
  Users,
  Target,
  Award,
  BookOpen,
  Globe,
  Zap,
  Heart,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks";
import { T, useT } from "@/components/t";

const values = [
  {
    icon: Target,
    title: "Quality Education",
    description: "We believe in providing high-quality, accessible education that transforms lives and careers.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "We continuously innovate our platform and learning methods to deliver the best experience.",
  },
  {
    icon: Heart,
    title: "Community",
    description: "We foster a supportive community where learners and instructors can connect and grow together.",
  },
  {
    icon: Sparkles,
    title: "Excellence",
    description: "We strive for excellence in everything we do, from course content to platform features.",
  },
];


export default function AboutPage() {
  const { isAuthenticated } = useAuth();
  const { t } = useT();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <T>About Training Suite</T>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            <T>We're on a mission to democratize education and empower learners worldwide with accessible, high-quality courses taught by industry experts.</T>
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/courses"><T>Explore Courses</T></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact"><T>Contact Us</T></Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8"><T>Our Story</T></h2>
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p>
                <T>Training Suite was founded with a simple yet powerful vision: to make quality education accessible to everyone, everywhere. We are building a comprehensive learning platform to serve learners across the globe.</T>
              </p>
              <p>
                <T>Our team of educators and technologists recognized that traditional education often fails to keep pace with the rapidly changing demands of the modern workforce. We set out to create a platform that bridges this gap by offering practical, up-to-date courses taught by industry professionals.</T>
              </p>
              <p>
                <T>Training Suite aims to host courses across various categories, from technology and business to creative arts and personal development. We're committed to helping learners advance their careers, start new businesses, and achieve their personal goals.</T>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12"><T>Our Values</T></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="pt-6">
                  <div className="h-12 w-12 mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t(value.title)}</h3>
                  <p className="text-muted-foreground">{t(value.description)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isAuthenticated ? <T>Continue Your Learning Journey</T> : <T>Ready to Start Learning?</T>}
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            {isAuthenticated
              ? <T>Explore our courses and continue building your skills with Training Suite.</T>
              : <T>Transform your career with Training Suite. Browse our courses and start your learning journey today.</T>}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/courses"><T>Browse Courses</T></Link>
            </Button>
            {!isAuthenticated && (
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link href="/register"><T>Create Free Account</T></Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
