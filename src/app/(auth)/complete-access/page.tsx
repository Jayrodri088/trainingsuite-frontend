"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { paymentsApi } from "@/lib/api";
import { useAuth } from "@/hooks";
import { T, useT } from "@/components/t";

function CompleteAccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useT();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelled = searchParams.get("cancelled") === "1";

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated) {
      router.replace("/login?redirect=/complete-access");
      return;
    }
    if (auth.user?.portalAccessPaidAt) {
      router.replace("/dashboard");
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user?.portalAccessPaidAt, router]);

  if (auth.isLoading || !auth.isAuthenticated || auth.user?.portalAccessPaidAt) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-[#0052CC]" aria-hidden />
      </div>
    );
  }

  async function handlePay() {
    setShowPaymentModal(false);
    setError(null);
    setIsLoading(true);
    try {
      const res = await paymentsApi.initializePortalAccess();
      const data = res?.data;
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setError(t("Could not start checkout. Please try again."));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err instanceof Error ? err.message : t("Something went wrong"));
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0052CC]/10">
          <ShieldCheck className="h-7 w-7 text-[#0052CC]" />
        </div>
        <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-black">
          <T>Complete your access</T>
        </h1>
        <p className="text-gray-600 text-sm">
          <T>
            To access the training portal, you will need to complete a one-time $1 identity verification. This helps us confirm that each account belongs to a real person and keeps the platform secure for all ministers.
          </T>
        </p>
      </div>

      {cancelled && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <T>Checkout was cancelled. You can try again when you&apos;re ready.</T>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <Button
          type="button"
          className="w-full h-11 rounded-lg bg-[#0052CC] hover:bg-[#003d99] text-white font-bold"
          onClick={() => setShowPaymentModal(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <T>Preparing checkout...</T>
            </>
          ) : (
            <T>Pay $1 to continue</T>
          )}
        </Button>
        <p className="text-center text-xs text-gray-500">
          <T>Secure payment via Stripe. You will be redirected to complete your identity verification payment.</T>
        </p>
      </div>

      <AlertDialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <AlertDialogContent className="rounded-xl border-gray-200 bg-white shadow-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans font-bold text-black">
              <T>Why you are being asked to pay $1</T>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left text-sm leading-6 text-gray-600">
                <p>
                  <T>
                    This one-time $1 payment is used to verify your identity and confirm that your account belongs to a real person.
                  </T>
                </p>
                <p>
                  <T>
                    It helps protect the training portal from fake accounts, spam, and misuse, so the platform remains safe and trustworthy for everyone.
                  </T>
                </p>
                <p>
                  <T>
                    After your payment is confirmed, your access will be activated and you will not need to pay this verification fee again.
                  </T>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border-gray-200 bg-white">
              <T>Cancel</T>
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-[#0052CC] text-white hover:bg-[#003d99]"
              onClick={handlePay}
            >
              <T>Continue to secure payment</T>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CompleteAccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-[#0052CC]" aria-hidden />
        </div>
      }
    >
      <CompleteAccessInner />
    </Suspense>
  );
}
