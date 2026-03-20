"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { usePets } from "@/hooks/api/usePets";
import { VISIT_TYPE_COLOR } from "@/lib/api/vet-visits";
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
  defaultPetId?: number;
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
    <Box mb={1.5}>
      <Typography
        variant="caption"
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing={0.5}
        display="block"
      >
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

export function VisitForm({
  onSuccess,
  onCancel,
  isLoading = false,
  defaultPetId,
  initialValues,
  isEditMode = false,
}: VisitFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: petsData } = usePets();
  const pets = petsData?.data ?? [];

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<VetVisitFormValues>({
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
    const valid = await trigger(fields);
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

  const values = getValues();

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ width: "100%" }}
    >
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 1: Pet & Clinic */}
      {activeStep === 0 && (
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Controller
            name="petId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.petId} required>
                <InputLabel id="pet-label">Pet</InputLabel>
                <Select
                  {...field}
                  value={field.value ?? ""}
                  labelId="pet-label"
                  label="Pet"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                >
                  {pets.map((pet) => (
                    <MenuItem key={pet.id} value={pet.id}>
                      {pet.attributes.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.petId && (
                  <FormHelperText>{errors.petId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <TextField
            {...register("vetName")}
            label="Veterinarian name"
            fullWidth
            placeholder="Optional"
            error={!!errors.vetName}
            helperText={errors.vetName?.message}
            inputProps={{ "aria-label": "Veterinarian name" }}
          />
        </Box>
      )}

      {/* Step 2: Visit Details */}
      {activeStep === 1 && (
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Controller
            name="visitType"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.visitType} required>
                <FormLabel id="visit-type-label">Visit type</FormLabel>
                <RadioGroup
                  {...field}
                  aria-labelledby="visit-type-label"
                  row
                  sx={{ gap: 1, mt: 1, flexWrap: "wrap" }}
                >
                  {VISIT_TYPE_OPTIONS.map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      value={opt.value}
                      control={<Radio size="small" />}
                      label={
                        <Chip
                          label={opt.label}
                          size="small"
                          color={
                            field.value === opt.value
                              ? VISIT_TYPE_COLOR[opt.value]
                              : "default"
                          }
                          variant={
                            field.value === opt.value ? "filled" : "outlined"
                          }
                          sx={{ cursor: "pointer" }}
                        />
                      }
                      sx={{
                        m: 0,
                        "& .MuiRadio-root": { display: "none" },
                      }}
                    />
                  ))}
                </RadioGroup>
                {errors.visitType && (
                  <FormHelperText>{errors.visitType.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <TextField
            {...register("visitDate")}
            label="Visit date"
            type="date"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            error={!!errors.visitDate}
            helperText={errors.visitDate?.message}
            inputProps={{ "aria-label": "Visit date" }}
          />

          <TextField
            {...register("reason")}
            label="Reason for visit"
            fullWidth
            required
            multiline
            rows={3}
            error={!!errors.reason}
            helperText={errors.reason?.message}
            inputProps={{ "aria-label": "Reason for visit" }}
          />

          <Controller
            name="cost"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === "" ? undefined : Number(val));
                }}
                label="Cost"
                type="number"
                fullWidth
                placeholder="Optional"
                error={!!errors.cost}
                helperText={errors.cost?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                inputProps={{
                  "aria-label": "Cost",
                  min: 0,
                  step: 0.01,
                }}
              />
            )}
          />
        </Box>
      )}

      {/* Step 3: Clinical Notes */}
      {activeStep === 2 && (
        <Box display="flex" flexDirection="column" gap={2.5}>
          <TextField
            {...register("diagnosis")}
            label="Diagnosis"
            fullWidth
            multiline
            rows={3}
            placeholder="Optional"
            error={!!errors.diagnosis}
            helperText={errors.diagnosis?.message}
            inputProps={{ "aria-label": "Diagnosis" }}
          />

          <TextField
            {...register("treatment")}
            label="Treatment"
            fullWidth
            multiline
            rows={3}
            placeholder="Optional"
            error={!!errors.treatment}
            helperText={errors.treatment?.message}
            inputProps={{ "aria-label": "Treatment" }}
          />

          <TextField
            {...register("notes")}
            label="Notes"
            fullWidth
            multiline
            rows={3}
            placeholder="Optional"
            error={!!errors.notes}
            helperText={errors.notes?.message}
            inputProps={{ "aria-label": "Notes" }}
          />

          <TextField
            {...register("followUpDate")}
            label="Follow-up date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.followUpDate}
            helperText={errors.followUpDate?.message}
            inputProps={{ "aria-label": "Follow-up date" }}
          />
        </Box>
      )}

      {/* Step 4: Attachments */}
      {activeStep === 3 && (
        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Attach up to 5 files (PDFs, images). Max 10 MB per file.
            </Typography>

            <Button
              variant="outlined"
              startIcon={<AttachFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={attachmentFiles.length >= 5}
              sx={{ minHeight: 48, mb: 2 }}
            >
              Add attachment ({attachmentFiles.length}/5)
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              style={{ display: "none" }}
              onChange={handleAddFile}
              aria-label="Attach files"
            />
          </Box>

          {attachmentFiles.length > 0 && (
            <Box display="flex" flexDirection="column" gap={1}>
              {attachmentFiles.map((a) => (
                <Box
                  key={a.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={1.5}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Box minWidth={0}>
                    <Typography variant="body2" noWrap>
                      {a.file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(a.file.size / (1024 * 1024)).toFixed(1)} MB
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(a.id)}
                    aria-label={`Remove ${a.file.name}`}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          {attachmentFiles.length === 0 && (
            <Typography
              variant="body2"
              color="text.disabled"
              fontStyle="italic"
            >
              No attachments added
            </Typography>
          )}
        </Box>
      )}

      {/* Step 5: Review */}
      {activeStep === 4 && (
        <Box>
          <Typography variant="subtitle2" fontWeight={700} mb={2}>
            Review your entry
          </Typography>

          {(() => {
            const pet = pets.find((p) => p.id === values.petId);
            const visitTypeLabel =
              VISIT_TYPE_OPTIONS.find((o) => o.value === values.visitType)
                ?.label ?? values.visitType;
            return (
              <>
                <ReviewRow label="Pet" value={pet?.attributes.name} />
                <ReviewRow label="Veterinarian" value={values.vetName} />
                <Divider sx={{ my: 1.5 }} />
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
                <Divider sx={{ my: 1.5 }} />
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
                    <Divider sx={{ my: 1.5 }} />
                    <ReviewRow
                      label="Attachments"
                      value={`${attachmentFiles.length} file(s) selected`}
                    />
                  </>
                )}
              </>
            );
          })()}
        </Box>
      )}

      {/* Navigation */}
      <Box display="flex" justifyContent="space-between" mt={3} gap={1}>
        <Button
          variant="outlined"
          onClick={activeStep === 0 ? onCancel : handleBack}
          sx={{ minHeight: 48, minWidth: 100 }}
        >
          {activeStep === 0 ? "Cancel" : "Back"}
        </Button>

        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ minHeight: 48, minWidth: 100 }}
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ minHeight: 48, minWidth: 120 }}
          >
            {isLoading ? "Saving…" : isEditMode ? "Save changes" : "Submit"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
