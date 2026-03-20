<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaccinations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('pet_id')->constrained('pets')->cascadeOnDelete();
            $table->foreignId('clinic_id')->nullable()->constrained('vet_clinics')->nullOnDelete();
            $table->string('vaccine_name');
            $table->date('administered_date');
            $table->date('next_due_date')->nullable();
            $table->string('vet_name')->nullable();
            $table->string('batch_number')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('pet_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaccinations');
    }
};
