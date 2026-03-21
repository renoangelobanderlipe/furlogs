"use client";

import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { use, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { VisitCardSkeleton } from "@/components/vet-visits/VisitCardSkeleton";
import { VisitDetailPanel } from "@/components/vet-visits/VisitDetailPanel";
import { VisitForm } from "@/components/vet-visits/VisitForm";
import {
  useAddVetVisitAttachment,
  useDeleteVetVisit,
  useRemoveVetVisitAttachment,
  useUpdateVetVisit,
  useVetVisit,
} from "@/hooks/api/useVetVisits";
import type { VetVisitUpdatePayload } from "@/lib/api/vet-visits";
import type { VetVisitFormValues } from "@/lib/validation/vet-visit.schema";

interface PageProps {
  params: Promise<{ visitId: string }>;
}

export default function VetVisitDetailPage({ params }: PageProps) {
  const { visitId } = use(params);
  const id = visitId;
  const router = useRouter();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: visit, isLoading, isError } = useVetVisit(id);
  const deleteVisit = useDeleteVetVisit();
  const updateVisit = useUpdateVetVisit();
  const addAttachment = useAddVetVisitAttachment();
  const removeAttachment = useRemoveVetVisitAttachment();

  const handleEditSubmit = (values: VetVisitFormValues, _files: File[]) => {
    const payload: VetVisitUpdatePayload = {
      pet_id: values.petId,
      visit_type: values.visitType,
      visit_date: values.visitDate,
      reason: values.reason,
      vet_name: values.vetName || undefined,
      clinic_id: values.clinicId,
      diagnosis: values.diagnosis || undefined,
      treatment: values.treatment || undefined,
      notes: values.notes || undefined,
      cost: values.cost,
      weight_at_visit: values.weightAtVisit,
      follow_up_date: values.followUpDate || undefined,
    };

    updateVisit.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <VisitCardSkeleton />
        </div>
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      </div>
    );
  }

  if (isError || !visit) {
    return (
      <EmptyState
        title="Visit not found"
        description="This vet visit may have been deleted or does not exist."
        action={{
          label: "Back to vet visits",
          onClick: () => router.push("/vet-visits"),
        }}
      />
    );
  }

  return (
    <div>
      {/* Hidden file input for attachment upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) addAttachment.mutate({ id, file });
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
      />

      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <NextLink
          href="/vet-visits"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Vet Visits
        </NextLink>
        <span className="text-muted-foreground">/</span>
        {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: breadcrumb label on span is intentional */}
        <span
          className="max-w-[280px] truncate text-foreground"
          aria-label="breadcrumb"
        >
          {visit.attributes.reason}
        </span>
      </div>

      {/* Detail panel rendered inline (not in a drawer) on the detail page */}
      <div className="max-w-2xl overflow-hidden rounded-2xl border border-border">
        <VisitDetailPanel
          visit={visit}
          onClose={() => router.push("/vet-visits")}
          onEdit={() => setIsEditDialogOpen(true)}
          onDelete={() => {
            deleteVisit.mutate(id, {
              onSuccess: () => router.push("/vet-visits"),
            });
          }}
          onAddAttachment={() => {
            fileInputRef.current?.click();
          }}
          onRemoveAttachment={(mediaId) => {
            removeAttachment.mutate({ visitId: id, mediaId });
          }}
          isDeleting={deleteVisit.isPending}
        />
      </div>

      {/* Edit visit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit vet visit</DialogTitle>
          </DialogHeader>
          <VisitForm
            key={visit.id}
            onSuccess={handleEditSubmit}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={updateVisit.isPending}
            isEditMode
            initialValues={{
              petId: visit.attributes.petId,
              visitType: visit.attributes.visitType,
              visitDate: visit.attributes.visitDate,
              reason: visit.attributes.reason,
              vetName: visit.attributes.vetName ?? "",
              diagnosis: visit.attributes.diagnosis ?? "",
              treatment: visit.attributes.treatment ?? "",
              notes: visit.attributes.notes ?? "",
              cost: visit.attributes.cost
                ? Number.parseFloat(visit.attributes.cost)
                : undefined,
              followUpDate: visit.attributes.followUpDate ?? "",
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
