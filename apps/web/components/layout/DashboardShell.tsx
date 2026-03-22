"use client";

import type { InternalAxiosRequestConfig } from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PasswordConfirmDialog } from "@/components/auth/PasswordConfirmDialog";
import { MobileNav } from "@/components/layout/MobileNav";
import { SettingsApplier } from "@/components/layout/SettingsApplier";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { PawLoader } from "@/components/ui/PawLoader";
import { PawWatermark } from "@/components/ui/paw-watermark";
import { apiClient } from "@/lib/api/client";
import { useAppSettingsStore } from "@/stores/useAppSettingsStore";
import { useAuthStore } from "@/stores/useAuthStore";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingConfigRef = useRef<InternalAxiosRequestConfig | null>(null);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const layout = useAppSettingsStore((s) => s.layout);
  const navVisible = useAppSettingsStore((s) => s.navVisible);
  const compact = useAppSettingsStore((s) => s.compact);

  // Re-hydrate user from the server on every hard refresh.
  // Zustand is in-memory only — the store resets on page load even if the
  // session cookie is still valid, so we must re-fetch on mount.
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!user) return;
    // Authenticated but email not yet verified — send to verify-email so they
    // are never silently stranded on a blank dashboard.
    if (!user.email_verified_at) {
      router.replace("/verify-email");
      return;
    }
    if (user.current_household_id === null) {
      router.replace("/onboarding");
    }
  }, [user, router]);

  // Listen for 423 "password confirmation required" events emitted by the
  // Axios interceptor. Open the global dialog and store the failed config so
  // it can be retried once the user confirms their password.
  const handlePasswordConfirmRequired = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<{
      config: InternalAxiosRequestConfig;
    }>;
    pendingConfigRef.current = customEvent.detail.config ?? null;
    setConfirmOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener(
      "password-confirm-required",
      handlePasswordConfirmRequired,
    );
    return () => {
      window.removeEventListener(
        "password-confirm-required",
        handlePasswordConfirmRequired,
      );
    };
  }, [handlePasswordConfirmRequired]);

  const handleConfirmed = useCallback(() => {
    setConfirmOpen(false);
    const config = pendingConfigRef.current;
    pendingConfigRef.current = null;
    if (config) {
      apiClient.request(config).catch(() => {});
    }
  }, []);

  const handleClose = useCallback(() => {
    setConfirmOpen(false);
    pendingConfigRef.current = null;
  }, []);

  const isMini = layout === "mini";
  const isHorizontal = layout === "horizontal";
  const sidebarCollapsed = isMini || collapsed;

  // Hold the full UI until we know who the user is. This prevents child pages
  // from firing API calls that would bounce with 401/403 before the session
  // is confirmed, and avoids a blank-content flash before redirect logic runs.
  //
  // We only block when BOTH conditions are true:
  //   isLoading && !user  →  genuine first-load uncertainty
  //
  // If user is already known (e.g. navigated here right after login which
  // already called fetchUser), skip the spinner even though the layout
  // re-fetches on mount — we already know who they are.
  if (isLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PawLoader
          size={160}
          message="Loading FurLog"
          detail="Fetching your pets & household…"
        />
      </div>
    );
  }

  return (
    <>
      <SettingsApplier />
      <div className="flex min-h-screen w-full">
        {navVisible && !isHorizontal && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => !isMini && setCollapsed((c) => !c)}
          />
        )}
        <div className="flex flex-1 flex-col min-w-0">
          <TopBar isHorizontalNav={isHorizontal && navVisible} />
          <main
            className={
              compact
                ? "relative flex-1 overflow-hidden p-3 pb-20 md:p-3 md:pb-3"
                : "relative flex-1 overflow-hidden p-4 pb-20 md:p-6 md:pb-6"
            }
          >
            {/* Paw watermarks — behind all page content */}
            <PawWatermark
              size={260}
              opacity={0.032}
              rotate={-22}
              flip
              strokeWidth={1}
              className="-top-8 -right-8 auth-paw-2"
            />
            <PawWatermark
              size={300}
              opacity={0.028}
              rotate={20}
              strokeWidth={1}
              className="-bottom-10 -left-10 auth-paw-1"
            />
            <PawWatermark
              size={180}
              opacity={0.02}
              strokeWidth={1}
              className="top-1/2 -right-10 auth-paw-3"
              style={{ transform: "translateY(-50%) rotate(8deg) scaleX(-1)" }}
            />
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
      <PasswordConfirmDialog
        open={confirmOpen}
        onClose={handleClose}
        onConfirmed={handleConfirmed}
      />
    </>
  );
}
