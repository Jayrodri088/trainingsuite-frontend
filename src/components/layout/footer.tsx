"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { T, useT } from "@/components/t";

export function Footer() {
  const { t } = useT();

  const trainingLinks = [
    { label: t("Training Materials"), href: "/courses" },
    { label: t("Live Sessions"), href: "/live-sessions" },
    { label: t("My Progress"), href: "/dashboard" },
  ];

  const legalLinks1 = [
    { label: t("About"), href: "/about" },
    { label: t("Contact"), href: "/contact" },
    { label: t("FAQ"), href: "/faq" },
  ];

  const supportLinks = [
    { label: t("Help Center"), href: "/help" },
    { label: t("Community"), href: "/forums" },
  ];

  const legalLinks2 = [
    { label: t("Terms of Service"), href: "/terms" },
    { label: t("Privacy Policy"), href: "/privacy" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-10 lg:gap-12 text-left">
          {/* Column 1: Logo + description */}
          <div className="lg:col-span-1">
            <Logo className="mb-4" />
            <p className="text-sm text-gray-500 max-w-[260px] leading-relaxed">
              <T>Equipping ministers worldwide with dedicated training modules and live mentorship for global impact.</T>
            </p>
          </div>

          {/* Column 2: Training – bold blue title on mobile per design */}
          <div>
            <h4 className="font-sans font-bold text-[#0052CC] md:text-black text-base mb-3 md:mb-4">
              <T>Training</T>
            </h4>
            <ul className="space-y-3">
              {trainingLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal (About, Contact, FAQ) */}
          <div>
            <h4 className="font-sans font-bold text-[#0052CC] md:text-black text-base mb-3 md:mb-4">
              <T>Legal</T>
            </h4>
            <ul className="space-y-3">
              {legalLinks1.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4 className="font-sans font-bold text-black text-base mb-4">
              <T>Support</T>
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Legal (Terms, Privacy) */}
          <div>
            <h4 className="font-sans font-bold text-[#0052CC] md:text-black text-base mb-3 md:mb-4">
              <T>Legal</T>
            </h4>
            <ul className="space-y-3">
              {legalLinks2.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="font-sans text-sm text-gray-500">
            &copy; {new Date().getFullYear()} <T>Rhapsody Omega Force. All rights reserved.</T>
          </p>
        </div>
      </div>
    </footer>
  );
}
