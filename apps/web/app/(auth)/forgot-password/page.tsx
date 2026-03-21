"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2, PawPrint } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authEndpoints } from "@/lib/api/endpoints";
import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
} from "@/lib/validation/auth.schema";

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      await authEndpoints.csrfCookie();
      await authEndpoints.forgotPassword(values);
      setSent(true);
      toast.success("Password reset link sent!");
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { message?: string } } })
        ?.response;
      setServerError(
        response
          ? (response.data?.message ??
              "Something went wrong. Please try again.")
          : "Unable to reach the server. Please check your connection and try again.",
      );
    }
  };

  return (
    <Card className="w-full max-w-sm animate-fade-in-up">
      <CardContent className="p-6">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <PawPrint className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle className="h-12 w-12 text-success" />
            <p className="text-sm text-muted-foreground text-center">
              Check your inbox for the password reset link.
            </p>
          </div>
        ) : (
          <>
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
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-5 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
