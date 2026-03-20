"use client";

import { ChevronLeft, ChevronRight, PawPrint } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { accountNav, insightsNav, mainNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

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
        "hidden md:flex flex-col border-r rtl:border-r-0 rtl:border-l border-sidebar-border bg-sidebar shrink-0 transition-[width] duration-200 ease-out h-screen sticky top-0",
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

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 rtl:right-auto rtl:-left-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm hover:text-foreground transition-colors"
      >
        <span className="rtl:[transform:scaleX(-1)] inline-flex">
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </span>
      </button>
    </aside>
  );
}
