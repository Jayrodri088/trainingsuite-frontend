"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { T, useT } from "@/components/t";
import { getErrorMessage } from "@/lib/utils";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const { t } = useT();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("error");
      setMessage(t("This verification link is invalid or incomplete."));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await authApi.verifyEmail(token);
        if (cancelled) return;
        setState("success");
        setMessage(res.message || t("Email verified successfully."));
      } catch (err: unknown) {
        if (cancelled) return;
        setState("error");
        setMessage(getErrorMessage(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, t]);

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#0052CC]" aria-hidden />
        <p className="font-sans text-sm text-gray-600">
          <T>Verifying your email…</T>
        </p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="font-sans text-2xl font-bold text-black">
            <T>Email verified</T>
          </h1>
          <p className="text-sm text-gray-600">{message}</p>
          <p className="text-xs text-gray-500">
            <T>If you are signed in elsewhere, sign out and sign in again so your account shows as verified.</T>
          </p>
        </div>
        <Button className="w-full rounded-lg bg-[#0052CC] font-bold text-white hover:bg-[#003d99]" asChild>
          <Link href="/login">
            <T>Continue to sign in</T>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-8 w-8 text-red-600" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="font-sans text-2xl font-bold text-black">
          <T>Verification failed</T>
        </h1>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
      <Button variant="outline" className="w-full rounded-lg border-gray-200" asChild>
        <Link href="/login">
          <T>Back to sign in</T>
        </Link>
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-[#0052CC]" aria-hidden />
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
