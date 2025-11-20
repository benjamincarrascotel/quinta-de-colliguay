<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('production_center_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('production_center_id')->constrained('production_centers')->restrictOnDelete();
            $table->foreignUuid('user_id')->constrained('users');
            $table->timestamps();

            $table->unique(['production_center_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('production_center_user', function (Blueprint $table) {
            $table->dropUnique(['production_center_id', 'user_id']);
            $table->dropForeign(['production_center_id']);
            $table->dropForeign(['user_id']);
        });
        Schema::dropIfExists('production_center_user');
    }
};
