"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Check, X, AlertCircle, Award, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
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
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { adminApi, authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AxiosError } from "axios";
import { T, useT } from "@/components/t";
import { useQuery } from "@tanstack/react-query";

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
  const [customNetwork, setCustomNetwork] = useState("");
  const { data: configData } = useQuery({
    queryKey: ["site-config"],
    queryFn: adminApi.getConfig,
  });
  const networks = (configData?.data?.networks || []).filter(Boolean);

  const passwordRequirements = [
    { id: "length", label: t("At least 8 characters"), test: (p: string) => p.length >= 8 },
    { id: "uppercase", label: t("One uppercase letter"), test: (p: string) => /[A-Z]/.test(p) },
    { id: "lowercase", label: t("One lowercase letter"), test: (p: string) => /[a-z]/.test(p) },
    { id: "number", label: t("One number"), test: (p: string) => /[0-9]/.test(p) },
  ];

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: undefined,
      email: "",
      phone: "",
      network: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");
  const selectedNetwork = form.watch("network");

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);

    if (!acceptTerms) {
      toast.error(t("Please accept the terms and conditions"));
      return;
    }

    const resolvedNetwork = data.network === "__other__" ? customNetwork.trim() : data.network;
    if (!resolvedNetwork) {
      form.setError("network", { message: t("Please specify your network or designation") });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register({
        name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        email: data.email,
        phone: data.phone,
        network: resolvedNetwork,
        gender: data.gender,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        toast.success(
          response.message ||
            t(
              "Welcome! Your account has been created. You can browse courses now, and complete the one-time verification when you are ready to access training."
            )
        );
        router.push("/complete-access?new=1");
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;

        if (errorData.errors) {
          const fieldErrors = errorData.errors;

          Object.entries(fieldErrors).forEach(([field, messages]) => {
            // Backend validates the combined `name`; surface it on first name.
            const target = field === "name" ? "firstName" : field;
            if (target === "firstName" || target === "gender" || target === "email" || target === "phone" || target === "network" || target === "password" || target === "confirmPassword") {
              form.setError(target as keyof RegisterFormData, {
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel><T>First Name</T></FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("John")}
                      autoComplete="given-name"
                      disabled={isLoading}
                      className="rounded-lg h-11 border-gray-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel><T>Last Name</T></FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Doe")}
                      autoComplete="family-name"
                      disabled={isLoading}
                      className="rounded-lg h-11 border-gray-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel><T>Gender</T></FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-lg h-11 border-gray-200 w-full">
                      <SelectValue placeholder={t("Select your gender")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">{t("Male")}</SelectItem>
                    <SelectItem value="female">{t("Female")}</SelectItem>
                  </SelectContent>
                </Select>
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
                    className="rounded-lg h-11 border-gray-200"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel><T>Phone Number</T></FormLabel>
                <FormControl>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="NG"
                    inputComponent={Input}
                    placeholder={t("Phone number")}
                    autoComplete="tel"
                    disabled={isLoading}
                    className="phone-field flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-transparent pl-3 shadow-xs focus-within:border-[#0052CC] focus-within:ring-2 focus-within:ring-[#0052CC]/20"
                    value={field.value || undefined}
                    onChange={(v) => field.onChange(v ?? "")}
                    onBlur={field.onBlur}
                    name={field.name}
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
                    <SelectTrigger className="rounded-lg h-11 border-gray-200 w-full">
                      <SelectValue placeholder={t("Select your network")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network} value={network}>
                        {network}
                      </SelectItem>
                    ))}
                    <SelectItem value="__other__"><T>Other / Not listed</T></SelectItem>
                  </SelectContent>
                </Select>
                {field.value.toLowerCase() === "global" && (
                  <p className="text-xs leading-5 text-gray-500">
                    <T>Global is for participants serving across multiple regions or without a specific regional network.</T>
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          {selectedNetwork === "__other__" && (
            <div className="space-y-2">
              <FormLabel htmlFor="custom-network"><T>Your network or designation</T></FormLabel>
              <Input
                id="custom-network"
                value={customNetwork}
                onChange={(event) => setCustomNetwork(event.target.value)}
                placeholder={t("Enter your network, ministry, or designation")}
                className="rounded-lg h-11 border-gray-200"
                disabled={isLoading}
              />
            </div>
          )}
          {networks.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{t("No listed networks are available. Choose Other and enter your network or designation.")}</AlertDescription>
            </Alert>
          )}

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
                      className="rounded-lg h-11 pr-10 border-gray-200"
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
                      className="rounded-lg h-11 pr-10 border-gray-200"
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

          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-900"><T>Your one-time $1 access includes</T></p>
            <div className="grid gap-2 text-xs leading-5 text-slate-600 sm:grid-cols-3">
              <span className="flex items-start gap-2"><Users className="mt-0.5 h-4 w-4 shrink-0 text-[#0052CC]" /><T>Training and mentorship</T></span>
              <span className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#0052CC]" /><T>Spiritual development</T></span>
              <span className="flex items-start gap-2"><Award className="mt-0.5 h-4 w-4 shrink-0 text-[#0052CC]" /><T>Badges and certification</T></span>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 rounded-lg bg-[#0052CC] hover:bg-[#0052CC]/90 text-white font-bold" disabled={isLoading || !acceptTerms}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <T>Create account and continue</T>
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
