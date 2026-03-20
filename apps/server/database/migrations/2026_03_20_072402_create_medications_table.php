<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('pet_id')->constrained('pets')->cascadeOnDelete();
            $table->foreignId('vet_visit_id')->nullable()->constrained('vet_visits')->nullOnDelete();
            $table->string('name');
            $table->string('dosage')->nullable();
            $table->string('frequency')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('pet_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medications');
    }
};
