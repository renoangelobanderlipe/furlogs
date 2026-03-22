"use client";

import { Suspense } from "react";
import { PetsContent } from "@/components/pets/PetsContent";

export default function PetsPage() {
  return (
    <Suspense>
      <PetsContent />
    </Suspense>
  );
}
