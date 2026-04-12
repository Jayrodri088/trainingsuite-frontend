"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { T } from "@/components/t";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 md:py-10 lg:px-8">
        <div
          className="relative mx-auto flex min-h-[min(82vh,760px)] w-full max-w-7xl overflow-hidden rounded-2xl bg-cover bg-center bg-no-repeat sm:rounded-3xl"
          style={{ backgroundImage: "url(/Images/bg-world.png)" }}
        >
          <div className="hidden w-full max-w-xl flex-col justify-between p-10 text-white lg:flex">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/90">
                <T>Rhapsody Omega Force</T>
              </p>
              <p className="max-w-md text-base leading-relaxed text-white/90">
                <T>Access your training dashboard, engage in weekly prevailing prayers, upload field reports, and connect with your global workforce.</T>
              </p>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/80">
              <T>Specially trained missionaries of the Rhapsody Global Network, advancing the gospel with precision to reach the last lost soul.</T>
            </p>
          </div>

          <div className="flex flex-1 items-center justify-center bg-black/25 px-4 py-10 sm:px-6 md:px-10">
            <div className="w-full max-w-[480px] rounded-2xl border border-white/70 bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
