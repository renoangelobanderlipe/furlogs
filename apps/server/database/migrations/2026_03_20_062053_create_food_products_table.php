<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('food_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('brand')->nullable();
            $table->enum('type', ['dry', 'wet', 'treat', 'supplement']);
            $table->integer('unit_weight_grams')->nullable();
            $table->enum('unit_type', ['kg', 'can', 'pack', 'piece']);
            $table->integer('alert_threshold_pct')->default(25);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('household_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('food_products');
    }
};
