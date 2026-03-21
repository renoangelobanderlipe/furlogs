"use client";

import {
  ArrowLeft,
  Cake,
  PawPrint,
  Pencil,
  Pill,
  Scale,
  Stethoscope,
  Syringe,
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
import { VaccinationCard } from "@/components/vaccinations/VaccinationCard";
import { useMedications } from "@/hooks/api/useMedications";
import { useDeletePet, usePet, useUpdatePet } from "@/hooks/api/usePets";
import { useVaccinations } from "@/hooks/api/useVaccinations";
import { useVetVisits } from "@/hooks/api/useVetVisits";
import { VISIT_TYPE_LABEL } from "@/lib/api/vet-visits";
import { SPECIES_EMOJI } from "@/lib/constants";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PetFormValues } from "@/lib/validation/pet.schema";

type Tab = "overview" | "vet-visits" | "vaccinations" | "medications";

interface PetDetailPageProps {
  params: Promise<{ petId: string }>;
}

export default function PetDetailPage({ params }: PetDetailPageProps) {
  const { petId } = use(params);
  const id = Number(petId);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: pet, isLoading, isError } = usePet(id);
  const updatePet = useUpdatePet();
  const deletePet = useDeletePet();

  const { data: vetVisitsData, isLoading: visitsLoading } = useVetVisits({
    pet_id: id,
    per_page: 10,
  });
  const { data: vaccinationsData, isLoading: vaccsLoading } = useVaccinations({
    petId: id,
    per_page: 20,
  });
  const { data: medicationsData, isLoading: medsLoading } = useMedications({
    petId: id,
    per_page: 20,
  });

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

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: PawPrint },
    { key: "vet-visits", label: "Vet Visits", icon: Stethoscope },
    { key: "vaccinations", label: "Vaccinations", icon: Syringe },
    { key: "medications", label: "Medications", icon: Pill },
  ];

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
            {!avatarUrl && (SPECIES_EMOJI[species] ?? "🐾")}
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-px mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Age" value={ageDisplay} icon={<PawPrint />} />
            <StatCard
              label="Birthday"
              value={birthdayDisplay}
              icon={<Cake />}
            />
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

          {notes && (
            <div className="mb-6">
              <h2 className="mb-1 text-sm font-semibold">Notes</h2>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {notes}
              </p>
              <Separator className="mt-4" />
            </div>
          )}

          <PetWeightChart petId={id} />
        </div>
      )}

      {/* Tab: Vet Visits */}
      {activeTab === "vet-visits" && (
        <div className="space-y-3">
          {visitsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
              <Skeleton key={i} className="h-[72px] rounded-lg" />
            ))
          ) : (vetVisitsData?.data ?? []).length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Stethoscope className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-semibold">No vet visits recorded</p>
              <p className="text-sm text-muted-foreground mt-1">
                Vet visits for {name} will appear here
              </p>
              <Button asChild size="sm" className="mt-4">
                <NextLink href="/vet-visits">Go to Vet Visits</NextLink>
              </Button>
            </div>
          ) : (
            (vetVisitsData?.data ?? []).map((visit) => (
              <NextLink
                key={visit.id}
                href={`/vet-visits/${visit.id}`}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:bg-accent/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {VISIT_TYPE_LABEL[visit.attributes.visitType]}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatShortDate(visit.attributes.visitDate)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {visit.attributes.reason}
                  </p>
                </div>
                {visit.attributes.cost && (
                  <span className="text-sm font-medium tabular-nums shrink-0">
                    {formatCurrency(parseFloat(visit.attributes.cost))}
                  </span>
                )}
              </NextLink>
            ))
          )}
        </div>
      )}

      {/* Tab: Vaccinations */}
      {activeTab === "vaccinations" && (
        <div>
          {vaccsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
                <Skeleton key={i} className="h-[120px] rounded-lg" />
              ))}
            </div>
          ) : (vaccinationsData?.data ?? []).length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Syringe className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-semibold">No vaccinations recorded</p>
              <p className="text-sm text-muted-foreground mt-1">
                Vaccination records for {name} will appear here
              </p>
              <Button asChild size="sm" className="mt-4">
                <NextLink href="/vaccinations">Go to Vaccinations</NextLink>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(vaccinationsData?.data ?? []).map((v) => (
                <VaccinationCard key={v.id} vaccination={v} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Medications */}
      {activeTab === "medications" && (
        <div className="space-y-3">
          {medsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
              <Skeleton key={i} className="h-[68px] rounded-lg" />
            ))
          ) : (medicationsData?.data ?? []).length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Pill className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-semibold">No medications recorded</p>
              <p className="text-sm text-muted-foreground mt-1">
                Medications for {name} will appear here
              </p>
              <Button asChild size="sm" className="mt-4">
                <NextLink href="/medications">Go to Medications</NextLink>
              </Button>
            </div>
          ) : (
            (medicationsData?.data ?? []).map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                <Pill className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{m.attributes.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[m.attributes.dosage, m.attributes.frequency]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
                    m.attributes.isActive
                      ? "bg-success/15 text-success"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {m.attributes.isActive ? "Active" : "Completed"}
                </span>
              </div>
            ))
          )}
        </div>
      )}

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
