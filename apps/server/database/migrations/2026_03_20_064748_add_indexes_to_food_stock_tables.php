<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('food_consumption_logs', function (Blueprint $table) {
            $table->unique('food_stock_item_id');
        });

        Schema::table('food_consumption_rates', function (Blueprint $table) {
            $table->index('pet_id');
        });
    }

    public function down(): void
    {
        Schema::table('food_consumption_logs', function (Blueprint $table) {
            $table->dropUnique(['food_stock_item_id']);
        });

        Schema::table('food_consumption_rates', function (Blueprint $table) {
            $table->dropIndex(['pet_id']);
        });
    }
};
