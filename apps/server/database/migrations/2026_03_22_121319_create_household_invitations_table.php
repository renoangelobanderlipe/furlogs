<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('household_invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('household_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('inviter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('invitee_id')->constrained('users')->cascadeOnDelete();
            $table->string('token', 64)->unique();
            $table->string('status', 10)->default('pending');
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('declined_at')->nullable();
            $table->timestamps();
        });

        // Partial unique index — only one pending invite per household+invitee pair
        DB::statement("CREATE UNIQUE INDEX household_invitations_pending_unique ON household_invitations (household_id, invitee_id) WHERE status = 'pending'");
    }

    public function down(): void
    {
        Schema::dropIfExists('household_invitations');
    }
};
