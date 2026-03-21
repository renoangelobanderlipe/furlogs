"use client";

import Image from "next/image";
import NextLink from "next/link";
import type { Pet } from "@/lib/api/pets";
import { SPECIES_EMOJI } from "@/lib/constants";
import { formatAge } from "@/lib/format";

interface PetCardProps {
  pet: Pet;
  animationIndex?: number;
}

export function PetCard({ pet, animationIndex = 0 }: PetCardProps) {
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
    <NextLink
      href={`/pets/${pet.id}`}
      className="group block rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 animate-fade-in-up active:scale-[0.98] no-underline"
      style={{ animationDelay: `${animationIndex * 80}ms` }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl shrink-0 overflow-hidden">
          {thumbUrl ? (
            <Image
              src={thumbUrl}
              alt={name}
              width={56}
              height={56}
              className="h-14 w-14 object-cover rounded-full"
            />
          ) : (
            (SPECIES_EMOJI[species] ?? "🐾")
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-lg truncate text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
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
          <p className="font-medium text-foreground">
            {formatAge(birthday, age)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Weight</p>
          <p className="font-medium text-foreground">
            {latestWeightKg != null ? `${latestWeightKg} kg` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Breed</p>
          <p className="font-medium truncate text-foreground">{breed || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Size</p>
          <p className="font-medium capitalize text-foreground">
            {size || "—"}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">
        <span>View profile</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="translate-x-0 group-hover:translate-x-0.5 transition-transform"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </NextLink>
  );
}
