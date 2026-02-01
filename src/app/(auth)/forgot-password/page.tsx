"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
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
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { T, useT } from "@/components/t";

export default function ForgotPasswordPage() {
  const { t } = useT();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword(data.email);
      if (response.success) {
        setSubmittedEmail(data.email);
        setIsSubmitted(true);
      }
    } catch (error: unknown) {
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#0052CC]/10">
          <Mail className="h-6 w-6 text-[#0052CC]" />
        </div>

        <div className="space-y-2">
          <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-black"><T>Check your email</T></h1>
          <p className="font-sans text-gray-600">
            <T>We've sent a password reset link to</T>{" "}
            <span className="font-semibold text-black">{submittedEmail}</span>
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-sans text-gray-600">
            <T>Didn't receive the email? Check your spam folder or</T>{" "}
            <button
              onClick={() => {
                setIsSubmitted(false);
                form.reset();
              }}
              className="text-[#0052CC] hover:underline font-semibold"
            >
              <T>try another email address</T>
            </button>
          </p>

          <Button asChild variant="outline" className="w-full rounded-[10px] border-gray-200 hover:bg-gray-50 font-semibold">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <T>Back to login</T>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-black"><T>Forgot password?</T></h1>
        <p className="font-sans text-gray-600">
          <T>No worries, we'll send you reset instructions.</T>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-sans text-gray-600"><T>Email</T></FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("Enter your email address")}
                    autoComplete="email"
                    disabled={isLoading}
                    className="rounded-[10px] h-11 border-gray-200"
                    {...field}
                  />
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
        <Link href="/login">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <T>Back to login</T>
        </Link>
      </Button>
    </div>
  );
}
