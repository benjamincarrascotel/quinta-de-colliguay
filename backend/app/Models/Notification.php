<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'reservation_id',
        'type',
        'recipient_email',
        'recipient_name',
        'subject',
        'body',
        'attachments',
        'status',
        'sent_at',
        'error_message',
        'attempts',
    ];

    protected $casts = [
        'attachments' => 'array',
        'sent_at' => 'datetime',
        'attempts' => 'integer',
    ];

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    // ==========================================
    // SCOPES
    // ==========================================

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // ==========================================
    // MÉTODOS DE NEGOCIO
    // ==========================================

    /**
     * Marca como enviado
     */
    public function markAsSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    /**
     * Marca como fallido
     */
    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
            'attempts' => $this->attempts + 1,
        ]);
    }

    /**
     * Puede reintentar envío?
     */
    public function canRetry(): bool
    {
        return $this->status === 'failed' && $this->attempts < 3;
    }

    /**
     * Reiniciar para reenvío
     */
    public function resetForRetry(): void
    {
        $this->update([
            'status' => 'pending',
            'error_message' => null,
        ]);
    }
}
