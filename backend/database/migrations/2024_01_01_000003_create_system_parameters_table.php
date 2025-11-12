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
        Schema::create('system_parameters', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->string('type')->default('string'); // string, integer, boolean, json
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Insertar parámetros por defecto
        DB::table('system_parameters')->insert([
            [
                'key' => 'adult_price_per_day',
                'value' => '20000',
                'type' => 'integer',
                'description' => 'Precio por adulto por día (CLP)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'child_price_per_day',
                'value' => '10000',
                'type' => 'integer',
                'description' => 'Precio por niño por día (CLP)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'min_adults',
                'value' => '20',
                'type' => 'integer',
                'description' => 'Mínimo de adultos requeridos',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'max_total_people',
                'value' => '60',
                'type' => 'integer',
                'description' => 'Máximo total de personas (adultos + niños)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'min_nights',
                'value' => '2',
                'type' => 'integer',
                'description' => 'Mínimo de noches requeridas',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'buffer_half_day',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Aplicar buffer de medio día para limpieza',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'max_child_age',
                'value' => '10',
                'type' => 'integer',
                'description' => 'Edad máxima considerada como niño',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'timezone',
                'value' => 'America/Santiago',
                'type' => 'string',
                'description' => 'Zona horaria del sistema',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'cancellation_refundable_days',
                'value' => '7',
                'type' => 'integer',
                'description' => 'Días mínimos antes de la llegada para cancelación con reembolso',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_parameters');
    }
};
