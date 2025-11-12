<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'arrival_date',
        'arrival_block',
        'departure_date',
        'departure_block',
        'adults',
        'children',
        'status',
        'estimated_amount',
        'final_amount',
        'deposit_amount',
        'deposit_date',
        'deposit_method',
        'deposit_reference',
        'client_observations',
        'admin_observations',
        'cancellation_reason',
        'cancelled_at',
    ];

    protected $casts = [
        'arrival_date' => 'date',
        'departure_date' => 'date',
        'deposit_date' => 'date',
        'cancelled_at' => 'datetime',
        'adults' => 'integer',
        'children' => 'integer',
        'estimated_amount' => 'integer',
        'final_amount' => 'integer',
        'deposit_amount' => 'integer',
    ];

    protected $appends = [
        'total_guests',
        'duration_days',
        'is_confirmed',
        'is_cancelled',
        'is_refundable',
    ];

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'auditable_id')
            ->where('auditable_type', self::class);
    }

    // ==========================================
    // SCOPES
    // ==========================================

    public function scopeRequested($query)
    {
        return $query->where('status', 'requested');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeInDateRange($query, Carbon $start, Carbon $end)
    {
        return $query->where(function ($q) use ($start, $end) {
            $q->whereBetween('arrival_date', [$start, $end])
              ->orWhereBetween('departure_date', [$start, $end])
              ->orWhere(function ($q) use ($start, $end) {
                  $q->where('arrival_date', '<=', $start)
                    ->where('departure_date', '>=', $end);
              });
        });
    }

    public function scopeUpcoming($query)
    {
        return $query->where('arrival_date', '>=', now()->toDateString())
                     ->whereIn('status', ['requested', 'confirmed'])
                     ->orderBy('arrival_date');
    }

    public function scopePast($query)
    {
        return $query->where('departure_date', '<', now()->toDateString())
                     ->orderBy('departure_date', 'desc');
    }

    // ==========================================
    // ACCESSORS
    // ==========================================

    protected function totalGuests(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->adults + $this->children,
        );
    }

    protected function durationDays(): Attribute
    {
        return Attribute::make(
            get: function () {
                $arrival = Carbon::parse($this->arrival_date);
                $departure = Carbon::parse($this->departure_date);
                $days = $arrival->diffInDays($departure);

                // Ajustar por bloques
                $adjustment = 0;
                if ($this->arrival_block === 'night') {
                    $adjustment += 0.5;
                }
                if ($this->departure_block === 'morning') {
                    $adjustment += 0.5;
                }

                return $days - $adjustment;
            }
        );
    }

    protected function isConfirmed(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'confirmed',
        );
    }

    protected function isCancelled(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'cancelled',
        );
    }

    protected function isRefundable(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->status !== 'cancelled' || !$this->cancelled_at) {
                    return false;
                }

                $daysBeforeArrival = Carbon::parse($this->arrival_date)
                    ->diffInDays($this->cancelled_at, false);

                // Si se canceló 7+ días antes, es reembolsable
                return $daysBeforeArrival >= 7;
            }
        );
    }

    // ==========================================
    // MÉTODOS DE NEGOCIO
    // ==========================================

    /**
     * Marca la reserva como confirmada
     */
    public function confirm(array $depositData): void
    {
        $this->update([
            'status' => 'confirmed',
            'deposit_amount' => $depositData['deposit_amount'],
            'deposit_date' => $depositData['deposit_date'],
            'deposit_method' => $depositData['deposit_method'] ?? null,
            'deposit_reference' => $depositData['deposit_reference'] ?? null,
            'final_amount' => $depositData['final_amount'] ?? $this->estimated_amount,
        ]);
    }

    /**
     * Cancela la reserva
     */
    public function cancel(string $reason): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_at' => now(),
        ]);
    }

    /**
     * Verifica si la reserva se solapa con otra
     */
    public function overlapsWith(self $other): bool
    {
        return $this->arrival_date <= $other->departure_date &&
               $this->departure_date >= $other->arrival_date;
    }
}
