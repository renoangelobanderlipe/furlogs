<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('food_consumption_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('food_product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pet_id')->constrained()->cascadeOnDelete();
            $table->integer('daily_amount_grams');
            $table->timestamps();

            $table->unique(['food_product_id', 'pet_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('food_consumption_rates');
    }
};
