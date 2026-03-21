"use client";

import {
  Bell,
  Building2,
  CalendarDays,
  DollarSign,
  LayoutDashboard,
  Menu,
  Package,
  PawPrint,
  Pill,
  Settings,
  Stethoscope,
  Syringe,
  Weight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Pets", icon: PawPrint, path: "/pets" },
  { label: "Vet", icon: Stethoscope, path: "/vet-visits" },
  { label: "Stock", icon: Package, path: "/stock" },
];

const moreLinks = [
  { label: "Vaccinations", icon: Syringe, path: "/vaccinations" },
  { label: "Medications", icon: Pill, path: "/medications" },
  { label: "Vet Clinics", icon: Building2, path: "/vet-clinics" },
  { label: "Reminders", icon: Bell, path: "/reminders" },
  { label: "Spending", icon: DollarSign, path: "/spending" },
  { label: "Weight History", icon: Weight, path: "/weight-history" },
  { label: "Calendar", icon: CalendarDays, path: "/calendar" },
  { label: "Notifications", icon: Bell, path: "/notifications" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active =
            tab.path === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors min-w-[48px] min-h-[48px] justify-center",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium text-muted-foreground min-w-[48px] min-h-[48px] justify-center"
            >
              <Menu className="h-5 w-5" />
              More
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-3 py-4">
              {moreLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg p-3 text-xs font-medium transition-colors hover:bg-accent",
                    pathname.startsWith(link.path) &&
                      "bg-primary/10 text-primary",
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
