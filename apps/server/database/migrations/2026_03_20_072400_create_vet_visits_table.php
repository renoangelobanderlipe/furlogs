<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vet_visits', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('pet_id')->constrained('pets')->cascadeOnDelete();
            $table->foreignUuid('clinic_id')->nullable()->constrained('vet_clinics')->nullOnDelete();
            $table->string('vet_name')->nullable();
            $table->date('visit_date');
            $table->string('visit_type');
            $table->string('reason', 1000);
            $table->text('diagnosis')->nullable();
            $table->text('treatment')->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->decimal('weight_at_visit', 5, 2)->nullable();
            $table->date('follow_up_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['pet_id', 'visit_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vet_visits');
    }
};
