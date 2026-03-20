"use client";

import {
  ArrowLeft,
  Cake,
  PawPrint,
  Pencil,
  Scale,
  Trash2,
  User,
} from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { PetForm } from "@/components/pets/PetForm";
import { PetWeightChart } from "@/components/pets/PetWeightChart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/ui/StatCard";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeletePet, usePet, useUpdatePet } from "@/hooks/api/usePets";
import type { PetFormValues } from "@/lib/validation/pet.schema";

interface PetDetailPageProps {
  params: Promise<{ petId: string }>;
}

export default function PetDetailPage({ params }: PetDetailPageProps) {
  const { petId } = use(params);
  const id = Number(petId);
  const router = useRouter();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: pet, isLoading, isError } = usePet(id);
  const updatePet = useUpdatePet();
  const deletePet = useDeletePet();

  const handleUpdate = (values: PetFormValues) => {
    updatePet.mutate(
      { id, data: values },
      { onSuccess: () => setIsEditDialogOpen(false) },
    );
  };

  const handleDelete = () => {
    deletePet.mutate(id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        router.push("/pets");
      },
    });
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="mb-4 h-5 w-60" />
        <div className="mb-6 flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div>
            <Skeleton className="mb-1 h-9 w-44" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !pet) {
    return (
      <div className="py-16 text-center">
        <h2 className="mb-3 text-lg font-semibold text-destructive">
          Pet not found
        </h2>
        <Button asChild variant="outline" className="gap-2">
          <NextLink href="/pets">
            <ArrowLeft className="h-4 w-4" />
            Back to pets
          </NextLink>
        </Button>
      </div>
    );
  }

  const {
    name,
    species,
    breed,
    sex,
    birthday,
    age,
    isNeutered,
    size,
    notes,
    avatarUrl,
  } = pet.attributes;

  const ageDisplay =
    age !== null ? (age === 1 ? "1 year old" : `${age} years old`) : "—";

  const birthdayDisplay = birthday
    ? new Date(birthday).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div>
      {/* Breadcrumbs */}
      <nav
        aria-label="breadcrumb"
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <NextLink href="/" className="hover:text-foreground">
          Dashboard
        </NextLink>
        <span>/</span>
        <NextLink href="/pets" className="hover:text-foreground">
          Pets
        </NextLink>
        <span>/</span>
        <span className="text-foreground">{name}</span>
      </nav>

      {/* Back button */}
      <Button asChild variant="ghost" size="sm" className="mb-4 gap-2">
        <NextLink href="/pets">
          <ArrowLeft className="h-4 w-4" />
          Back to pets
        </NextLink>
      </Button>

      {/* Hero section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-24 w-24 text-4xl">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="text-3xl">
            {!avatarUrl && (species === "dog" ? "🐶" : "🐱")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h1 className="mb-1 text-3xl font-extrabold tracking-tight">
            {name}
          </h1>
          <p className="text-muted-foreground">
            {[species.charAt(0).toUpperCase() + species.slice(1), breed]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">
              {sex.charAt(0).toUpperCase() + sex.slice(1)}
            </Badge>
            {isNeutered && (
              <Badge
                variant="outline"
                className="border-blue-500/20 text-blue-600 dark:text-blue-400"
              >
                Neutered
              </Badge>
            )}
            {size && (
              <Badge variant="outline">
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditDialogOpen(true)}
            aria-label="Edit pet"
            className="flex h-12 w-12 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-5 w-5" />
          </button>
          {/* TODO: hide for non-owners once role is exposed on GET /api/user */}
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            aria-label="Delete pet"
            className="flex h-12 w-12 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Info stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Age" value={ageDisplay} icon={<PawPrint />} />
        <StatCard label="Birthday" value={birthdayDisplay} icon={<Cake />} />
        <StatCard
          label="Sex"
          value={sex.charAt(0).toUpperCase() + sex.slice(1)}
          icon={<User />}
        />
        <StatCard
          label="Size"
          value={size ? size.charAt(0).toUpperCase() + size.slice(1) : "—"}
          icon={<Scale />}
        />
      </div>

      {/* Notes */}
      {notes && (
        <div className="mb-6">
          <h2 className="mb-1 text-sm font-semibold">Notes</h2>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {notes}
          </p>
          <Separator className="mt-4" />
        </div>
      )}

      {/* Weight chart */}
      <div className="mb-6">
        <PetWeightChart petId={id} />
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {name}</DialogTitle>
          </DialogHeader>
          <PetForm
            defaultValues={{
              name,
              species,
              breed: breed ?? "",
              sex,
              birthday: birthday ?? "",
              isNeutered,
              size: size ?? undefined,
              notes: notes ?? "",
            }}
            onSubmit={handleUpdate}
            isLoading={updatePet.isPending}
            submitLabel="Save changes"
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title={`Remove ${name}?`}
        description={`Are you sure you want to remove ${name}? This action cannot be undone.`}
        confirmLabel="Remove pet"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={deletePet.isPending}
      />
    </div>
  );
}
