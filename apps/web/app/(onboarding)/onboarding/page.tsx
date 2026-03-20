"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { householdEndpoints } from "@/lib/api/households";
import { useAuthStore } from "@/stores/useAuthStore";

const STEPS = ["Create household", "Done"];

export default function OnboardingPage() {
  const router = useRouter();
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [activeStep, setActiveStep] = useState(0);
  const [householdName, setHouseholdName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await householdEndpoints.create(householdName.trim());
      await fetchUser();
      setActiveStep(1);
      toast.success("Household created!");
    } catch {
      toast.error("Failed to create household. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      minHeight="100dvh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={3}
    >
      <Card sx={{ width: "100%", maxWidth: 520 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} mb={1}>
            Welcome to FurLog 🐾
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Let&apos;s get you set up in a couple of steps.
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="body1" fontWeight={500}>
                Name your household
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This is how your home will appear to all members.
              </Typography>
              <TextField
                label="Household name"
                placeholder="e.g. The Smiths"
                fullWidth
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleCreateHousehold();
                  }
                }}
              />
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!householdName.trim() || isSubmitting}
                onClick={handleCreateHousehold}
              >
                {isSubmitting ? "Creating…" : "Continue"}
              </Button>
            </Box>
          )}

          {activeStep === 1 && (
            <Box textAlign="center">
              <Typography fontSize="3rem" mb={2}>
                🎉
              </Typography>
              <Typography variant="h6" fontWeight={600} mb={1}>
                You&apos;re all set!
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Your household is ready. You can add pets and invite members
                from your dashboard.
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => router.replace("/")}
              >
                Go to dashboard
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
