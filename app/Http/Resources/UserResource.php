<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'role' => $this->role_for_display,
            'name' => $this->name,
            'last_name' => $this->last_name,
            'email' => $this->email,
        ];

        // API: Send only database fields
        if ($request->is('api/*')) {
            $data['company_id'] = $this->company_id;
            $data['phone'] = $this->phone;
            $data['phone_area_code'] = $this->phone_area_code;
        } else {
            // Web/Inertia: Send full objects
            $data['id'] = $this->id;
            $data['phone_number'] = $this->phone_number;
            $data['company'] = new CompanyResource($this->whenLoaded('company'));
            $data['production_centers'] = ProductionCenterResource::collection($this->whenLoaded('productionCenters'));
            $data['is_superadmin'] = $this->isSuperAdmin();
            $data['is_admin'] = $this->isAdmin();
            $data['created_at'] = $this->created_at;
            $data['updated_at'] = $this->updated_at;

            if ($request->boolean('with_form_data')) {
                $data['role_id'] = $this->role_id;
                $data['company_id'] = $this->company_id;
                $data['role_name'] = $this->role?->name;
                $data['role_for_display'] = $this->role_for_display;
                $data['phone'] = $this->phone;
                $data['phone_area_code'] = $this->phone_area_code;
                $data['email_verified_at'] = $this->email_verified_at;
            }
        }

        return $data;
    }
}
