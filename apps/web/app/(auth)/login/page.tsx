"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
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
  type LoginFormValues,
  loginSchema,
} from "@/lib/validation/auth.schema";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await authEndpoints.csrfCookie();
      await authEndpoints.login(values);
      await fetchUser();
      toast.success("Welcome back!");
      router.replace("/pets");
    } catch (err: unknown) {
      const data = (
        err as {
          response?: {
            data?: { message?: string; errors?: Record<string, string[]> };
          };
        }
      )?.response?.data;
      const message = data?.errors
        ? Object.values(data.errors).flat()[0]
        : (data?.message ?? "Invalid credentials. Please try again.");
      setServerError(message ?? "Invalid credentials. Please try again.");
    }
  };

  return (
    <Card sx={{ width: "100%", maxWidth: 440 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={0.5}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Sign in to your FurLog account
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
            {...register("email")}
            label="Email address"
            type="email"
            autoComplete="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            inputProps={{ "aria-label": "Email address" }}
          />

          <TextField
            {...register("password")}
            label="Password"
            type="password"
            autoComplete="current-password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            inputProps={{ "aria-label": "Password" }}
          />

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <FormControlLabel
              control={<Checkbox {...register("remember")} size="small" />}
              label={<Typography variant="body2">Remember me</Typography>}
            />
            <Link
              component={NextLink}
              href="/forgot-password"
              variant="body2"
              underline="hover"
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </Box>

        <Typography
          variant="body2"
          textAlign="center"
          mt={3}
          color="text.secondary"
        >
          Don&apos;t have an account?{" "}
          <Link component={NextLink} href="/register" underline="hover">
            Create one
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
}
