<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignUuid('current_household_id')
                ->nullable()
                ->after('remember_token')
                ->constrained('households')
                ->nullOnDelete();
            $table->string('timezone')->default('Asia/Manila')->after('current_household_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_household_id']);
            $table->dropColumn('current_household_id');
            $table->dropColumn('timezone');
        });
    }
};
