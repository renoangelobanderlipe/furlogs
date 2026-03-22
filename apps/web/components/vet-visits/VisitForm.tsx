"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { usePets } from "@/hooks/api/usePets";
import { useVetClinics } from "@/hooks/api/useVetClinics";
import { VISIT_TYPE_COLOR } from "@/lib/api/vet-visits";
import { cn } from "@/lib/utils";
import {
  type VetVisitFormValues,
  VISIT_TYPE_OPTIONS,
  vetVisitSchema,
} from "@/lib/validation/vet-visit.schema";

interface AttachmentEntry {
  id: string;
  file: File;
}

interface VisitFormProps {
  onSuccess: (data: VetVisitFormValues, attachments: File[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
  defaultPetId?: string;
  initialValues?: Partial<VetVisitFormValues>;
  isEditMode?: boolean;
}

const STEPS = [
  "Pet & Clinic",
  "Visit Details",
  "Clinical Notes",
  "Attachments",
  "Review",
];

const VISIT_TYPE_BADGE_CLASS: Record<string, string> = {
  info: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  warning:
    "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  success:
    "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20",
  error: "bg-destructive/15 text-destructive border-destructive/20",
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface ReviewRowProps {
  label: string;
  value: string | null | undefined;
}

function ReviewRow({ label, value }: ReviewRowProps) {
  if (!value) return null;
  return (
    <div className="mb-4">
      <p className="mb-0.5 block text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export const VisitForm = ({
  onSuccess,
  onCancel,
  isLoading = false,
  defaultPetId,
  initialValues,
  isEditMode = false,
}: VisitFormProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: petsData } = usePets();
  const pets = petsData?.data ?? [];

  const { data: clinicsData } = useVetClinics();
  const clinics = clinicsData?.data ?? [];

  const form = useForm<VetVisitFormValues>({
    resolver: zodResolver(vetVisitSchema),
    defaultValues: {
      petId: defaultPetId,
      visitType: "checkup" as const,
      visitDate: new Date().toISOString().slice(0, 10),
      reason: "",
      vetName: "",
      diagnosis: "",
      treatment: "",
      notes: "",
      ...initialValues,
    },
  });

  const STEP_FIELDS: (keyof VetVisitFormValues)[][] = [
    ["petId", "vetName"],
    ["visitType", "visitDate", "reason"],
    ["diagnosis", "treatment", "notes"],
    [],
    [],
  ];

  const handleNext = async () => {
    const fields = STEP_FIELDS[activeStep];
    const valid = await form.trigger(fields);
    if (valid) setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachmentFiles((prev) => {
      const entries: AttachmentEntry[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
      }));
      return [...prev, ...entries].slice(0, 5);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachmentFiles((prev) => prev.filter((a) => a.id !== id));
  };

  const onSubmit = (data: VetVisitFormValues) => {
    onSuccess(
      data,
      attachmentFiles.map((a) => a.file),
    );
  };

  const values = form.getValues();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="w-full"
      >
        {/* Stepper */}
        <div className="mb-6 flex items-center justify-between gap-1">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                    i < activeStep
                      ? "bg-primary text-primary-foreground"
                      : i === activeStep
                        ? "border-2 border-primary text-primary"
                        : "border border-border text-muted-foreground",
                  )}
                >
                  {i + 1}
                </div>
                <span className="hidden text-[10px] text-muted-foreground sm:block">
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-px flex-1",
                    i < activeStep ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Pet & Clinic */}
        {activeStep === 0 && (
          <div className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="petId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pet <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a pet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pets.map((pet) => (
                        <SelectItem key={pet.id} value={String(pet.id)}>
                          {pet.attributes.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clinicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic</FormLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) =>
                      field.onChange(v === "none" ? undefined : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a clinic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {clinics.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.attributes.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vetName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Veterinarian name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Optional"
                      aria-label="Veterinarian name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 1: Visit Details */}
        {activeStep === 1 && (
          <div className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="visitType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Visit type <span className="text-destructive">*</span>
                  </FormLabel>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {VISIT_TYPE_OPTIONS.map((opt) => {
                      const isSelected = field.value === opt.value;
                      const color = VISIT_TYPE_COLOR[opt.value];
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            isSelected
                              ? VISIT_TYPE_BADGE_CLASS[color]
                              : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visitDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Visit date <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="date" aria-label="Visit date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason for visit <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      aria-label="Reason for visit"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₱
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="Optional"
                        aria-label="Cost"
                        className="pl-7"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 2: Clinical Notes */}
        {activeStep === 2 && (
          <div className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Optional"
                      aria-label="Diagnosis"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Optional"
                      aria-label="Treatment"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Optional"
                      aria-label="Notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="followUpDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-up date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" aria-label="Follow-up date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Step 3: Attachments */}
        {activeStep === 3 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Attach up to 5 files (PDFs, images). Max 10 MB per file.
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={attachmentFiles.length >= 5}
              className="min-h-[48px] gap-2 self-start"
            >
              <Paperclip className="h-4 w-4" />
              Add attachment ({attachmentFiles.length}/5)
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleAddFile}
              aria-label="Attach files"
            />

            {attachmentFiles.length > 0 && (
              <div className="flex flex-col gap-2">
                {attachmentFiles.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">{a.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(a.file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(a.id)}
                      aria-label={`Remove ${a.file.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {attachmentFiles.length === 0 && (
              <p className="text-sm italic text-muted-foreground">
                No attachments added
              </p>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {activeStep === 4 && (
          <div>
            <h3 className="mb-4 text-sm font-bold">Review your entry</h3>

            {(() => {
              const pet = pets.find((p) => p.id === values.petId);
              const clinic = clinics.find((c) => c.id === values.clinicId);
              const visitTypeLabel =
                VISIT_TYPE_OPTIONS.find((o) => o.value === values.visitType)
                  ?.label ?? values.visitType;
              return (
                <>
                  <ReviewRow label="Pet" value={pet?.attributes.name} />
                  <ReviewRow label="Clinic" value={clinic?.attributes.name} />
                  <ReviewRow label="Veterinarian" value={values.vetName} />
                  <Separator className="my-3" />
                  <ReviewRow label="Visit type" value={visitTypeLabel} />
                  <ReviewRow
                    label="Visit date"
                    value={formatDate(values.visitDate)}
                  />
                  <ReviewRow label="Reason" value={values.reason} />
                  {values.cost !== undefined && (
                    <ReviewRow
                      label="Cost"
                      value={`$${values.cost.toFixed(2)}`}
                    />
                  )}
                  <Separator className="my-3" />
                  <ReviewRow label="Diagnosis" value={values.diagnosis} />
                  <ReviewRow label="Treatment" value={values.treatment} />
                  <ReviewRow label="Notes" value={values.notes} />
                  {values.followUpDate && (
                    <ReviewRow
                      label="Follow-up date"
                      value={formatDate(values.followUpDate)}
                    />
                  )}
                  {attachmentFiles.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <ReviewRow
                        label="Attachments"
                        value={`${attachmentFiles.length} file(s) selected`}
                      />
                    </>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={activeStep === 0 ? onCancel : handleBack}
            className="min-h-[48px] min-w-[100px]"
          >
            {activeStep === 0 ? "Cancel" : "Back"}
          </Button>

          {activeStep < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="min-h-[48px] min-w-[100px]"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="min-h-[48px] min-w-[120px]"
            >
              {isLoading
                ? "Saving\u2026"
                : isEditMode
                  ? "Save changes"
                  : "Submit"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
