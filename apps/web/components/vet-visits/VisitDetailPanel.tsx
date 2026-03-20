"use client";

import {
  Download,
  FileText,
  Image,
  Paperclip,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Separator } from "@/components/ui/separator";
import {
  type VetVisit,
  VISIT_TYPE_COLOR,
  VISIT_TYPE_LABEL,
} from "@/lib/api/vet-visits";
import { cn } from "@/lib/utils";

interface VisitDetailPanelProps {
  visit: VetVisit;
  onEdit: () => void;
  onDelete: () => void;
  onAddAttachment: () => void;
  onRemoveAttachment?: (mediaId: number) => void;
  onClose: () => void;
  isDeleting?: boolean;
}

const VISIT_TYPE_BADGE_CLASS: Record<string, string> = {
  info: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  warning:
    "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  success:
    "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20",
  error: "bg-destructive/15 text-destructive border-destructive/20",
};

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
    return <FileText className="h-5 w-5 text-destructive" />;
  }
  if (mimeType.startsWith("image/")) {
    return <Image className="h-5 w-5 text-primary" />;
  }
  return <Paperclip className="h-5 w-5 text-muted-foreground" />;
}

interface DetailRowProps {
  label: string;
  value: string | null | undefined;
}

function DetailRow({ label, value }: DetailRowProps) {
  if (!value) return null;
  return (
    <div className="mb-4">
      <p className="mb-0.5 block text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="whitespace-pre-wrap text-sm">{value}</p>
    </div>
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

  const attachments = visit.relationships?.attachments ?? [];

  const formattedCost = cost
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number.parseFloat(cost))
    : null;

  const visitTypeColor = VISIT_TYPE_COLOR[visitType];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Badge
            className={cn("text-xs", VISIT_TYPE_BADGE_CLASS[visitTypeColor])}
          >
            {VISIT_TYPE_LABEL[visitType]}
          </Badge>
          <h2 className="text-sm font-bold">{reason}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <DetailRow label="Visit date" value={formatDate(visitDate)} />
        {vetName && <DetailRow label="Veterinarian" value={vetName} />}
        {formattedCost && <DetailRow label="Cost" value={formattedCost} />}
        {weightAtVisit && (
          <DetailRow label="Weight at visit" value={`${weightAtVisit} kg`} />
        )}
        {followUpDate && (
          <DetailRow label="Follow-up date" value={formatDate(followUpDate)} />
        )}

        {(diagnosis || treatment || notes) && <Separator className="my-4" />}

        <DetailRow label="Diagnosis" value={diagnosis} />
        <DetailRow label="Treatment" value={treatment} />
        <DetailRow label="Notes" value={notes} />

        {/* Attachments */}
        <Separator className="my-4" />
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            Attachments ({attachments.length})
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAddAttachment}
            className="h-8 gap-1.5 text-xs"
          >
            <Upload className="h-3.5 w-3.5" />
            Add file
          </Button>
        </div>

        {attachments.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">No attachments</p>
        ) : (
          <div className="flex flex-col gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
              >
                <AttachmentIcon mimeType={attachment.mimeType} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download ${attachment.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  {onRemoveAttachment && (
                    <button
                      type="button"
                      onClick={() => onRemoveAttachment(attachment.id)}
                      aria-label={`Remove ${attachment.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex gap-2 border-t border-border px-6 py-4">
        <Button
          variant="outline"
          onClick={onEdit}
          className="min-h-[48px] flex-1 gap-2"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="outline"
          onClick={() => setConfirmDeleteOpen(true)}
          className="min-h-[48px] flex-1 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

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
    </div>
  );
}
