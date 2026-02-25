"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { enrollmentsApi } from "@/lib/api/enrollments";
import { paymentsApi } from "@/lib/api/payments";
import { authApi } from "@/lib/api";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const sessionId = useMemo(() => searchParams.get("session_id"), [searchParams]);
  const courseRef = useMemo(() => searchParams.get("course"), [searchParams]);
  const isPortalAccess = searchParams.get("portal") === "1";
  const [isChecking, setIsChecking] = useState(Boolean(courseRef) || isPortalAccess);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Portal access: verify session once (match PHP stripe-success.php), then poll /auth/me until portalAccessPaidAt
  useEffect(() => {
    if (!isPortalAccess || !sessionId) {
      if (isPortalAccess && !sessionId) setVerifyError("Missing session");
      return;
    }

    let verified = false;
    let attempts = 0;
    const maxAttempts = 15;

    const verifyThenPoll = async () => {
      if (!verified) {
        try {
          const verify = await paymentsApi.verifySession(sessionId);
          if (!verify?.data?.paid) {
            setVerifyError("Payment was not completed.");
            setIsChecking(false);
            return;
          }
          verified = true;
        } catch {
          setVerifyError("Could not verify payment.");
          setIsChecking(false);
          return;
        }
      }

      attempts += 1;
      try {
        const res = await authApi.getMe();
        if (res?.data?.portalAccessPaidAt) {
          await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
          setIsChecking(false);
          router.replace("/dashboard");
          return;
        }
      } catch {
        // Keep polling
      }
      if (attempts < maxAttempts) {
        setTimeout(verifyThenPoll, 2000);
      } else {
        setIsChecking(false);
      }
    };

    verifyThenPoll();
  }, [isPortalAccess, sessionId, queryClient, router]);

  // Course enrollment: verify session once (creates enrollment on backend), then poll until enrolled and redirect
  useEffect(() => {
    if (!courseRef || isPortalAccess || !sessionId) {
      if (!isPortalAccess && !courseRef) setIsChecking(false);
      return;
    }

    let verified = false;
    let attempts = 0;
    const maxAttempts = 10;

    const verifyThenPoll = async () => {
      if (!verified) {
        try {
          const verify = await paymentsApi.verifySession(sessionId);
          if (!verify?.data?.paid) {
            setVerifyError("Payment was not completed.");
            setIsChecking(false);
            return;
          }
          verified = true;
        } catch {
          setVerifyError("Could not verify payment.");
          setIsChecking(false);
          return;
        }
      }

      attempts += 1;
      try {
        const response = await enrollmentsApi.checkEnrollment(courseRef);
        if (response?.data?.isEnrolled) {
          setIsEnrolled(true);
          setIsChecking(false);
          router.push(`/courses/${courseRef}/learn`);
          return;
        }
      } catch {
        // Keep polling
      }

      if (attempts >= maxAttempts) {
        setIsChecking(false);
      } else {
        setTimeout(verifyThenPoll, 2000);
      }
    };

    verifyThenPoll();
  }, [courseRef, isPortalAccess, sessionId, router]);

  const checkingMessage = isPortalAccess
    ? "Confirming your access..."
    : "Confirming your enrollment...";

  return (
    <div className="container max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Payment received
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {verifyError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{verifyError}</AlertDescription>
            </Alert>
          )}
          {isChecking ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {checkingMessage}
            </div>
          ) : isEnrolled ? (
            <p className="text-sm text-muted-foreground">
              Enrollment confirmed. Redirecting to your learning page.
            </p>
          ) : isPortalAccess ? (
            <p className="text-sm text-muted-foreground">
              Access confirmed. Redirecting to your dashboard.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Payment completed. Enrollment confirmation may take a few moments.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {verifyError && isPortalAccess && (
              <Button asChild>
                <Link href="/complete-access">Try again</Link>
              </Button>
            )}
            {courseRef && !isPortalAccess && (
              <Button asChild>
                <Link href={`/courses/${courseRef}`}>Back to course</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            {!isPortalAccess && (
              <Button asChild variant="outline">
                <Link href="/my-courses">My courses</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
