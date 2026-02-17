"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams();
  const courseRef = useMemo(() => searchParams.get("course"), [searchParams]);

  return (
    <div className="container max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-6 w-6 text-amber-600" />
            Checkout canceled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your payment was not completed. You can try again when you are ready.
          </p>
          <div className="flex gap-3">
            {courseRef ? (
              <Button asChild>
                <Link href={`/courses/${courseRef}`}>Return to course</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/courses">Browse courses</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
