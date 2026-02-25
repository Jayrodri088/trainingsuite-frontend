"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { paymentsApi } from "@/lib/api";
import { useAuth } from "@/hooks";
import { T, useT } from "@/components/t";

export default function CompleteAccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useT();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelled = searchParams.get("cancelled") === "1";

  // If not loaded or not authenticated, redirect to login
  if (!auth.isLoading && !auth.isAuthenticated) {
    router.replace("/login?redirect=/complete-access");
    return null;
  }

  // Admins are not required to pay; send them to admin or dashboard
  if (!auth.isLoading && auth.user?.role === "admin") {
    router.replace("/admin");
    return null;
  }

  // If already has portal access, go to dashboard
  if (!auth.isLoading && auth.user?.portalAccessPaidAt) {
    router.replace("/dashboard");
    return null;
  }

  async function handlePay() {
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
            To access the training portal, complete a one-time $1 identity verification. This helps us keep the platform secure for all ministers.
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
          onClick={handlePay}
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
          <T>Secure payment via Stripe. You will be redirected to complete payment.</T>
        </p>
      </div>
    </div>
  );
}
