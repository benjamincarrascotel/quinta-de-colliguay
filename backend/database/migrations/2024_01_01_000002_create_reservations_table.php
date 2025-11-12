<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');

            // Fechas y bloques
            $table->date('arrival_date');
            $table->enum('arrival_block', ['morning', 'night']);
            $table->date('departure_date');
            $table->enum('departure_block', ['morning', 'night']);

            // Composición del grupo
            $table->unsignedSmallInteger('adults');
            $table->unsignedSmallInteger('children')->default(0);

            // Estado y montos
            $table->enum('status', ['requested', 'confirmed', 'cancelled'])->default('requested');
            $table->unsignedInteger('estimated_amount');
            $table->unsignedInteger('final_amount')->nullable();

            // Información de anticipo
            $table->unsignedInteger('deposit_amount')->nullable();
            $table->date('deposit_date')->nullable();
            $table->string('deposit_method')->nullable();
            $table->string('deposit_reference')->nullable();

            // Observaciones
            $table->text('client_observations')->nullable();
            $table->text('admin_observations')->nullable();

            // Razón de cancelación
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            // Índices para optimizar consultas
            $table->index(['status', 'arrival_date']);
            $table->index(['arrival_date', 'departure_date']);
            $table->index('created_at');
        });

        // CONSTRAINT EXCLUSION para prevenir solapes (PostgreSQL específico)
        // Solo las reservas confirmadas no pueden solaparse
        DB::statement("
            CREATE EXTENSION IF NOT EXISTS btree_gist;
        ");

        DB::statement("
            ALTER TABLE reservations
            ADD CONSTRAINT no_overlap_confirmed_reservations
            EXCLUDE USING GIST (
                daterange(arrival_date, departure_date, '[]') WITH &&
            )
            WHERE (status = 'confirmed');
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP EXTENSION IF EXISTS btree_gist CASCADE;");
        Schema::dropIfExists('reservations');
    }
};
