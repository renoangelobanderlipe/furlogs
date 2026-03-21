<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pet_weights', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pet_id')->constrained()->cascadeOnDelete();
            $table->decimal('weight_kg', 5, 2);
            $table->date('recorded_at');
            $table->timestamps();

            $table->index(['pet_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pet_weights');
    }
};
