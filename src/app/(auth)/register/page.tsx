"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerSchema, REGISTRATION_NETWORKS, type RegisterFormData } from "@/lib/validations/auth";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AxiosError } from "axios";
import { T, useT } from "@/components/t";

interface ValidationErrors {
  [key: string]: string[];
}

interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: ValidationErrors;
}

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useT();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const passwordRequirements = [
    { id: "length", label: t("At least 8 characters"), test: (p: string) => p.length >= 8 },
    { id: "uppercase", label: t("One uppercase letter"), test: (p: string) => /[A-Z]/.test(p) },
    { id: "lowercase", label: t("One lowercase letter"), test: (p: string) => /[a-z]/.test(p) },
    { id: "number", label: t("One number"), test: (p: string) => /[0-9]/.test(p) },
  ];

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      network: REGISTRATION_NETWORKS[0],
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);

    if (!acceptTerms) {
      toast.error(t("Please accept the terms and conditions"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        network: data.network,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        toast.success(t("Welcome! Your account has been created. Check your email to verify your account."));
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;

        if (errorData.errors) {
          const fieldErrors = errorData.errors;

          Object.entries(fieldErrors).forEach(([field, messages]) => {
            if (field === "name" || field === "email" || field === "network" || field === "password" || field === "confirmPassword") {
              form.setError(field as keyof RegisterFormData, {
                type: "server",
                message: messages.join(". "),
              });
            }
          });

          setServerError(errorData.error || t("Please fix the errors below"));
        } else {
          setServerError(errorData.error || t("Registration failed. Please try again."));
        }
      } else if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError(t("An unexpected error occurred. Please try again."));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-black"><T>Create an account</T></h1>
        <p className="text-gray-600 text-sm">
          <T>Enter your details to get started with your learning journey</T>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel><T>Full Name</T></FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("John Doe")}
                    autoComplete="name"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel><T>Email</T></FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
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
            name="network"
            render={({ field }) => (
              <FormItem>
                <FormLabel><T>Network</T></FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-[10px] h-11 border-gray-200 w-full">
                      <SelectValue placeholder={t("Select your network")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {REGISTRATION_NETWORKS.map((network) => (
                      <SelectItem key={network} value={network}>
                        {network}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel><T>Password</T></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("Create a password")}
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
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
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
                          {req.label}
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
                <FormLabel><T>Confirm Password</T></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("Confirm your password")}
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
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked === true)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-sans text-gray-600 leading-tight"
            >
              <T>I agree to the</T>{" "}
              <Link href="/terms" className="text-[#0052CC] hover:underline font-semibold">
                <T>Terms of Service</T>
              </Link>{" "}
              <T>and</T>{" "}
              <Link href="/privacy" className="text-[#0052CC] hover:underline font-semibold">
                <T>Privacy Policy</T>
              </Link>
            </label>
          </div>

          <Button type="submit" className="w-full h-11 rounded-[10px] bg-[#0052CC] hover:bg-[#0052CC]/90 text-white font-bold" disabled={isLoading || !acceptTerms}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <T>Create account</T>
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm font-sans text-gray-600">
        <T>Already have an account?</T>{" "}
        <Link href="/login" className="text-[#0052CC] hover:underline font-semibold">
          <T>Sign in</T>
        </Link>
      </p>
    </div>
  );
}
