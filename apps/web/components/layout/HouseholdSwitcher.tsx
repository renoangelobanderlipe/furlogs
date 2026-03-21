"use client";

import { Check, ChevronDown, Home, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useSwitchHousehold,
  useUserHouseholds,
} from "@/hooks/api/useHousehold";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

interface HouseholdSwitcherProps {
  collapsed?: boolean;
}

export function HouseholdSwitcher({
  collapsed = false,
}: HouseholdSwitcherProps) {
  const user = useAuthStore((s) => s.user);
  const { data: households = [], isLoading } = useUserHouseholds();
  const switchHousehold = useSwitchHousehold();

  const active = households.find((h) => h.id === user?.current_household_id);

  const handleSwitch = (householdId: string) => {
    if (householdId === user?.current_household_id) return;
    switchHousehold.mutate(householdId);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground text-left",
            collapsed && "justify-center px-1",
          )}
          title={collapsed ? (active?.name ?? "Household") : undefined}
        >
          <Home className="h-4 w-4 shrink-0 text-muted-foreground" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate font-medium text-xs">
                {isLoading ? "Loading…" : (active?.name ?? "No household")}
              </span>
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-60 p-1 shadow-md">
        <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Your Households
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          households.map((household) => {
            const isActive = household.id === active?.id;
            const isPending =
              switchHousehold.isPending &&
              switchHousehold.variables === household.id;

            return (
              <button
                type="button"
                key={household.id}
                disabled={switchHousehold.isPending}
                onClick={() => handleSwitch(household.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                  switchHousehold.isPending && !isPending && "opacity-50",
                )}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                ) : (
                  <Check
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                )}
                <span className="flex-1 truncate text-left">
                  {household.name}
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    household.role === "owner"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {household.role}
                </span>
              </button>
            );
          })
        )}
      </PopoverContent>
    </Popover>
  );
}
