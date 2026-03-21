<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('food_stock_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('food_product_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['sealed', 'open', 'finished'])->default('sealed');
            $table->date('purchased_at');
            $table->date('opened_at')->nullable();
            $table->date('finished_at')->nullable();
            $table->decimal('purchase_cost', 10, 2)->nullable();
            $table->string('purchase_source')->nullable();
            $table->integer('quantity')->default(1);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['food_product_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('food_stock_items');
    }
};
