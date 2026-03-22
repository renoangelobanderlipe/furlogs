"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const VaccinationCardSkeleton = () => {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-2 flex items-start justify-between">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-4 w-2/5" />
      <Skeleton className="mb-1 h-4 w-4/5" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
};
