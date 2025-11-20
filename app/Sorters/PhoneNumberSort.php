<?php

namespace App\Sorters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\Sorts\Sort;

class PhoneNumberSort implements Sort
{
    public function __invoke(Builder $query, bool $descending, string $property)
    {
        $direction = $descending ? 'DESC' : 'ASC';

        $query->orderBy(DB::raw('CONCAT(phone_area_code, phone)'), $direction);
    }
}
