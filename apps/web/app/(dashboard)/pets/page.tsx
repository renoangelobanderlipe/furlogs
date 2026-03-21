"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PawPrint, PlusCircle, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Suspense } from "react";
import { useCreatePet, usePets, useUploadPetAvatar } from "@/hooks/api/usePets";
import type { Pet } from "@/lib/api/pets";
import { petEndpoints } from "@/lib/api/pets";
import { SPECIES_EMOJI } from "@/lib/constants";
import {
  type PetFormValues,
  petSchema,
  SEX_OPTIONS,
  SIZE_OPTIONS,
  SPECIES_OPTIONS,
} from "@/lib/validation/pet.schema";

function formatAge(birthday: string | null, age: number | null): string {
  if (age !== null) return age === 1 ? "1 year" : `${age} years`;
  if (!birthday) return "—";
  const birth = new Date(birthday);
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (totalMonths < 12)
    return totalMonths <= 1 ? "1 month" : `${totalMonths} months`;
  const yr = Math.floor(totalMonths / 12);
  return yr === 1 ? "1 year" : `${yr} years`;
}

function PetsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewPet, setViewPet] = useState<Pet | null>(null);
  const [latestWeight, setLatestWeight] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      toast.success("Email verified successfully!");
      router.replace("/pets");
    }
  }, [searchParams, router]);

  const { data, isLoading } = usePets();
  const createPet = useCreatePet();
  const uploadAvatar = useUploadPetAvatar();

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5 MB
  });

  const clearAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const pets = data?.data ?? [];

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Pets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pets.length} {pets.length === 1 ? "pet" : "pets"} in your household
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Pet
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
            <PetCardSkeleton key={i} />
          ))}
        </div>
      ) : pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
          <PawPrint className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No pets yet</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first pet to get started
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => setDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Pet
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet, i) => (
            <PetCard
              key={pet.id}
              pet={pet}
              animationIndex={i}
              onViewProfile={() => setViewPet(pet)}
            />
          ))}
        </div>
      )}

      {/* View Pet Dialog */}
      <Dialog open={!!viewPet} onOpenChange={(o) => !o && setViewPet(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">
                {SPECIES_EMOJI[viewPet?.attributes.species ?? ""] ?? "🐾"}
              </span>
              {viewPet?.attributes.name}
            </DialogTitle>
          </DialogHeader>
          {viewPet && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Species</p>
                  <p className="font-medium capitalize">
                    {viewPet.attributes.species}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Breed</p>
                  <p className="font-medium">
                    {viewPet.attributes.breed || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sex</p>
                  <p className="font-medium capitalize">
                    {viewPet.attributes.sex}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="font-medium">
                    {formatAge(
                      viewPet.attributes.birthday,
                      viewPet.attributes.age,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="font-medium">
                    {viewPet.attributes.latestWeightKg != null
                      ? `${viewPet.attributes.latestWeightKg} kg`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Size</p>
                  <p className="font-medium capitalize">
                    {viewPet.attributes.size || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Neutered</p>
                  <p className="font-medium">
                    {viewPet.attributes.isNeutered ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Birthday</p>
                  <p className="font-medium">
                    {viewPet.attributes.birthday || "—"}
                  </p>
                </div>
              </div>
              {viewPet.attributes.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1">{viewPet.attributes.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Pet Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Pet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4 py-2">
              {/* Photo upload */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div
                    {...getRootProps()}
                    className={`flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-dashed bg-muted/30 text-muted-foreground transition-colors cursor-pointer overflow-hidden
                      ${isDragActive ? "border-primary text-primary bg-primary/5" : "border-border hover:border-primary/50 hover:text-primary"}`}
                  >
                    <input {...getInputProps()} />
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Preview"
                        width={80}
                        height={80}
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
                      value={field.value ?? ""}
                      onValueChange={(v) => field.onChange(v || undefined)}
                    >
                      <SelectTrigger className="mt-1.5 bg-background">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
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

              {/* Notes */}
              <div>
                <Label>Notes</Label>
                <Textarea
                  {...register("notes")}
                  placeholder="Any allergies, special needs..."
                  className="mt-1.5 bg-background"
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
