"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { toast } from "sonner";
import { authEndpoints } from "@/lib/api/endpoints";

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    setIsSending(true);
    try {
      await authEndpoints.resendVerification();
      setResent(true);
      toast.success("Verification email sent!");
    } catch {
      toast.error("Failed to resend. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card sx={{ width: "100%", maxWidth: 480 }}>
      <CardContent sx={{ p: 4, textAlign: "center" }}>
        <Box fontSize="3rem" mb={2}>
          📬
        </Box>
        <Typography variant="h5" fontWeight={700} mb={1}>
          Verify your email
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          We&apos;ve sent a verification link to your email address. Click the
          link to activate your account before continuing.
        </Typography>

        {resent && (
          <Alert severity="success" sx={{ mb: 2, textAlign: "left" }}>
            A new verification link has been sent to your email.
          </Alert>
        )}

        <Button
          variant="outlined"
          fullWidth
          onClick={handleResend}
          disabled={isSending || resent}
        >
          {isSending ? "Sending…" : "Resend verification email"}
        </Button>
      </CardContent>
    </Card>
  );
}
