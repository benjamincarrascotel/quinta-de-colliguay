<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemParameter extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
    ];

    protected $casts = [
        'value' => 'string',
    ];

    // ==========================================
    // MÉTODOS ESTÁTICOS
    // ==========================================

    /**
     * Obtiene un parámetro con caché
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember(
            "system_parameter_{$key}",
            now()->addHours(24),
            function () use ($key, $default) {
                $parameter = self::where('key', $key)->first();

                if (!$parameter) {
                    return $default;
                }

                return self::castValue($parameter->value, $parameter->type);
            }
        );
    }

    /**
     * Actualiza un parámetro y limpia el caché
     */
    public static function set(string $key, mixed $value): void
    {
        $parameter = self::firstOrCreate(['key' => $key]);

        $parameter->update([
            'value' => (string) $value,
        ]);

        Cache::forget("system_parameter_{$key}");
    }

    /**
     * Obtiene todos los parámetros como array
     */
    public static function all(): array
    {
        return Cache::remember('all_system_parameters', now()->addHours(24), function () {
            $parameters = self::query()->get();

            return $parameters->mapWithKeys(function ($param) {
                return [
                    $param->key => self::castValue($param->value, $param->type),
                ];
            })->toArray();
        });
    }

    /**
     * Castea el valor según el tipo
     */
    private static function castValue(string $value, string $type): mixed
    {
        return match ($type) {
            'integer' => (int) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    // ==========================================
    // EVENTOS
    // ==========================================

    protected static function booted(): void
    {
        // Limpiar caché al crear, actualizar o eliminar
        static::saved(function () {
            Cache::forget('all_system_parameters');
        });

        static::deleted(function () {
            Cache::forget('all_system_parameters');
        });
    }
}
