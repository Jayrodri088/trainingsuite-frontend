"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { enrollmentsApi } from "@/lib/api/enrollments";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseRef = useMemo(() => searchParams.get("course"), [searchParams]);
  const [isChecking, setIsChecking] = useState(Boolean(courseRef));
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (!courseRef) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const runCheck = async () => {
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
        // Keep polling briefly for webhook completion.
      }

      if (attempts >= maxAttempts) {
        setIsChecking(false);
      }
    };

    runCheck();
    const interval = setInterval(runCheck, 3000);
    return () => clearInterval(interval);
  }, [courseRef, router]);

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
          {isChecking ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirming your enrollment...
            </div>
          ) : isEnrolled ? (
            <p className="text-sm text-muted-foreground">
              Enrollment confirmed. Redirecting to your learning page.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Payment completed. Enrollment confirmation may take a few moments.
            </p>
          )}

          <div className="flex gap-3">
            {courseRef && (
              <Button asChild>
                <Link href={`/courses/${courseRef}`}>Back to course</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/my-courses">My courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
