"use client";

import {
  Bell,
  CheckCheck,
  Moon,
  Package,
  PawPrint,
  Pill,
  Settings,
  Stethoscope,
  Sun,
  Syringe,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { SettingsDrawer } from "@/components/layout/SettingsDrawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/api/useNotifications";
import { usePets } from "@/hooks/api/usePets";
import type { NotificationType } from "@/lib/api/notifications";
import { SPECIES_EMOJI } from "@/lib/constants";
import { getInitials } from "@/lib/format";
import { accountNav, insightsNav, mainNav } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useAppSettingsStore } from "@/stores/useAppSettingsStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHouseholdStore } from "@/stores/useHouseholdStore";

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  vaccination_reminder: {
    icon: Syringe,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Vaccination",
  },
  medication_reminder: {
    icon: Pill,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Medication",
  },
  vet_follow_up: {
    icon: Stethoscope,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    label: "Vet Visit",
  },
  low_stock: {
    icon: Package,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Stock Alert",
  },
  critical_stock: {
    icon: Package,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Critical Stock",
  },
};

export function TopBar({
  isHorizontalNav = false,
}: {
  isHorizontalNav?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const user = useAuthStore((s) => s.user);
  const initials = user?.name ? getInitials(user.name) : "?";

  const { data: petsData } = usePets();
  const { data: unreadCount } = useUnreadCount();
  const { data: notificationsData } = useNotifications(
    { page: 1 },
    { enabled: true },
  );
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const pets = petsData?.data ?? [];
  const allNotifications = notificationsData?.data ?? [];
  const unread = unreadCount ?? 0;
  const filtered =
    tab === "unread"
      ? allNotifications.filter((n) => !n.readAt)
      : allNotifications;

  const selectedPetId = useHouseholdStore((s) => s.selectedPetId);
  const selectPet = useHouseholdStore((s) => s.selectPet);
  const clearPetFilter = useHouseholdStore((s) => s.clearPetFilter);
  const rtl = useAppSettingsStore((s) => s.rtl);

  return (
    <header className="topbar sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
      {/* Mobile logo */}
      <div className="flex md:hidden items-center gap-2">
        <PawPrint className="h-5 w-5 text-primary" />
        <span className="font-bold tracking-tight">FurLog</span>
      </div>

      {isHorizontalNav ? (
        /* Horizontal nav — replaces pet filter pills when layout=horizontal */
        <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
          {/* Logo mark */}
          <div className="flex items-center gap-1.5 me-2 pe-3 border-e border-border">
            <PawPrint className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold tracking-tight">FurLog</span>
          </div>
          {[...mainNav, ...insightsNav, ...accountNav].map(
            ({ label, icon: Icon, path }) => {
              const active =
                path === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  href={path}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </Link>
              );
            },
          )}
        </nav>
      ) : (
        /* Pet filter pills — desktop */
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          <button
            type="button"
            onClick={clearPetFilter}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
              selectedPetId === null
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
            )}
          >
            All Pets
          </button>
          {pets.map((pet) => (
            <button
              type="button"
              key={pet.id}
              onClick={() => selectPet(pet.id, pet.attributes.name)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                selectedPetId === pet.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
              )}
            >
              <span>{SPECIES_EMOJI[pet.attributes.species] ?? "🐾"}</span>
              {pet.attributes.name}
            </button>
          ))}
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </button>

        {/* Notification bell */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 rtl:right-auto rtl:-left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align={rtl ? "start" : "end"}
            className="w-96 p-0 shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllRead.mutate(undefined)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
                <Link
                  href="/settings?tab=notifications"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Notification settings"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
              {(["all", "unread"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    tab === t
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <span className="capitalize">{t}</span>
                  {t === "all" && allNotifications.length > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                        tab === "all"
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {allNotifications.length}
                    </span>
                  )}
                  {t === "unread" && unread > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                        tab === "unread"
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {unread}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {tab === "unread" ? "All caught up!" : "No notifications"}
                  </p>
                </div>
              ) : (
                filtered.map((n) => {
                  const config =
                    TYPE_CONFIG[n.data?.type] ?? TYPE_CONFIG.vet_follow_up;
                  const Icon = config.icon;
                  return (
                    <button
                      type="button"
                      key={n.id}
                      onClick={() => !n.readAt && markRead.mutate(n.id)}
                      className={cn(
                        "w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-accent/50",
                        !n.readAt && "bg-primary/[0.03]",
                      )}
                    >
                      {/* Type icon */}
                      <div
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          config.bg,
                        )}
                      >
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p
                          className={cn(
                            "text-sm leading-snug",
                            !n.readAt ? "font-medium" : "text-muted-foreground",
                          )}
                        >
                          {n.data?.title ?? n.type}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {n.data?.pet_name && (
                            <span className="text-xs text-muted-foreground">
                              {n.data.pet_name}
                            </span>
                          )}
                          {n.data?.pet_name && (
                            <span className="text-xs text-muted-foreground/40">
                              ·
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {config.label}
                          </span>
                          <span className="text-xs text-muted-foreground/40">
                            ·
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {n.createdAt}
                          </span>
                        </div>
                      </div>

                      {/* Unread dot */}
                      {!n.readAt && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border">
              <Link
                href="/notifications"
                className="flex items-center justify-center py-3 text-xs font-medium text-primary hover:text-primary/80 hover:bg-accent/30 transition-colors"
              >
                View all notifications
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        {/* Settings drawer */}
        <SettingsDrawer />

        {/* Profile drawer trigger */}
        <ProfileDrawer>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
            title={user?.name ?? "Profile"}
          >
            {initials}
          </button>
        </ProfileDrawer>
      </div>
    </header>
  );
}
