"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { T } from "@/components/t";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-14 sm:py-20">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-gray-200 rounded-[12px] shadow-sm">
            <CardHeader>
              <CardTitle className="font-sans text-2xl md:text-3xl font-bold text-black"><T>Terms of Service</T></CardTitle>
            </CardHeader>
            <CardContent className="font-sans prose prose-sm max-w-none text-gray-600 prose-headings:text-black prose-headings:font-bold">
          <p className="text-gray-500 text-sm"><T>Last updated: January 2026</T></p>

          <h2><T>1. Acceptance of Terms</T></h2>
          <p>
            <T>By accessing and using this training platform, you accept and agree to be bound by the terms and provisions of this agreement.</T>
          </p>

          <h2><T>2. Use of Service</T></h2>
          <p>
            <T>You agree to use the service only for lawful purposes and in accordance with these Terms. You agree not to use the service in any way that could damage, disable, or impair the service.</T>
          </p>

          <h2><T>3. User Accounts</T></h2>
          <p>
            <T>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.</T>
          </p>

          <h2><T>4. Intellectual Property</T></h2>
          <p>
            <T>The service and its original content, features, and functionality are and will remain the exclusive property of the company and its licensors.</T>
          </p>

          <h2><T>5. Termination</T></h2>
          <p>
            <T>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</T>
          </p>

          <h2><T>6. Changes to Terms</T></h2>
          <p>
            <T>We reserve the right to modify or replace these Terms at any time. It is your responsibility to review these Terms periodically for changes.</T>
          </p>

          <h2><T>7. Contact Us</T></h2>
          <p>
            <T>If you have any questions about these Terms, please contact us.</T>
          </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
