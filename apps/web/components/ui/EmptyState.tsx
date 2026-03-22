"use client";

import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PawWatermark } from "@/components/ui/paw-watermark";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center text-center py-16 px-6 gap-4">
      {/* Decorative paw background */}
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
        <PawWatermark
          size={64}
          opacity={0.06}
          rotate={20}
          className="top-4  left-8"
        />
        <PawWatermark
          size={48}
          opacity={0.05}
          rotate={-30}
          flip
          className="top-5  right-10"
        />
        <PawWatermark
          size={56}
          opacity={0.05}
          rotate={-15}
          className="bottom-4 left-14"
        />
        <PawWatermark
          size={52}
          opacity={0.06}
          rotate={25}
          flip
          className="bottom-5 right-8"
        />
        <PawWatermark
          size={36}
          opacity={0.04}
          rotate={10}
          className="top-1/2 left-4 -translate-y-1/2"
        />
        <PawWatermark
          size={36}
          opacity={0.04}
          rotate={-10}
          flip
          className="top-1/2 right-4 -translate-y-1/2"
        />
      </div>

      <div className="relative text-muted-foreground/40 [&_svg]:h-14 [&_svg]:w-14">
        {icon ?? <PawPrint />}
      </div>
      <div className="relative">
        <h3 className="text-base font-semibold mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} className="relative mt-1">
          {action.label}
        </Button>
      )}
    </div>
  );
}
