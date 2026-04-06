"use client";

import Link from "next/link";
import { HelpCircle, MessageSquare, BookOpen, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { T } from "@/components/t";

export default function HelpPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const loggedIn = Boolean(isAuthenticated && user);
  const sessionPending = isLoading && !user;

  return (
    <div className="min-h-screen bg-white">
      <section className="py-14 sm:py-20 border-b border-gray-200">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4">
            <T>Help Center</T>
          </h1>
          <p className="font-sans text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            {sessionPending ? (
              <T>Find answers, get in touch, and access training resources.</T>
            ) : loggedIn ? (
              <T>Find answers, get in touch, or open your dashboard to continue your training.</T>
            ) : (
              <T>Find answers, get in touch, or sign in to access your dashboard and training progress.</T>
            )}
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <Link
              href="/faq"
              className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-[#0052CC]/30 transition-all group"
            >
              <div className="h-14 w-14 rounded-xl bg-[#0052CC]/10 flex items-center justify-center mb-4 group-hover:bg-[#0052CC]/20 transition-colors">
                <HelpCircle className="h-7 w-7 text-[#0052CC]" />
              </div>
              <h2 className="font-sans text-lg font-bold text-black mb-2"><T>FAQ</T></h2>
              <p className="font-sans text-sm text-gray-600">
                <T>Frequently asked questions and answers</T>
              </p>
            </Link>

            <Link
              href="/contact"
              className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-[#0052CC]/30 transition-all group"
            >
              <div className="h-14 w-14 rounded-xl bg-[#0052CC]/10 flex items-center justify-center mb-4 group-hover:bg-[#0052CC]/20 transition-colors">
                <MessageSquare className="h-7 w-7 text-[#0052CC]" />
              </div>
              <h2 className="font-sans text-lg font-bold text-black mb-2"><T>Contact Us</T></h2>
              <p className="font-sans text-sm text-gray-600">
                <T>Send a message to our support team</T>
              </p>
            </Link>

            <Link
              href="/courses"
              className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-[#0052CC]/30 transition-all group"
            >
              <div className="h-14 w-14 rounded-xl bg-[#0052CC]/10 flex items-center justify-center mb-4 group-hover:bg-[#0052CC]/20 transition-colors">
                <BookOpen className="h-7 w-7 text-[#0052CC]" />
              </div>
              <h2 className="font-sans text-lg font-bold text-black mb-2"><T>Training Materials</T></h2>
              <p className="font-sans text-sm text-gray-600">
                <T>Browse courses and start learning</T>
              </p>
            </Link>
          </div>

          <div className="mt-12 text-center min-h-[5.5rem]">
            {sessionPending ? (
              <div
                className="mx-auto h-11 max-w-xs rounded-lg bg-gray-100 animate-pulse"
                aria-busy
                aria-label="Loading"
              />
            ) : loggedIn ? (
              <>
                <p className="font-sans text-gray-600 mb-4">
                  <T>Need your learner tools? Open your dashboard anytime.</T>
                </p>
                <Button asChild size="lg" className="rounded-lg h-11 px-8 bg-[#0052CC] hover:bg-[#0052CC]/90 text-white font-bold">
                  <Link href="/dashboard" className="inline-flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <T>Go to dashboard</T>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <p className="font-sans text-gray-600 mb-4">
                  <T>Already have an account? Sign in to access your dashboard and help resources.</T>
                </p>
                <Button asChild size="lg" className="rounded-lg h-11 px-8 bg-[#0052CC] hover:bg-[#0052CC]/90 text-white font-bold">
                  <Link href="/login" className="inline-flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <T>Sign In</T>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
