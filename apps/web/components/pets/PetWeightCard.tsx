'use client';

import {
  ChevronDown,
  PlusCircle,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { PetWeightChart } from '@/components/pets/PetWeightChart';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeletePetWeight, usePetWeights } from '@/hooks/api/usePetWeights';
import type { Pet } from '@/lib/api/pets';
import { SPECIES_EMOJI } from '@/lib/constants';
import { formatShortDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export const PetWeightCard = ({
  pet,
  index,
  onRecordWeight,
}: {
  pet: Pet;
  index: number;
  onRecordWeight?: (petId: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const { data: weightsData, isLoading } = usePetWeights(pet.id);
  const deleteWeight = useDeletePetWeight(pet.id);
  const weights = (weightsData?.data ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.attributes.recordedAt).getTime() -
        new Date(a.attributes.recordedAt).getTime(),
    );

  if (!isLoading && weights.length === 0) {
    return (
      <div
        className="rounded-xl border border-border bg-card animate-fade-in-up overflow-hidden"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">
              {SPECIES_EMOJI[pet.attributes.species] ?? '🐾'}
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">
                {pet.attributes.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                No weight records yet
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRecordWeight?.(pet.id)}
          >
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            Record First Weight
          </Button>
        </div>
      </div>
    );
  }

  const latest = weights[0];
  const previous = weights[1];
  const trend =
    latest && previous
      ? latest.attributes.weightKg - previous.attributes.weightKg
      : null;

  return (
    <div
      className="rounded-xl border border-border bg-card animate-fade-in-up overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Card header — clicking toggles expand */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">
            {SPECIES_EMOJI[pet.attributes.species] ?? '🐾'}
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">
              {pet.attributes.name}
            </p>
            {latest && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {Number(latest.attributes.weightKg).toFixed(2)} kg latest
                {weights.length > 0 && (
                  <span className="ml-1.5">
                    · {weights.length}{' '}
                    {weights.length === 1 ? 'record' : 'records'}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {trend !== null && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                trend > 0
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend > 0 ? '+' : ''}
              {trend.toFixed(2)} kg
            </div>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              expanded && 'rotate-180',
            )}
          />
        </div>
      </button>

      {/* Collapsible content */}
      {expanded && (
        <div className="border-t border-border/50">
          {/* Chart */}
          <div className="px-4 pt-3">
            <PetWeightChart petId={pet.id} />
          </div>

          {/* Entry list */}
          {isLoading ? (
            <div className="px-4 pb-4 space-y-1 mt-3">
              {['w1', 'w2'].map((k) => (
                <Skeleton key={k} className="h-7 rounded" />
              ))}
            </div>
          ) : (
            <div className="px-4 pb-4 mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {weights.length} {weights.length === 1 ? 'record' : 'records'}
              </p>
              <div className="rounded-lg border border-border/40 overflow-hidden">
                {weights.map((entry, i) => {
                  const prev = weights[i + 1];
                  const change = prev
                    ? entry.attributes.weightKg - prev.attributes.weightKg
                    : 0;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between text-sm px-3 py-2 group border-b border-border/40 last:border-0"
                    >
                      <span className="text-muted-foreground">
                        {formatShortDate(entry.attributes.recordedAt)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium tabular-nums">
                          {Number(entry.attributes.weightKg).toFixed(2)} kg
                        </span>
                        {change !== 0 && (
                          <span className="text-xs text-muted-foreground/70">
                            {change > 0 ? '+' : ''}
                            {change.toFixed(2)} kg
                          </span>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              type="button"
                              className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                              aria-label="Delete weight entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete weight entry?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the weight record
                                for{' '}
                                {formatShortDate(entry.attributes.recordedAt)}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteWeight.mutate(entry.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
