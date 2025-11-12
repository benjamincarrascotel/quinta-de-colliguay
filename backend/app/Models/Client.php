<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'whatsapp',
        'email',
        'city',
    ];

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    /**
     * Cliente puede tener muchas reservas
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    // ==========================================
    // SCOPES
    // ==========================================

    /**
     * Búsqueda por email o whatsapp
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('email', 'like', "%{$search}%")
              ->orWhere('whatsapp', 'like', "%{$search}%")
              ->orWhere('name', 'like', "%{$search}%");
        });
    }

    /**
     * Clientes de una ciudad específica
     */
    public function scopeFromCity($query, string $city)
    {
        return $query->where('city', $city);
    }

    // ==========================================
    // ACCESSORS & MUTATORS
    // ==========================================

    /**
     * Formatea el whatsapp con +56
     */
    public function getFormattedWhatsappAttribute(): string
    {
        return '+56' . $this->whatsapp;
    }

    /**
     * URL de WhatsApp click-to-chat
     */
    public function getWhatsappUrlAttribute(): string
    {
        return 'https://wa.me/56' . $this->whatsapp;
    }
}
