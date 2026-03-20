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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authEndpoints } from "@/lib/api/endpoints";
import {
  type RegisterFormValues,
  registerSchema,
} from "@/lib/validation/auth.schema";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await authEndpoints.csrfCookie();
      await authEndpoints.register(values);
      toast.success("Account created! Please verify your email.");
      router.replace("/verify-email");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed. Please try again.";
      setServerError(message);
    }
  };

  return (
    <Card sx={{ width: "100%", maxWidth: 440 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={0.5}>
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Start tracking your pets&apos; care with FurLog
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <TextField
            {...register("name")}
            label="Full name"
            autoComplete="name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            {...register("email")}
            label="Email address"
            type="email"
            autoComplete="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            {...register("password")}
            label="Password"
            type="password"
            autoComplete="new-password"
            fullWidth
            error={!!errors.password}
            helperText={
              errors.password?.message ?? "Min 8 chars, 1 uppercase, 1 number"
            }
          />

          <TextField
            {...register("password_confirmation")}
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            fullWidth
            error={!!errors.password_confirmation}
            helperText={errors.password_confirmation?.message}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </Box>

        <Typography
          variant="body2"
          textAlign="center"
          mt={3}
          color="text.secondary"
        >
          Already have an account?{" "}
          <Link component={NextLink} href="/login" underline="hover">
            Sign in
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
}
