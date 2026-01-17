"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  ArrowRight,
  BookOpen,
  Loader2,
  Download,
  Share2,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { paymentsApi } from "@/lib/api/payments";
import { formatCurrency } from "@/lib/utils";
import type { Payment } from "@/types";
import confetti from "canvas-confetti";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [verified, setVerified] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);

  const reference = searchParams.get("reference");
  const sessionId = searchParams.get("session_id");
  const provider = searchParams.get("provider") as "stripe" | "paystack" | null;

  const verifyMutation = useMutation({
    mutationFn: () =>
      paymentsApi.verify({
        provider: provider || (sessionId ? "stripe" : "paystack"),
        reference: reference || undefined,
        sessionId: sessionId || undefined,
      }),
    onSuccess: (response) => {
      setVerified(true);
      setPayment(response?.data || null);
      // Trigger confetti on successful verification
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error?.message || "Failed to verify payment",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if ((reference || sessionId) && !verified) {
      verifyMutation.mutate();
    }
  }, [reference, sessionId]);

  // Show confetti on mount if already verified
  useEffect(() => {
    if (verified) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [verified]);

  const course = payment?.course && typeof payment.course === "object" ? payment.course : null;

  if (verifyMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifyMutation.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Verification Pending</h2>
            <p className="text-muted-foreground mb-6">
              We're having trouble verifying your payment. If you've completed the payment,
              it may take a few moments to process.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => verifyMutation.mutate()}>
                Try Again
              </Button>
              <Button onClick={() => router.push("/my-courses")}>
                Go to My Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12">
      <Card className="w-full max-w-lg mx-4">
        <CardContent className="pt-8 pb-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. You now have access to the course.
            </p>
          </div>

          {/* Order Details */}
          {payment && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono">{payment._id.slice(-8).toUpperCase()}</span>
                </div>
                {course && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Course</span>
                    <span className="font-medium text-right max-w-[200px] truncate">
                      {course.title}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Actions */}
          <div className="space-y-3">
            {course && (
              <Button
                size="lg"
                className="w-full"
                onClick={() => router.push(`/courses/${course.slug}/learn`)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Start Learning
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/my-courses")}
              >
                My Courses
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/payments")}
              >
                Payment History
              </Button>
            </div>
          </div>

          {/* Receipt Notice */}
          <p className="text-xs text-center text-muted-foreground mt-6">
            A receipt has been sent to your email address.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
