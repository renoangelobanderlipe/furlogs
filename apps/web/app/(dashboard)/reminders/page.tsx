"use client";

import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { useState } from "react";
import { ReminderForm } from "@/components/reminders/ReminderForm";
import { ReminderList } from "@/components/reminders/ReminderList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePets } from "@/hooks/api/usePets";
import {
  useCreateReminder,
  useReminders,
  useUpdateReminder,
} from "@/hooks/api/useReminders";
import type { Reminder } from "@/lib/api/reminders";
import type { ReminderFormValues } from "@/lib/validation/reminder.schema";

export default function RemindersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<"pending" | "completed" | "all">(
    "pending",
  );
  const [page, setPage] = useState(1);

  const filters = {
    ...(filter !== "all" && {
      status:
        filter === "pending" ? ("pending" as const) : ("completed" as const),
    }),
    page,
    per_page: 10,
  };

  const { data: remindersData, isLoading } = useReminders(filters);
  const { data: petsData } = usePets();
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();

  const reminders = remindersData?.data ?? [];
  const pets = petsData?.data ?? [];
  const currentPage = remindersData?.meta.current_page ?? 1;
  const lastPage = remindersData?.meta.last_page ?? 1;
  const total = remindersData?.meta.total ?? 0;

  const handleSubmit = (values: ReminderFormValues) => {
    createReminder.mutate(values, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  const handleEditSubmit = (values: ReminderFormValues) => {
    if (!editingReminder) return;
    updateReminder.mutate(
      { id: editingReminder.id, data: values },
      { onSuccess: () => setEditingReminder(null) },
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight">Reminders</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Reminder
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 animate-fade-in-up">
        {(["pending", "completed", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors capitalize ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="animate-fade-in-up space-y-4">
        <ReminderList
          reminders={reminders}
          isLoading={isLoading}
          onAddClick={() => setDialogOpen(true)}
          onEdit={(r) => setEditingReminder(r)}
        />

        {lastPage > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              {total} reminder{total !== 1 ? "s" : ""} &middot; page{" "}
              {currentPage} of {lastPage}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage >= lastPage || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Reminder Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
          </DialogHeader>
          <ReminderForm
            pets={pets}
            isLoading={createReminder.isPending}
            onSuccess={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Reminder Dialog */}
      <Dialog
        open={editingReminder !== null}
        onOpenChange={(open) => {
          if (!open) setEditingReminder(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Reminder</DialogTitle>
          </DialogHeader>
          {editingReminder && (
            <ReminderForm
              key={editingReminder.id}
              pets={pets}
              isLoading={updateReminder.isPending}
              initialValues={{
                petId: editingReminder.attributes.petId ?? null,
                type: editingReminder.attributes.type,
                title: editingReminder.attributes.title,
                description: editingReminder.attributes.description ?? "",
                dueDate: editingReminder.attributes.dueDate,
                isRecurring: editingReminder.attributes.isRecurring,
                recurrenceDays:
                  editingReminder.attributes.recurrenceDays ?? null,
              }}
              onSuccess={handleEditSubmit}
              onCancel={() => setEditingReminder(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
