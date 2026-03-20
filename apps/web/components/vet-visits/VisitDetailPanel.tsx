"use client";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  type VetVisit,
  type VetVisitAttachment,
  VISIT_TYPE_COLOR,
  VISIT_TYPE_LABEL,
} from "@/lib/api/vet-visits";

interface VisitDetailPanelProps {
  visit: VetVisit;
  onEdit: () => void;
  onDelete: () => void;
  onAddAttachment: () => void;
  onRemoveAttachment?: (mediaId: number) => void;
  onClose: () => void;
  isDeleting?: boolean;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === "application/pdf") {
    return <PictureAsPdfIcon color="error" />;
  }
  if (mimeType.startsWith("image/")) {
    return <ImageIcon color="primary" />;
  }
  return <AttachFileIcon color="action" />;
}

interface DetailRowProps {
  label: string;
  value: string | null | undefined;
}

function DetailRow({ label, value }: DetailRowProps) {
  if (!value) return null;
  return (
    <Box mb={2}>
      <Typography
        variant="caption"
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing={0.5}
        display="block"
        mb={0.25}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
        {value}
      </Typography>
    </Box>
  );
}

export function VisitDetailPanel({
  visit,
  onEdit,
  onDelete,
  onAddAttachment,
  onRemoveAttachment,
  onClose,
  isDeleting = false,
}: VisitDetailPanelProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const {
    visitType,
    visitDate,
    reason,
    diagnosis,
    treatment,
    notes,
    cost,
    weightAtVisit,
    followUpDate,
    vetName,
  } = visit.attributes;

  const attachments =
    (visit.relationships?.attachments?.data as
      | VetVisitAttachment[]
      | undefined) ?? [];

  const formattedCost = cost
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number.parseFloat(cost))
    : null;

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={3}
        py={2}
        sx={{ borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Chip
            label={VISIT_TYPE_LABEL[visitType]}
            color={VISIT_TYPE_COLOR[visitType]}
            size="small"
          />
          <Typography variant="subtitle1" fontWeight={700}>
            {reason}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Close panel">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Body */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 3,
          py: 2,
        }}
      >
        <DetailRow label="Visit date" value={formatDate(visitDate)} />
        {vetName && <DetailRow label="Veterinarian" value={vetName} />}
        {formattedCost && <DetailRow label="Cost" value={formattedCost} />}
        {weightAtVisit && (
          <DetailRow label="Weight at visit" value={`${weightAtVisit} kg`} />
        )}
        {followUpDate && (
          <DetailRow label="Follow-up date" value={formatDate(followUpDate)} />
        )}

        {(diagnosis || treatment || notes) && <Divider sx={{ my: 2 }} />}

        <DetailRow label="Diagnosis" value={diagnosis} />
        <DetailRow label="Treatment" value={treatment} />
        <DetailRow label="Notes" value={notes} />

        {/* Attachments */}
        <Divider sx={{ my: 2 }} />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Attachments ({attachments.length})
          </Typography>
          <Button
            size="small"
            startIcon={<UploadFileIcon />}
            onClick={onAddAttachment}
            sx={{ minHeight: 32 }}
          >
            Add file
          </Button>
        </Box>

        {attachments.length === 0 ? (
          <Typography variant="body2" color="text.disabled" fontStyle="italic">
            No attachments
          </Typography>
        ) : (
          <List dense disablePadding>
            {attachments.map((attachment) => (
              <ListItem
                key={attachment.id}
                disablePadding
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 0.75,
                  px: 1,
                }}
                secondaryAction={
                  <Box display="flex" gap={0.5}>
                    <IconButton
                      size="small"
                      component="a"
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Download ${attachment.name}`}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    {onRemoveAttachment && (
                      <IconButton
                        size="small"
                        onClick={() => onRemoveAttachment(attachment.id)}
                        aria-label={`Remove ${attachment.name}`}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                }
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <AttachmentIcon mimeType={attachment.mimeType} />
                </ListItemIcon>
                <ListItemText
                  primary={attachment.name}
                  secondary={formatFileSize(attachment.size)}
                  primaryTypographyProps={{ variant: "body2", noWrap: true }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Footer actions */}
      <Box
        display="flex"
        gap={1}
        px={3}
        py={2}
        sx={{ borderTop: "1px solid", borderColor: "divider" }}
      >
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={onEdit}
          sx={{ flexGrow: 1, minHeight: 48 }}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setConfirmDeleteOpen(true)}
          sx={{ flexGrow: 1, minHeight: 48 }}
        >
          Delete
        </Button>
      </Box>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete vet visit?"
        description="This will permanently delete this vet visit and all its attachments. This action cannot be undone."
        confirmLabel="Delete visit"
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          onDelete();
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
        isLoading={isDeleting}
      />
    </Box>
  );
}
