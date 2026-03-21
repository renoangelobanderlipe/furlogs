<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medication_administrations', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('medication_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('administered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('administered_at')->useCurrent();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('medication_id');
            $table->index('administered_at');
            $table->index(['medication_id', 'administered_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medication_administrations');
    }
};
