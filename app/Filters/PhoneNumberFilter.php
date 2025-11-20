<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\Filters\Filter;

class PhoneNumberFilter implements Filter
{
    public function __invoke(Builder $query, $value, string $property): void
    {
        $query->where(DB::raw('CONCAT(phone_area_code, phone)'), 'like', "%{$value}%");
    }
}
