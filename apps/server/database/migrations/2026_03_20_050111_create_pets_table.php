<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained()->cascadeOnDelete();
            $table->string('name', 50);
            $table->string('species');
            $table->string('breed', 100)->nullable();
            $table->string('sex');
            $table->date('birthday')->nullable();
            $table->string('photo_path')->nullable();
            $table->boolean('is_neutered')->default(false);
            $table->string('size')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['household_id', 'species']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pets');
    }
};
