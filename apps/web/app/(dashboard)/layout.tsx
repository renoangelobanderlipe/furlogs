"use client";

import type { InternalAxiosRequestConfig } from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PasswordConfirmDialog } from "@/components/auth/PasswordConfirmDialog";
import { MobileNav } from "@/components/layout/MobileNav";
import { SettingsApplier } from "@/components/layout/SettingsApplier";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { apiClient } from "@/lib/api/client";
import { useAppSettingsStore } from "@/stores/useAppSettingsStore";
import { useAuthStore } from "@/stores/useAuthStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingConfigRef = useRef<InternalAxiosRequestConfig | null>(null);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
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
    if (user && user.current_household_id === null) {
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
                ? "flex-1 p-3 pb-20 md:p-3 md:pb-3"
                : "flex-1 p-4 pb-20 md:p-6 md:pb-6"
            }
          >
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
