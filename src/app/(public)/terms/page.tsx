import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground">Last updated: January 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using this training platform, you accept and agree to be bound by the terms
            and provisions of this agreement.
          </p>

          <h2>2. Use of Service</h2>
          <p>
            You agree to use the service only for lawful purposes and in accordance with these Terms.
            You agree not to use the service in any way that could damage, disable, or impair the service.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You are responsible for safeguarding the password that you use to access the service and for
            any activities or actions under your password.
          </p>

          <h2>4. Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality are and will remain the
            exclusive property of the company and its licensors.
          </p>

          <h2>5. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability,
            for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2>6. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. It is your responsibility
            to review these Terms periodically for changes.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
