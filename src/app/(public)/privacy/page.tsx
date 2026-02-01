"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { T } from "@/components/t";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-14 sm:py-20">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-gray-200 rounded-[12px] shadow-sm">
            <CardHeader>
              <CardTitle className="font-sans text-2xl md:text-3xl font-bold text-black"><T>Privacy Policy</T></CardTitle>
            </CardHeader>
            <CardContent className="font-sans prose prose-sm max-w-none text-gray-600 prose-headings:text-black prose-headings:font-bold">
          <p className="text-muted-foreground"><T>Last updated: January 2026</T></p>

          <h2><T>1. Information We Collect</T></h2>
          <p>
            <T>We collect information you provide directly to us, such as when you create an account, enroll in courses, or contact us for support.</T>
          </p>

          <h2><T>2. How We Use Your Information</T></h2>
          <p>
            <T>We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you.</T>
          </p>

          <h2><T>3. Information Sharing</T></h2>
          <p>
            <T>We do not share your personal information with third parties except as described in this privacy policy or with your consent.</T>
          </p>

          <h2><T>4. Data Security</T></h2>
          <p>
            <T>We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</T>
          </p>

          <h2><T>5. Cookies</T></h2>
          <p>
            <T>We use cookies and similar technologies to collect information about your browsing activities and to personalize your experience on our platform.</T>
          </p>

          <h2><T>6. Your Rights</T></h2>
          <p>
            <T>You have the right to access, update, or delete your personal information at any time through your account settings.</T>
          </p>

          <h2><T>7. Changes to This Policy</T></h2>
          <p>
            <T>We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.</T>
          </p>

          <h2><T>8. Contact Us</T></h2>
          <p>
            <T>If you have any questions about this Privacy Policy, please contact us.</T>
          </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
