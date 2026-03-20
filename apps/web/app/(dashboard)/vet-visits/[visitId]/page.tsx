"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { use, useRef, useState } from "react";
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
  const id = Number(visitId);
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
      <Box>
        <Box display="flex" gap={1} mb={3}>
          <VisitCardSkeleton />
        </Box>
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      </Box>
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
    <Box>
      {/* Hidden file input for attachment upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) addAttachment.mutate({ id, file });
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
      />

      {/* Breadcrumbs */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Link
          component={NextLink}
          href="/vet-visits"
          underline="hover"
          color="text.secondary"
          display="flex"
          alignItems="center"
          gap={0.5}
          sx={{ fontSize: 14 }}
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          Vet Visits
        </Link>
        <Typography color="text.disabled">/</Typography>
        <Breadcrumbs aria-label="breadcrumb">
          <Typography
            variant="body2"
            color="text.primary"
            noWrap
            sx={{ maxWidth: 280 }}
          >
            {visit.attributes.reason}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Detail panel rendered inline (not in a drawer) on the detail page */}
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          maxWidth: 640,
        }}
      >
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
      </Box>

      {/* Edit visit dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit vet visit</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
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
    </Box>
  );
}
