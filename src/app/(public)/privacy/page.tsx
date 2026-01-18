import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground">Last updated: January 2026</p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account,
            enroll in courses, or contact us for support.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services,
            to process transactions, and to communicate with you.
          </p>

          <h2>3. Information Sharing</h2>
          <p>
            We do not share your personal information with third parties except as described
            in this privacy policy or with your consent.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We take reasonable measures to help protect your personal information from loss,
            theft, misuse, unauthorized access, disclosure, alteration, and destruction.
          </p>

          <h2>5. Cookies</h2>
          <p>
            We use cookies and similar technologies to collect information about your browsing
            activities and to personalize your experience on our platform.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time
            through your account settings.
          </p>

          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes
            by posting the new privacy policy on this page.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
