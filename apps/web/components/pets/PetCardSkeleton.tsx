"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const PetCardSkeleton = () => {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-14 w-14 rounded-full shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-6 w-3/5 mb-2" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-4 w-10 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-10 rounded" />
        <Skeleton className="h-10 rounded" />
        <Skeleton className="h-10 rounded" />
        <Skeleton className="h-10 rounded" />
      </div>
      <Skeleton className="h-8 w-full mt-4 rounded-md" />
    </div>
  );
};
