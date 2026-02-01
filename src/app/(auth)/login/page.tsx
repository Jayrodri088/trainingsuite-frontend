"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useAuthStore } from "@/stores";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { T, useT } from "@/components/t";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useT();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        toast.success(t("Login successful"));
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-black"><T>Missionary Login</T></h1>
        <p className="text-gray-600 text-sm">
          <T>Enter your ministry credentials to access the portal.</T>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel><T>Email Address</T></FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@rhapsodyofrealities.org"
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel><T>Password</T></FormLabel>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isLoading}
                      className="rounded-[10px] h-11 pr-10 border-gray-200"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-11 w-11 rounded-[10px] hover:bg-transparent text-gray-500 hover:text-gray-900"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? t("Hide password") : t("Show password")}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="rounded-[6px] border-gray-300" />
              <label
                htmlFor="remember"
                className="text-sm font-sans text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-medium"
              >
                <T>Remember me</T>
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-[#0052CC] hover:underline underline-offset-4"
            >
              <T>Forgot password?</T>
            </Link>
          </div>

          <Button type="submit" className="w-full h-11 rounded-[10px] bg-[#0052CC] hover:bg-[#0052CC]/90 text-white font-bold" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <T>Access Portal</T>
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-gray-600 pt-4">
        <T>Not yet registered?</T>{" "}
        <Link href="/register" className="text-[#0052CC] hover:underline font-semibold">
          <T>Apply Here</T>
        </Link>
      </p>
    </div>
  );
}
