"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  MoreVertical,
  PlusCircle,
  Scale,
  Stethoscope,
  Syringe,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { PetCard } from "@/components/pets/PetCard";
import { PetCardSkeleton } from "@/components/pets/PetCardSkeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePet, usePets, useUploadPetAvatar } from "@/hooks/api/usePets";
import { useVaccinations } from "@/hooks/api/useVaccinations";
import { useVetVisits } from "@/hooks/api/useVetVisits";
import { petEndpoints } from "@/lib/api/pets";
import { VISIT_TYPE_LABEL } from "@/lib/api/vet-visits";
import { SPECIES_EMOJI } from "@/lib/constants";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  type PetFormValues,
  petSchema,
  SEX_OPTIONS,
  SIZE_OPTIONS,
  SPECIES_OPTIONS,
} from "@/lib/validation/pet.schema";

// Icon mapping for visit type colors in recent records
const VISIT_TYPE_BG: Record<string, string> = {
  checkup: "bg-primary/15 text-primary",
  treatment: "bg-amber-500/15 text-amber-400",
  vaccine: "bg-emerald-500/15 text-emerald-400",
  emergency: "bg-red-500/15 text-red-400",
};

const VISIT_TYPE_ICON: Record<string, React.ElementType> = {
  checkup: Stethoscope,
  treatment: Scale,
  vaccine: Syringe,
  emergency: Stethoscope,
};

function NewCompanionCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/60 bg-card/30 p-6 text-center transition-all hover:border-primary/40 hover:bg-card animate-fade-in-up active:scale-[0.98] w-full min-h-[180px] sm:min-h-[280px]"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <PlusCircle className="h-7 w-7" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">New Companion</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-[160px]">
          Ready for a new adventure? Tap here to add your latest addition.
        </p>
      </div>
    </button>
  );
}

function PetsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [latestWeight, setLatestWeight] = useState("");

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      toast.success("Email verified successfully!");
      router.replace("/pets");
    }
  }, [searchParams, router]);

  // Pets data
  const { data, isLoading } = usePets();
  const pets = data?.data ?? [];

  // Vaccination statuses for status badges
  const { data: vaccinationsData } = useVaccinations({ per_page: 100 });
  const duePetIds = new Set(
    (vaccinationsData?.data ?? [])
      .filter((v) => v.attributes.status !== "up_to_date")
      .map((v) => v.attributes.petId),
  );

  // Recent vet visits for Recent Records section
  const { data: recentVisitsData, isLoading: visitsLoading } = useVetVisits({
    per_page: 5,
  });

  const petById = new Map(pets.map((p) => [p.id, p]));

  const createPet = useCreatePet();
  const uploadAvatar = useUploadPetAvatar();

  const onDrop = (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const clearAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      species: undefined,
      breed: "",
      sex: undefined,
      birthday: "",
      isNeutered: false,
      size: undefined,
      notes: "",
    },
  });

  const isNeuteredValue = watch("isNeutered");

  const handleClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      reset();
      setLatestWeight("");
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const onSubmit = (values: PetFormValues) => {
    createPet.mutate(values, {
      onSuccess: (pet) => {
        const today = new Date().toISOString().split("T")[0];
        const w = parseFloat(latestWeight);
        if (!Number.isNaN(w) && w > 0) {
          petEndpoints
            .recordWeight(pet.id, { weightKg: w, recordedAt: today })
            .catch(() => {});
        }
        if (avatarFile) {
          uploadAvatar.mutate({ id: pet.id, file: avatarFile });
        }
        setDialogOpen(false);
        reset();
        setLatestWeight("");
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(null);
        setAvatarPreview(null);
      },
    });
  };

  const recentVisits = recentVisitsData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Pets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your companions and their health journeys.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 shrink-0">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Add Pet</span>
        </Button>
      </div>

      {/* Pet cards grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
            <PetCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pets.map((pet, i) => (
            <PetCard
              key={pet.id}
              pet={pet}
              animationIndex={i}
              status={duePetIds.has(pet.id) ? "vaccine_due" : "healthy"}
            />
          ))}
          <NewCompanionCard onClick={() => setDialogOpen(true)} />
        </div>
      )}

      {/* Recent Records */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Records</h2>
          <NextLink
            href="/vet-visits"
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium shrink-0"
          >
            <span className="hidden sm:inline">View all historical logs</span>
            <span className="sm:hidden">View all</span>
          </NextLink>
        </div>

        {visitsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
              <Skeleton key={i} className="h-[72px] rounded-xl" />
            ))}
          </div>
        ) : recentVisits.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center rounded-2xl border border-border bg-card/50">
            <Stethoscope className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No recent records found
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Vet visits will appear here once recorded
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentVisits.map((visit) => {
              const pet = petById.get(visit.attributes.petId);
              const petName = pet?.attributes.name ?? "Unknown";
              const Icon =
                VISIT_TYPE_ICON[visit.attributes.visitType] ?? Stethoscope;
              const iconClass =
                VISIT_TYPE_BG[visit.attributes.visitType] ??
                "bg-primary/15 text-primary";

              return (
                <NextLink
                  key={visit.id}
                  href={`/vet-visits/${visit.id}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:bg-accent/30 transition-colors"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      iconClass,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-bold">{petName}</span>
                      {" — "}
                      {visit.attributes.reason ||
                        VISIT_TYPE_LABEL[visit.attributes.visitType]}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatShortDate(visit.attributes.visitDate)}
                    </p>
                  </div>
                  <MoreVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                </NextLink>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Pet Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Pet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4 py-2">
              {/* Photo upload */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-dashed bg-muted/30 text-muted-foreground transition-colors cursor-pointer overflow-hidden",
                      isDragActive
                        ? "border-primary text-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:text-primary",
                    )}
                  >
                    <input {...getInputProps()} />
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Preview"
                        width={96}
                        height={96}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        <span className="text-[9px] mt-0.5">
                          {isDragActive ? "Drop" : "Photo"}
                        </span>
                      </>
                    )}
                  </div>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={clearAvatar}
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  JPG, PNG or WebP · Max 5 MB
                </p>
              </div>

              {/* Basic Info section */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Basic Info
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Name */}
              <div>
                <Label>
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register("name")}
                  placeholder="e.g., Biscuit"
                  className="mt-1.5 bg-background"
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Species + Sex */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>
                    Species <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="species"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="mt-1.5 bg-background">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIES_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {SPECIES_EMOJI[s.value]} {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.species && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.species.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>
                    Sex <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="sex"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="mt-1.5 bg-background">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEX_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.sex && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.sex.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Breed */}
              <div>
                <Label>Breed</Label>
                <Input
                  {...register("breed")}
                  placeholder="e.g., Golden Retriever"
                  className="mt-1.5 bg-background"
                />
              </div>

              {/* Health & Vitals section */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Health &amp; Vitals
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Birthday + Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Birthday</Label>
                  <Input
                    type="date"
                    {...register("birthday")}
                    className="mt-1.5 bg-background"
                  />
                  {errors.birthday && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.birthday.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={latestWeight}
                    onChange={(e) => setLatestWeight(e.target.value)}
                    placeholder="0.0"
                    className="mt-1.5 bg-background"
                  />
                </div>
              </div>

              {/* Size */}
              <div>
                <Label>Size</Label>
                <Controller
                  name="size"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(v) =>
                        field.onChange(v === "none" ? undefined : v)
                      }
                    >
                      <SelectTrigger className="mt-1.5 bg-background">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not specified</SelectItem>
                        {SIZE_OPTIONS.map((s) => (
                          <SelectItem
                            key={s.value}
                            value={s.value}
                            className="capitalize"
                          >
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Neutered Switch */}
              <div className="flex items-center gap-3">
                <Switch
                  id="isNeutered"
                  checked={isNeuteredValue}
                  onCheckedChange={(v) => setValue("isNeutered", v)}
                />
                <Label htmlFor="isNeutered">Is Neutered / Spayed</Label>
              </div>

              {/* Notes section */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Notes
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Notes */}
              <div>
                <Textarea
                  {...register("notes")}
                  placeholder="Any allergies, special needs..."
                  className="bg-background"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={createPet.isPending || uploadAvatar.isPending}
              >
                {(createPet.isPending || uploadAvatar.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Pet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PetsPage() {
  return (
    <Suspense>
      <PetsContent />
    </Suspense>
  );
}
