"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CakeIcon from "@mui/icons-material/Cake";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FemaleIcon from "@mui/icons-material/Female";
import MaleIcon from "@mui/icons-material/Male";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import PetsIcon from "@mui/icons-material/Pets";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { PetForm } from "@/components/pets/PetForm";
import { PetWeightChart } from "@/components/pets/PetWeightChart";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatCard } from "@/components/ui/StatCard";
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
      <Box>
        <Skeleton variant="text" width={240} height={28} sx={{ mb: 2 }} />
        <Box display="flex" gap={3} mb={4} alignItems="center">
          <Skeleton variant="circular" width={96} height={96} />
          <Box>
            <Skeleton variant="text" width={180} height={40} />
            <Skeleton variant="text" width={120} height={24} />
          </Box>
        </Box>
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
            <Grid key={i} size={{ xs: 6, md: 3 }}>
              <Skeleton variant="rounded" height={80} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (isError || !pet) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="error" gutterBottom>
          Pet not found
        </Typography>
        <Button component={NextLink} href="/pets" startIcon={<ArrowBackIcon />}>
          Back to pets
        </Button>
      </Box>
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
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={NextLink} href="/" underline="hover" color="inherit">
          Dashboard
        </Link>
        <Link
          component={NextLink}
          href="/pets"
          underline="hover"
          color="inherit"
        >
          Pets
        </Link>
        <Typography color="text.primary">{name}</Typography>
      </Breadcrumbs>

      {/* Back button */}
      <Button
        component={NextLink}
        href="/pets"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
        size="small"
      >
        Back to pets
      </Button>

      {/* Hero section */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={3}
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={4}
      >
        <Avatar
          src={avatarUrl ?? undefined}
          sx={{
            width: 96,
            height: 96,
            fontSize: 48,
            bgcolor: "action.hover",
          }}
        >
          {!avatarUrl && (species === "dog" ? "🐶" : "🐱")}
        </Avatar>

        <Box flexGrow={1}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {[species.charAt(0).toUpperCase() + species.slice(1), breed]
              .filter(Boolean)
              .join(" · ")}
          </Typography>
          <Box display="flex" gap={1} mt={1} flexWrap="wrap">
            <Chip
              icon={sex === "male" ? <MaleIcon /> : <FemaleIcon />}
              label={sex.charAt(0).toUpperCase() + sex.slice(1)}
              size="small"
              variant="outlined"
            />
            {isNeutered && (
              <Chip
                label="Neutered"
                size="small"
                variant="outlined"
                color="info"
              />
            )}
            {size && (
              <Chip
                label={size.charAt(0).toUpperCase() + size.slice(1)}
                size="small"
                variant="outlined"
                color="secondary"
              />
            )}
          </Box>
        </Box>

        <Box display="flex" gap={1}>
          <IconButton
            onClick={() => setIsEditDialogOpen(true)}
            aria-label="Edit pet"
            sx={{ minWidth: 48, minHeight: 48 }}
          >
            <EditIcon />
          </IconButton>
          {/* TODO: hide for non-owners once role is exposed on GET /api/user — backend returns 403 in the meantime */}
          <IconButton
            onClick={() => setIsDeleteDialogOpen(true)}
            aria-label="Delete pet"
            color="error"
            sx={{ minWidth: 48, minHeight: 48 }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Info stats */}
      <Grid container spacing={2} mb={4}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Age" value={ageDisplay} icon={<PetsIcon />} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Birthday"
            value={birthdayDisplay}
            icon={<CakeIcon />}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Sex"
            value={sex.charAt(0).toUpperCase() + sex.slice(1)}
            icon={sex === "male" ? <MaleIcon /> : <FemaleIcon />}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Size"
            value={size ? size.charAt(0).toUpperCase() + size.slice(1) : "—"}
            icon={<MonitorWeightIcon />}
          />
        </Grid>
      </Grid>

      {/* Notes */}
      {notes && (
        <Box mb={4}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Notes
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "pre-wrap" }}
          >
            {notes}
          </Typography>
          <Divider sx={{ mt: 3 }} />
        </Box>
      )}

      {/* Weight chart */}
      <Box mb={4}>
        <PetWeightChart petId={id} />
      </Box>

      {/* Edit dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit {name}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
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
    </Box>
  );
}
