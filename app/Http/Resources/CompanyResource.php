<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'is_active' => $this->is_active,
        ];

        // Inertia Only Info
        if (! $request->is('api/*')) {
            $data['created_at'] = $this->created_at;
            $data['updated_at'] = $this->updated_at;
        }

        return $data;
    }
}
