"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  CreditCard,
  Lock,
  Shield,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Clock,
  Users,
  Star,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCourse, useAuth } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import { paymentsApi } from "@/lib/api/payments";
import { formatCurrency } from "@/lib/utils";
import type { Course, Module, Lesson } from "@/types";

function CheckoutSkeleton() {
  return (
    <div className="container max-w-5xl py-8">
      <Skeleton className="h-8 w-48 mb-8" />
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paystack">("stripe");

  const { data: courseResponse, isLoading: courseLoading } = useCourse(resolvedParams.slug);

  const initializePaymentMutation = useMutation({
    mutationFn: (data: { courseId: string; provider: "stripe" | "paystack" }) =>
      paymentsApi.initialize(data),
    onSuccess: (response) => {
      if (response?.data?.paymentUrl) {
        // Redirect to payment provider
        window.location.href = response.data.paymentUrl;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment failed",
        description: error?.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.push(`/login?redirect=/courses/${resolvedParams.slug}/checkout`);
    return null;
  }

  if (courseLoading || authLoading) {
    return <CheckoutSkeleton />;
  }

  const course = courseResponse?.data as Course | undefined;

  if (!course) {
    return (
      <div className="container max-w-5xl py-16 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <p className="text-muted-foreground mt-2">
          The course you're looking for doesn't exist.
        </p>
        <Button className="mt-6" onClick={() => router.push("/courses")}>
          Back to Courses
        </Button>
      </div>
    );
  }

  // If the course is free, redirect to course page
  if (course.isFree) {
    router.push(`/courses/${course.slug}`);
    return null;
  }

  const handlePayment = () => {
    initializePaymentMutation.mutate({
      courseId: course._id,
      provider: paymentMethod,
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-5xl py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => router.push(`/courses/${course.slug}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>

        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Payment Method */}
          <div className="lg:col-span-3 space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "stripe" | "paystack")}
                  className="space-y-4"
                >
                  {/* Stripe Option */}
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-sm text-muted-foreground">
                            Pay securely with Stripe
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">
                            VISA
                          </div>
                          <div className="h-6 w-10 bg-gradient-to-r from-red-500 to-orange-500 rounded text-white text-xs flex items-center justify-center">
                            MC
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* Paystack Option */}
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="paystack" id="paystack" />
                    <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Paystack</p>
                          <p className="text-sm text-muted-foreground">
                            Pay with local payment methods
                          </p>
                        </div>
                        <div className="h-8 w-20 bg-teal-500 rounded flex items-center justify-center text-white text-xs font-bold">
                          Paystack
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Secure Payment</h3>
                    <p className="text-sm text-muted-foreground">
                      Your payment information is encrypted and secure. We never store
                      your card details on our servers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Get */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What you'll get</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Full lifetime access</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Access on mobile and desktop</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Certificate of completion</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Downloadable resources</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">30-day money-back guarantee</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-2">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Course Preview */}
                <div className="flex gap-4">
                  <div className="w-24 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">{course.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {course.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs">{course.rating.toFixed(1)}</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {course.enrollmentCount || 0} students
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration || 0} hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.level || "All levels"}</span>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Course price</span>
                    <span>
                      {course.originalPrice && course.originalPrice > course.price ? (
                        <span className="line-through text-muted-foreground mr-2">
                          {formatCurrency(course.originalPrice, course.currency)}
                        </span>
                      ) : null}
                      {formatCurrency(course.price, course.currency)}
                    </span>
                  </div>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-600">
                        -{formatCurrency(course.originalPrice - course.price, course.currency)}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold">
                    {formatCurrency(course.price, course.currency)}
                  </span>
                </div>

                {/* Pay Button */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePayment}
                  disabled={initializePaymentMutation.isPending}
                >
                  {initializePaymentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Complete Payment
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By completing your purchase, you agree to our{" "}
                  <a href="/terms" className="underline">
                    Terms of Service
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
