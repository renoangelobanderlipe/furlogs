<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('food_consumption_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('food_stock_item_id')->constrained()->cascadeOnDelete();
            $table->integer('actual_duration_days');
            $table->integer('actual_daily_rate_grams');
            $table->decimal('estimated_vs_actual_diff', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('food_consumption_logs');
    }
};
