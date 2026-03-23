"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Check, ChevronDown, Clock, MoreVertical, Pencil } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCompleteReminder,
  useDismissReminder,
  useSnoozeReminder,
} from "@/hooks/api/useReminders";
import type { Reminder, ReminderUrgency } from "@/lib/api/reminders";
import { formatRelativeDueDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function getUrgencyClass(urgency: ReminderUrgency): string {
  switch (urgency) {
    case "high":
      return "bg-destructive";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
  }
}

interface ReminderItemMenuProps {
  reminderId: string;
  onEdit?: () => void;
}

function ReminderItemMenu({ reminderId, onEdit }: ReminderItemMenuProps) {
  const complete = useCompleteReminder();
  const snooze = useSnoozeReminder();
  const dismiss = useDismissReminder();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label="More actions"
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => complete.mutate(reminderId)}
          disabled={complete.isPending}
        >
          <Check className="mr-2 h-4 w-4" />
          Mark complete
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => snooze.mutate({ id: reminderId, snoozeDays: 1 })}
          disabled={snooze.isPending}
        >
          <Clock className="mr-2 h-4 w-4" />
          Snooze 1 day
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => dismiss.mutate(reminderId)}
          disabled={dismiss.isPending}
        >
          <Clock className="mr-2 h-4 w-4" />
          Dismiss
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ReminderItemProps {
  reminder: Reminder;
  onEdit?: (reminder: Reminder) => void;
}

function ReminderItem({ reminder, onEdit }: ReminderItemProps) {
  const { attributes } = reminder;
  const dueDateLabel = formatRelativeDueDate(attributes.dueDate);
  const isOverdue = dueDateLabel === "Overdue";

  return (
    <AccordionItem
      value={String(reminder.id)}
      className="mb-2 rounded-lg border border-border px-0 last:mb-0"
    >
      {/* Use asChild so the header renders as a div (not h3), giving us a flat flex row */}
      <AccordionPrimitive.Header asChild>
        <div className="flex items-center pr-2">
          <AccordionPrimitive.Trigger
            className={cn(
              "flex flex-1 items-center gap-3 px-4 min-h-[56px] text-left font-medium transition-all",
              "hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "[&[data-state=open]>svg:last-child]:rotate-180",
            )}
          >
            {/* Urgency dot */}
            <span
              title={`${attributes.urgency} urgency`}
              className={cn(
                "h-2.5 w-2.5 flex-shrink-0 rounded-full",
                getUrgencyClass(attributes.urgency),
              )}
            />

            {/* Title & pet */}
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-semibold",
                  attributes.status === "completed"
                    ? "text-muted-foreground line-through"
                    : "text-foreground",
                )}
              >
                {attributes.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {attributes.petName ?? "Household"}
              </p>
            </div>

            {/* Due date badge */}
            <Badge
              variant={isOverdue ? "destructive" : "outline"}
              className="flex-shrink-0 text-xs"
            >
              {dueDateLabel}
            </Badge>

            {attributes.status === "completed" && (
              <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
            )}

            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </AccordionPrimitive.Trigger>

          <ReminderItemMenu
            reminderId={reminder.id}
            onEdit={onEdit ? () => onEdit(reminder) : undefined}
          />
        </div>
      </AccordionPrimitive.Header>

      <AccordionContent className="px-4 pb-3">
        <div className="flex flex-col gap-1">
          {attributes.description && (
            <p className="text-sm text-muted-foreground">
              {attributes.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            <span className="text-xs text-muted-foreground/70">
              Type: {attributes.type?.replaceAll("_", " ")}
            </span>
            <span className="text-xs text-muted-foreground/70">
              Due:{" "}
              {new Date(attributes.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {attributes.isRecurring && attributes.recurrenceDays && (
              <span className="text-xs text-muted-foreground/70">
                Repeats every {attributes.recurrenceDays} day
                {attributes.recurrenceDays === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

const ReminderListSkeleton = () => {
  return (
    <div>
      {Array.from({ length: 4 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
        <Skeleton key={i} className="mb-2 h-14 rounded-lg" />
      ))}
    </div>
  );
};

interface ReminderListProps {
  reminders: Reminder[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onAddClick?: () => void;
  onEdit?: (reminder: Reminder) => void;
}

export const ReminderList = ({
  reminders,
  isLoading = false,
  emptyTitle = "No reminders",
  emptyDescription = "Add a reminder to keep track of important pet care tasks.",
  onAddClick,
  onEdit,
}: ReminderListProps) => {
  if (isLoading) {
    return <ReminderListSkeleton />;
  }

  if (reminders.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={<Clock />}
        action={
          onAddClick
            ? { label: "Add reminder", onClick: onAddClick }
            : undefined
        }
      />
    );
  }

  return (
    <Accordion type="multiple" className="w-full">
      {reminders.map((reminder) => (
        <ReminderItem key={reminder.id} reminder={reminder} onEdit={onEdit} />
      ))}
    </Accordion>
  );
};
