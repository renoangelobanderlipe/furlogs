"use client";

import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Package,
  PawPrint,
  Pill,
  Settings,
  Stethoscope,
  Syringe,
  Weight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

const mainNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "My Pets", icon: PawPrint, path: "/pets" },
  { label: "Vet Visits", icon: Stethoscope, path: "/vet-visits" },
  { label: "Vaccinations", icon: Syringe, path: "/vaccinations" },
  { label: "Medications", icon: Pill, path: "/medications" },
  { label: "Food Stock", icon: Package, path: "/stock" },
  { label: "Reminders", icon: Bell, path: "/reminders" },
];

const insightsNav = [
  { label: "Spending", icon: DollarSign, path: "/spending" },
  { label: "Weight History", icon: Weight, path: "/weight-history" },
  { label: "Calendar", icon: CalendarDays, path: "/calendar" },
];

const accountNav = [{ label: "Settings", icon: Settings, path: "/settings" }];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const NavItem = ({
    label,
    icon: Icon,
    path,
  }: {
    label: string;
    icon: React.ElementType;
    path: string;
  }) => {
    const active =
      path === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(path);
    return (
      <Link
        href={path}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          active && "bg-primary/10 text-primary",
          collapsed && "justify-center px-2",
        )}
        title={collapsed ? label : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  const SectionLabel = ({ label }: { label: string }) =>
    !collapsed ? (
      <p className="mb-1 mt-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 first:mt-0">
        {label}
      </p>
    ) : (
      <div className="my-2 mx-3 h-px bg-border" />
    );

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar shrink-0 transition-[width] duration-200 ease-out h-screen sticky top-0",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2 border-b border-sidebar-border px-4 h-14",
          collapsed && "justify-center px-2",
        )}
      >
        <PawPrint className="h-6 w-6 text-primary" />
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight">FurLog</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <SectionLabel label="Main" />
        {mainNav.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
        <SectionLabel label="Insights" />
        {insightsNav.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
        <SectionLabel label="Account" />
        {accountNav.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </nav>

      {/* User section */}
      <div
        className={cn("border-t border-sidebar-border p-2", collapsed && "p-2")}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 ring-2 ring-primary/20">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">
                {user?.name ?? "User"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate leading-tight">
                {user?.email ?? ""}
              </p>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href="/settings"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold ring-2 ring-primary/20 cursor-pointer"
              title={user?.name ?? "User"}
            >
              {initials}
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm hover:text-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}
