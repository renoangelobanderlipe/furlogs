"use client";

import { Bell, Moon, PawPrint, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HouseholdSwitcher } from "@/components/layout/HouseholdSwitcher";
import { NotificationSidebar } from "@/components/layout/NotificationSidebar";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { SettingsDrawer } from "@/components/layout/SettingsDrawer";
import { useUnreadCount } from "@/hooks/api/useNotifications";
import { usePets } from "@/hooks/api/usePets";
import { SPECIES_EMOJI } from "@/lib/constants";
import { getInitials } from "@/lib/format";
import { accountNav, insightsNav, mainNav } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { useHouseholdStore } from "@/stores/useHouseholdStore";
export const TopBar = ({
  isHorizontalNav = false,
}: {
  isHorizontalNav?: boolean;
}) => {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const initials = user?.name ? getInitials(user.name) : "?";

  const { data: petsData } = usePets();
  const { data: unreadCount } = useUnreadCount();

  const pets = petsData?.data ?? [];
  const unread = unreadCount ?? 0;

  const selectedPetId = useHouseholdStore((s) => s.selectedPetId);
  const selectPet = useHouseholdStore((s) => s.selectPet);
  const clearPetFilter = useHouseholdStore((s) => s.clearPetFilter);

  return (
    <header className="topbar sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
      {/* Mobile: logo + household switcher */}
      <div className="flex md:hidden items-center gap-2">
        <PawPrint className="h-5 w-5 text-primary" />
        <span className="font-bold tracking-tight">FurLog</span>
        <div className="w-px h-4 bg-border mx-0.5" />
        <HouseholdSwitcher />
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

        {/* Notification bell — opens the notification sheet drawer */}
        <NotificationSidebar>
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
        </NotificationSidebar>

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
};
