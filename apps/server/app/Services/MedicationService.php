<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\FrequencyType;
use App\Models\Medication;
use App\Models\MedicationAdministration;
use Carbon\Carbon;

class MedicationService
{
    /**
     * Create a new Medication record.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Medication
    {
        return Medication::query()->create($data);
    }

    /**
     * Update an existing Medication record.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Medication $medication, array $data): Medication
    {
        $medication->update($data);

        return $medication->fresh();
    }

    /**
     * Soft-delete a Medication record.
     */
    public function delete(Medication $medication): void
    {
        $medication->delete();
    }

    /**
     * Record a dose administration for a medication.
     *
     * @param  array<string, mixed>  $data
     */
    public function recordAdministration(Medication $medication, array $data): MedicationAdministration
    {
        /** @var MedicationAdministration */
        return MedicationAdministration::withoutGlobalScopes()->create([
            'medication_id' => $medication->id,
            'administered_by' => auth()->id(),
            'administered_at' => $data['administered_at'] ?? now(),
            'notes' => $data['notes'] ?? null,
        ]);
    }

    /**
     * Calculate the consecutive-day streak for a medication.
     *
     * Returns the number of consecutive days (ending yesterday or today)
     * on which the required number of doses were administered.
     */
    public function calculateStreak(Medication $medication): int
    {
        // Only daily/twice_daily have a meaningful day-by-day streak.
        // Weekly and monthly would always show 0 streak (missed on non-dose days),
        // and as_needed has no schedule at all.
        if (! in_array($medication->frequency, [FrequencyType::Daily, FrequencyType::TwiceDaily], true)) {
            return 0;
        }

        $required = $medication->frequency->dosesPerDay();
        $streak = 0;
        $day = now()->startOfDay();

        // Use withoutGlobalScopes — authorization already verified at controller level.
        // Load from medication start_date to avoid the 90-day hard ceiling.
        $administrations = MedicationAdministration::withoutGlobalScopes()
            ->where('medication_id', $medication->id)
            ->where('administered_at', '>=', $medication->start_date->startOfDay())
            ->get()
            ->groupBy(fn (MedicationAdministration $a): string => Carbon::parse($a->administered_at)->toDateString());

        $skippedToday = false;

        while (true) {
            $dateKey = $day->toDateString();
            $count = isset($administrations[$dateKey]) ? $administrations[$dateKey]->count() : 0;

            if ($count < $required) {
                // Allow skipping today once — a missing dose today doesn't break a prior streak
                if ($day->isToday() && ! $skippedToday) {
                    $skippedToday = true;
                    $day = $day->copy()->subDay();

                    continue;
                }
                break;
            }

            $streak++;
            $day = $day->copy()->subDay();
        }

        return $streak;
    }

    /**
     * Delete an administration record.
     */
    public function deleteAdministration(MedicationAdministration $administration): void
    {
        $administration->delete();
    }
}
