"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const VisitCardSkeleton = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-[90%] mb-1" />
      <Skeleton className="h-4 w-[65%] mb-3" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-12" />
      </div>
    </div>
  );
};
