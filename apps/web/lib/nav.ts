import {
  Bell,
  CalendarDays,
  DollarSign,
  LayoutDashboard,
  Package,
  PawPrint,
  Pill,
  Settings,
  Stethoscope,
  Syringe,
  Weight,
} from "lucide-react";

export const mainNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "My Pets", icon: PawPrint, path: "/pets" },
  { label: "Vet Visits", icon: Stethoscope, path: "/vet-visits" },
  { label: "Vaccinations", icon: Syringe, path: "/vaccinations" },
  { label: "Medications", icon: Pill, path: "/medications" },
  { label: "Food Stock", icon: Package, path: "/stock" },
  { label: "Reminders", icon: Bell, path: "/reminders" },
] as const;

export const insightsNav = [
  { label: "Spending", icon: DollarSign, path: "/spending" },
  { label: "Weight History", icon: Weight, path: "/weight-history" },
  { label: "Calendar", icon: CalendarDays, path: "/calendar" },
] as const;

export const accountNav = [
  { label: "Settings", icon: Settings, path: "/settings" },
] as const;
