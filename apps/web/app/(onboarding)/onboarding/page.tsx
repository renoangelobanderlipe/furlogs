"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { householdEndpoints } from "@/lib/api/households";
import { cn } from "@/lib/utils";
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
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-[520px] rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-bold">Welcome to FurLog</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Let&apos;s get you set up in a couple of steps.
        </p>

        {/* Stepper */}
        <div className="mb-8 flex items-center">
          {STEPS.map((label, index) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                    index <= activeStep
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground",
                  )}
                >
                  {index + 1}
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap text-xs",
                    index <= activeStep
                      ? "text-foreground font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 mb-5 h-px flex-1",
                    index < activeStep ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Create household */}
        {activeStep === 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium">Name your household</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                This is how your home will appear to all members.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="household-name">Household name</Label>
              <Input
                id="household-name"
                placeholder="e.g. The Smiths"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleCreateHousehold();
                  }
                }}
              />
            </div>
            <Button
              size="lg"
              className="w-full"
              disabled={!householdName.trim() || isSubmitting}
              onClick={handleCreateHousehold}
            >
              {isSubmitting ? "Creating..." : "Continue"}
            </Button>
          </div>
        )}

        {/* Step 1: Done */}
        {activeStep === 1 && (
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 text-5xl">🎉</span>
            <h2 className="mb-1 text-lg font-semibold">You&apos;re all set!</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Your household is ready. You can add pets and invite members from
              your dashboard.
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.replace("/dashboard")}
            >
              Go to dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
