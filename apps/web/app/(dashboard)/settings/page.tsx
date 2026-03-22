"use client";

import { Suspense } from "react";
import { SettingsPageContent } from "@/components/settings/SettingsPageContent";

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPageContent />
    </Suspense>
  );
}
