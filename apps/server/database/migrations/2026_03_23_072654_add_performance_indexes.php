<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // vet_visits.visit_date — SpendingController does whereYear('visit_date') with no pet_id filter.
        // The existing (pet_id, visit_date) composite doesn't help household-wide aggregations.
        Schema::table('vet_visits', function (Blueprint $table): void {
            $table->index('visit_date');
        });

        // food_stock_items.purchased_at — SpendingController + DashboardService filter by purchased_at
        // without food_product_id, so the existing (food_product_id, status) composite doesn't cover it.
        Schema::table('food_stock_items', function (Blueprint $table): void {
            $table->index('purchased_at');
        });

        // reminders(household_id, status, due_date) — The HouseholdScope adds WHERE household_id = ?
        // as the most selective predicate. The existing (status, due_date) composite skips household_id,
        // forcing a wider scan. This composite supports dashboard + reminder index queries efficiently.
        Schema::table('reminders', function (Blueprint $table): void {
            $table->index(['household_id', 'status', 'due_date']);
        });

        // vaccinations.next_due_date — CalendarController filters whereBetween('next_due_date', [...]).
        // Only pet_id is indexed; this scan would be sequential without this index.
        Schema::table('vaccinations', function (Blueprint $table): void {
            $table->index('next_due_date');
        });

        // medications.start_date — CalendarController queries active medications with
        // whereDate('start_date', '<=', $end). Only pet_id is indexed today.
        Schema::table('medications', function (Blueprint $table): void {
            $table->index('start_date');
        });
    }

    public function down(): void
    {
        Schema::table('vet_visits', function (Blueprint $table): void {
            $table->dropIndex(['visit_date']);
        });

        Schema::table('food_stock_items', function (Blueprint $table): void {
            $table->dropIndex(['purchased_at']);
        });

        Schema::table('reminders', function (Blueprint $table): void {
            $table->dropIndex(['household_id', 'status', 'due_date']);
        });

        Schema::table('vaccinations', function (Blueprint $table): void {
            $table->dropIndex(['next_due_date']);
        });

        Schema::table('medications', function (Blueprint $table): void {
            $table->dropIndex(['start_date']);
        });
    }
};
