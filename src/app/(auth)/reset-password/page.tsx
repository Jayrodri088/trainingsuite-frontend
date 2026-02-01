"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Check, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { cn, getErrorMessage } from "@/lib/utils";
import { T, useT } from "@/components/t";

const passwordRequirements = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { t } = useT();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  async function onSubmit(data: ResetPasswordFormData) {
    if (!token) {
      toast.error(t("Invalid reset link"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.resetPassword({
        token,
        password: data.password,
      });
      if (response.success) {
        setIsSuccess(true);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-black"><T>Invalid reset link</T></h1>
          <p className="font-sans text-gray-600">
            <T>This password reset link is invalid or has expired.</T>
          </p>
        </div>

        <Button asChild className="w-full h-11 rounded-[10px] bg-[#0052CC] hover:bg-[#003d99] text-white font-bold">
          <Link href="/forgot-password"><T>Request a new link</T></Link>
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-black"><T>Password reset successful</T></h1>
          <p className="font-sans text-gray-600">
            <T>Your password has been reset successfully. You can now sign in with your new password.</T>
          </p>
        </div>

        <Button asChild className="w-full h-11 rounded-[10px] bg-[#0052CC] hover:bg-[#003d99] text-white font-bold">
          <Link href="/login"><T>Sign in</T></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-black"><T>Set new password</T></h1>
        <p className="font-sans text-gray-600">
          <T>Your new password must be different from previously used passwords.</T>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-sans text-gray-600"><T>New Password</T></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("Enter your new password")}
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="rounded-[10px] h-11 pr-10 border-gray-200"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                {password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req) => {
                      const passed = req.test(password);
                      return (
                        <div
                          key={req.id}
                          className={cn(
                            "flex items-center gap-2 text-xs",
                            passed ? "text-green-600" : "text-gray-600"
                          )}
                        >
                          {passed ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          {t(req.label)}
                        </div>
                      );
                    })}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-sans text-gray-600"><T>Confirm New Password</T></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("Confirm your new password")}
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="rounded-[10px] h-11 pr-10 border-gray-200"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-11 rounded-[10px] bg-[#0052CC] hover:bg-[#003d99] text-white font-bold" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <T>Reset password</T>
          </Button>
        </form>
      </Form>

      <Button asChild variant="ghost" className="w-full rounded-[10px] text-gray-600 hover:text-[#0052CC] font-semibold">
        <Link href="/login"><T>Back to login</T></Link>
      </Button>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
