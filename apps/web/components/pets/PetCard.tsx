"use client";

import { Button } from "@/components/ui/button";
import type { Pet } from "@/lib/api/pets";
import { SPECIES_EMOJI } from "@/lib/constants";

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

interface PetCardProps {
  pet: Pet;
  animationIndex?: number;
  onViewProfile: () => void;
}

export function PetCard({
  pet,
  animationIndex = 0,
  onViewProfile,
}: PetCardProps) {
  const {
    name,
    species,
    sex,
    breed,
    birthday,
    age,
    size,
    latestWeightKg,
    thumbUrl,
  } = pet.attributes;

  return (
    <div
      className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 animate-fade-in-up cursor-pointer active:scale-[0.98]"
      style={{ animationDelay: `${animationIndex * 80}ms` }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl shrink-0 overflow-hidden">
          {thumbUrl ? (
            // biome-ignore lint/performance/noImgElement: external storage URL, next/image requires domain allowlist config
            <img
              src={thumbUrl}
              alt={name}
              className="h-14 w-14 object-cover rounded-full"
            />
          ) : (
            (SPECIES_EMOJI[species] ?? "🐾")
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-lg truncate">{name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium capitalize">
              {species}
            </span>
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium capitalize">
              {sex}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Age</p>
          <p className="font-medium">{formatAge(birthday, age)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Weight</p>
          <p className="font-medium">
            {latestWeightKg != null ? `${latestWeightKg} kg` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Breed</p>
          <p className="font-medium truncate">{breed || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Size</p>
          <p className="font-medium capitalize">{size || "—"}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-4 group-hover:border-primary/40 group-hover:text-primary transition-colors"
        onClick={onViewProfile}
      >
        View Profile
      </Button>
    </div>
  );
}
