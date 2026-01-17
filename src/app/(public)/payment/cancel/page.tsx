"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  XCircle,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseSlug = searchParams.get("course");
  const reason = searchParams.get("reason");

  const handleRetry = () => {
    if (courseSlug) {
      router.push(`/courses/${courseSlug}/checkout`);
    } else {
      router.push("/courses");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12">
      <Card className="w-full max-w-lg mx-4">
        <CardContent className="pt-8 pb-8">
          {/* Cancel Icon */}
          <div className="text-center mb-8">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
            <p className="text-muted-foreground">
              {reason === "failed"
                ? "Your payment could not be processed. Please try again."
                : "Your payment was cancelled. No charges were made to your account."}
            </p>
          </div>

          {/* What Happened */}
          {reason === "failed" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">
                Why did my payment fail?
              </h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Insufficient funds in your account</li>
                <li>• Card details entered incorrectly</li>
                <li>• Your bank declined the transaction</li>
                <li>• Connection issues during payment</li>
              </ul>
            </div>
          )}

          <Separator className="my-6" />

          {/* Actions */}
          <div className="space-y-3">
            <Button size="lg" className="w-full" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/courses")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
          </div>

          <Separator className="my-6" />

          {/* FAQ */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Will I be charged for the cancelled payment?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                No, you will not be charged for any cancelled or failed payments.
                If you see a pending charge, it should be automatically reversed
                within 3-5 business days.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Can I use a different payment method?
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Yes! We accept multiple payment methods including credit/debit
                cards via Stripe and local payment methods via Paystack. You can
                select your preferred method at checkout.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Support */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Need help with your payment?
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => router.push("/contact")}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
