"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Something went wrong. Please try again.";
      setServerError(message);
    }
  };

  return (
    <Card sx={{ width: "100%", maxWidth: 440 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={0.5}>
          Forgot your password?
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter your email and we&apos;ll send you a reset link.
        </Typography>

        {sent && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Check your inbox for the password reset link.
          </Alert>
        )}

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        {!sent && (
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            display="flex"
            flexDirection="column"
            gap={2}
          >
            <TextField
              {...register("email")}
              label="Email address"
              type="email"
              autoComplete="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending…" : "Send reset link"}
            </Button>
          </Box>
        )}

        <Typography
          variant="body2"
          textAlign="center"
          mt={3}
          color="text.secondary"
        >
          <Link component={NextLink} href="/login" underline="hover">
            Back to sign in
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
}
