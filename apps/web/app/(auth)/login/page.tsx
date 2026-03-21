"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Eye, EyeOff, Loader2, PawPrint } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authEndpoints } from "@/lib/api/endpoints";
import {
  type LoginFormValues,
  loginSchema,
} from "@/lib/validation/auth.schema";
import { useAuthStore } from "@/stores/useAuthStore";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerified = searchParams.get("verified") === "1";
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const setTwoFactorPending = useAuthStore((s) => s.setTwoFactorPending);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const remember = watch("remember");

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await authEndpoints.csrfCookie();
      const response = await authEndpoints.login(values);
      if (
        (response.data as { two_factor?: boolean } | null)?.two_factor === true
      ) {
        setTwoFactorPending(true);
        router.replace("/two-factor-challenge");
        return;
      }
      await fetchUser();
      // fetchUser() silently catches errors, so we read state directly.
      // If the user exists but hasn't verified their email, send them there
      // instead of the dashboard so they're not stuck in a broken state.
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        setServerError("Unable to load your account. Please try again.");
        return;
      }
      if (!currentUser.email_verified_at) {
        router.replace("/verify-email");
        return;
      }
      toast.success("Welcome back!");
      router.replace("/pets");
    } catch (err: unknown) {
      const response = (
        err as {
          response?: {
            data?: { message?: string; errors?: Record<string, string[]> };
          };
        }
      )?.response;
      if (!response) {
        // Network error or server unreachable (e.g. CSRF fetch failed)
        setServerError(
          "Unable to reach the server. Please check your connection and try again.",
        );
        return;
      }
      const message = response.data?.errors
        ? Object.values(response.data.errors).flat()[0]
        : (response.data?.message ?? "Invalid credentials. Please try again.");
      setServerError(message ?? "Invalid credentials. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-sm animate-fade-in-up">
      <CardContent className="p-6">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <PawPrint className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your FurLog account
          </p>
        </div>

        {isVerified && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-green-500/10 border border-green-500/30 px-3 py-2.5">
            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-400">
              Email verified! Sign in to continue.
            </p>
          </div>
        )}

        {serverError && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2">
            <p className="text-sm text-destructive">{serverError}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              {...register("email")}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="bg-card"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="bg-card pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setValue("remember", !!checked)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal text-muted-foreground cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
