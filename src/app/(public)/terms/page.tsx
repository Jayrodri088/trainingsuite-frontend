"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { T } from "@/components/t";

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl"><T>Terms of Service</T></CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground"><T>Last updated: January 2026</T></p>

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
  );
}
