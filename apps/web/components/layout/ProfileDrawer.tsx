"use client";

import {
  Bell,
  Home,
  Loader2,
  LogOut,
  PawPrint,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PawWatermark } from "@/components/ui/paw-watermark";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useHousehold } from "@/hooks/api/useHousehold";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

const MEMBER_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-cyan-500",
];

const profileNav = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Profile", icon: PawPrint, path: "/settings?tab=profile" },
  { label: "Household", icon: Users, path: "/household" },
  { label: "Notifications", icon: Bell, path: "/settings?tab=notifications" },
  { label: "Security", icon: Shield, path: "/settings?tab=security" },
  { label: "Account settings", icon: Settings, path: "/settings" },
] as const;

interface ProfileDrawerProps {
  children: React.ReactNode;
}

export const ProfileDrawer = ({ children }: ProfileDrawerProps) => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: household } = useHousehold();

  const initials = user?.name ? getInitials(user.name) : "?";
  const members = household?.members ?? [];

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.replace("/login?expired=true");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        aria-describedby={undefined}
        className="w-72 p-0 flex flex-col bg-card border-l border-border overflow-hidden"
      >
        <SheetTitle className="sr-only">Profile</SheetTitle>
        <PawWatermark
          size={140}
          opacity={0.038}
          rotate={-18}
          flip
          className="-top-8 -right-8 auth-paw-2"
        />
        <PawWatermark
          size={100}
          opacity={0.03}
          rotate={20}
          className="-bottom-6 -left-6 auth-paw-1"
        />
        {/* Avatar + user info */}
        <div className="flex flex-col items-center gap-3 px-6 pt-10 pb-5">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold ring-4 ring-primary/25">
              {initials}
            </div>
            <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-base leading-tight">
              {user?.name ?? "User"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {user?.email ?? ""}
            </p>
          </div>

          {/* Household member avatars */}
          {members.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              {members.slice(0, 4).map((member, i) => (
                <div
                  key={member.id}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold",
                    MEMBER_COLORS[i % MEMBER_COLORS.length],
                  )}
                  title={member.name}
                >
                  {getInitials(member.name)}
                </div>
              ))}
              <Link
                href="/household"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground hover:bg-accent transition-colors"
                title="Manage household"
              >
                <span className="text-sm font-bold leading-none">+</span>
              </Link>
            </div>
          )}
        </div>

        <div className="mx-5 h-px bg-border" />

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {profileNav.map(({ label, icon: Icon, path }) => (
            <Link
              key={label}
              href={path}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted shrink-0">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-3">
          <div className="h-px bg-border mb-3" />
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              "text-destructive hover:bg-destructive/10",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 shrink-0">
              {isLoggingOut ? (
                <Loader2 className="h-3.5 w-3.5 text-destructive animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5 text-destructive" />
              )}
            </span>
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
