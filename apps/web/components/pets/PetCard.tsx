"use client";

import Image from "next/image";
import NextLink from "next/link";
import { PawWatermark } from "@/components/ui/paw-watermark";
import type { Pet } from "@/lib/api/pets";
import { SPECIES_EMOJI } from "@/lib/constants";
import { formatAge } from "@/lib/format";
import { cn } from "@/lib/utils";

export type PetStatus = "healthy" | "vaccine_due";

interface PetCardProps {
  pet: Pet;
  animationIndex?: number;
  status?: PetStatus;
}

export function PetCard({ pet, animationIndex = 0, status }: PetCardProps) {
  const {
    name,
    species,
    sex,
    breed,
    birthday,
    age,
    latestWeightKg,
    avatarUrl,
    thumbUrl,
  } = pet.attributes;

  return (
    <NextLink
      href={`/pets/${pet.id}`}
      className="group relative overflow-hidden block rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 animate-fade-in-up active:scale-[0.98] no-underline"
      style={{ animationDelay: `${animationIndex * 80}ms` }}
    >
      <PawWatermark
        size={72}
        opacity={0.05}
        rotate={18}
        className="-bottom-4 -left-4"
      />

      {/* Status badge */}
      {status && (
        <span
          className={cn(
            "absolute top-4 right-4 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border",
            status === "healthy"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/15 text-red-400 border-red-500/30",
          )}
        >
          {status === "healthy" ? "Healthy" : "Vaccine Due"}
        </span>
      )}

      {/* Avatar with sex badge */}
      <div className="flex justify-center mb-4 mt-2">
        <div className="relative inline-block">
          <div className="h-24 w-24 rounded-full ring-2 ring-white/10 overflow-hidden bg-muted flex items-center justify-center text-4xl">
            {thumbUrl || avatarUrl ? (
              <Image
                src={(thumbUrl || avatarUrl) as string}
                alt={name}
                width={96}
                height={96}
                className="h-24 w-24 object-cover"
              />
            ) : (
              (SPECIES_EMOJI[species] ?? "🐾")
            )}
          </div>
          {/* Sex badge */}
          <span
            className={cn(
              "absolute bottom-0.5 right-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-lg",
              sex === "male"
                ? "bg-primary text-primary-foreground"
                : "bg-pink-500 text-white",
            )}
          >
            {sex === "male" ? "♂" : "♀"}
          </span>
        </div>
      </div>

      {/* Name + breed */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate px-1">
          {name}
        </h3>
        {breed && (
          <p className="text-sm text-muted-foreground mt-0.5">{breed}</p>
        )}
      </div>

      {/* Stat boxes */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-xl bg-muted/40 p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Age
          </p>
          <p className="text-sm font-semibold text-foreground">
            {formatAge(birthday, age)}
          </p>
        </div>
        <div className="rounded-xl bg-muted/40 p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Weight
          </p>
          <p className="text-sm font-semibold text-foreground">
            {latestWeightKg != null ? `${latestWeightKg} kg` : "—"}
          </p>
        </div>
      </div>

      {/* View Profile button */}
      <div className="flex items-center justify-center gap-2 w-full rounded-xl bg-muted/50 group-hover:bg-muted py-2.5 text-sm font-medium text-foreground/80 group-hover:text-foreground transition-all">
        View Profile
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
