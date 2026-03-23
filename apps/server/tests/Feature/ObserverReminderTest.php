<?php

declare(strict_types=1);

use App\Enums\ReminderStatus;
use App\Enums\ReminderType;
use App\Enums\VisitType;
use App\Models\Medication;
use App\Models\Pet;
use App\Models\Reminder;
use App\Models\Vaccination;
use App\Models\VetVisit;

// ─── VetVisitObserver ────────────────────────────────────────────────────────

it('creates a pending VetAppointment reminder when a vet visit is created with a follow_up_date', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Annual checkup',
        'follow_up_date' => now()->addMonth()->toDateString(),
    ]);

    $this->assertDatabaseHas('reminders', [
        'household_id' => $household->id,
        'pet_id' => $pet->id,
        'type' => ReminderType::VetAppointment->value,
        'status' => ReminderStatus::Pending->value,
        'source_type' => VetVisit::class,
    ]);
});

it('does NOT create a reminder when a vet visit is created without a follow_up_date', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'No follow-up needed',
    ]);

    expect(
        Reminder::withoutGlobalScopes()
            ->where('type', ReminderType::VetAppointment->value)
            ->count(),
    )->toBe(0);
});

it('deletes the old reminder and creates a new one when follow_up_date changes', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $visit = VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Check',
        'follow_up_date' => now()->addMonth()->toDateString(),
    ]);

    expect(
        Reminder::withoutGlobalScopes()
            ->where('source_type', VetVisit::class)
            ->where('source_id', $visit->id)
            ->count(),
    )->toBe(1);

    $newFollowUp = now()->addMonths(2)->toDateString();
    $visit->update(['follow_up_date' => $newFollowUp]);

    $reminders = Reminder::withoutGlobalScopes()
        ->where('source_type', VetVisit::class)
        ->where('source_id', $visit->id)
        ->get();

    expect($reminders)->toHaveCount(1);
    expect($reminders->first()->due_date->toDateString())->toBe($newFollowUp);
    expect($reminders->first()->status)->toBe(ReminderStatus::Pending);
});

it('does NOT re-sync the reminder when a field other than follow_up_date changes', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $followUp = now()->addMonth()->toDateString();

    $visit = VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Original reason',
        'follow_up_date' => $followUp,
    ]);

    $originalReminderId = Reminder::withoutGlobalScopes()
        ->where('source_type', VetVisit::class)
        ->where('source_id', $visit->id)
        ->value('id');

    // Update only the reason — follow_up_date unchanged
    $visit->update(['reason' => 'Updated reason, no follow-up change']);

    $reminders = Reminder::withoutGlobalScopes()
        ->where('source_type', VetVisit::class)
        ->where('source_id', $visit->id)
        ->get();

    expect($reminders)->toHaveCount(1);
    expect($reminders->first()->id)->toBe($originalReminderId);
    expect($reminders->first()->due_date->toDateString())->toBe($followUp);
});

it('deletes the pending follow-up reminder when a vet visit is soft-deleted', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $visit = VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Checkup with follow-up',
        'follow_up_date' => now()->addMonth()->toDateString(),
    ]);

    expect(
        Reminder::withoutGlobalScopes()
            ->where('source_type', VetVisit::class)
            ->where('source_id', $visit->id)
            ->count(),
    )->toBe(1);

    $visit->delete();

    expect(
        Reminder::withoutGlobalScopes()
            ->where('source_type', VetVisit::class)
            ->where('source_id', $visit->id)
            ->where('status', ReminderStatus::Pending->value)
            ->count(),
    )->toBe(0);
});

it('does NOT delete a completed follow-up reminder when a vet visit is soft-deleted', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $visit = VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Checkup',
        'follow_up_date' => now()->addMonth()->toDateString(),
    ]);

    // Manually mark the reminder as completed
    Reminder::withoutGlobalScopes()
        ->where('source_type', VetVisit::class)
        ->where('source_id', $visit->id)
        ->update(['status' => ReminderStatus::Completed->value]);

    $visit->delete();

    // Completed reminder must survive the deletion cleanup
    expect(
        Reminder::withoutGlobalScopes()
            ->where('source_type', VetVisit::class)
            ->where('source_id', $visit->id)
            ->where('status', ReminderStatus::Completed->value)
            ->count(),
    )->toBe(1);
});

it('clearing follow_up_date deletes the reminder without creating a replacement', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $visit = VetVisit::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'visit_date' => now()->toDateString(),
        'visit_type' => VisitType::Checkup->value,
        'reason' => 'Checkup',
        'follow_up_date' => now()->addMonth()->toDateString(),
    ]);

    expect(
        Reminder::withoutGlobalScopes()
            ->where('source_type', VetVisit::class)
            ->where('source_id', $visit->id)
            ->count(),
    )->toBe(1);

    $visit->update(['follow_up_date' => null]);

    expect(
        Reminder::withoutGlobalScopes()
            ->where('source_type', VetVisit::class)
            ->where('source_id', $visit->id)
            ->count(),
    )->toBe(0);
});

// ─── MedicationObserver — wasChanged guard ───────────────────────────────────

it('does NOT re-sync the medication reminder when a field other than end_date changes', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $endDate = now()->addDays(10)->toDateString();

    $medication = Medication::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'name' => 'Amoxicillin',
        'start_date' => now()->toDateString(),
        'end_date' => $endDate,
    ]);

    $originalReminderId = Reminder::withoutGlobalScopes()
        ->where('source_type', Medication::class)
        ->where('source_id', $medication->id)
        ->value('id');

    // Update only the dosage — end_date unchanged
    $medication->update(['dosage' => '10mg']);

    $reminders = Reminder::withoutGlobalScopes()
        ->where('source_type', Medication::class)
        ->where('source_id', $medication->id)
        ->get();

    expect($reminders)->toHaveCount(1);
    expect($reminders->first()->id)->toBe($originalReminderId);
    expect($reminders->first()->due_date->toDateString())->toBe($endDate);
});

// ─── VaccinationObserver — wasChanged guard ──────────────────────────────────

it('does NOT re-sync the vaccination reminder when a field other than next_due_date changes', function () {
    [$owner, $household] = createOwnerWithHousehold();
    $pet = Pet::factory()->create(['household_id' => $household->id]);

    $nextDue = now()->addYear()->toDateString();

    $vaccination = Vaccination::withoutGlobalScopes()->create([
        'pet_id' => $pet->id,
        'vaccine_name' => 'Rabies',
        'administered_date' => now()->toDateString(),
        'next_due_date' => $nextDue,
    ]);

    $originalReminderId = Reminder::withoutGlobalScopes()
        ->where('source_type', Vaccination::class)
        ->where('source_id', $vaccination->id)
        ->value('id');

    // Update only the vaccine_name — next_due_date unchanged
    $vaccination->update(['vaccine_name' => 'Rabies (updated batch)']);

    $reminders = Reminder::withoutGlobalScopes()
        ->where('source_type', Vaccination::class)
        ->where('source_id', $vaccination->id)
        ->get();

    expect($reminders)->toHaveCount(1);
    expect($reminders->first()->id)->toBe($originalReminderId);
    expect($reminders->first()->due_date->toDateString())->toBe($nextDue);
});
