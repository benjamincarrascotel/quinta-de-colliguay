<?php

namespace App\Helpers;

use Carbon\Carbon;

class BusinessDaysCalculator
{
    /**
     * Calculate how many business days are between two dates
     * (Excludes Saturdays and Sundays)
     */
    public static function calculateBusinessDaysDifference(Carbon $startDate, Carbon $endDate): int
    {
        $start = $startDate->copy()->startOfDay();
        $end = $endDate->copy()->startOfDay();

        if ($start->greaterThanOrEqualTo($end)) {
            return 0;
        }

        $businessDays = 0;
        $current = $start->copy()->addDay(); // Start counting from next day (exclusive)

        while ($current->lessThanOrEqualTo($end)) {
            // Only count if NOT Saturday (6) or Sunday (0)
            if ($current->dayOfWeek !== Carbon::SATURDAY && $current->dayOfWeek !== Carbon::SUNDAY) {
                $businessDays++;
            }
            $current->addDay();
        }

        return $businessDays;
    }

    /**
     * Add N business days to a date
     * (Skips Saturdays and Sundays)
     */
    public static function addBusinessDays(Carbon $startDate, int $businessDays): Carbon
    {
        if ($businessDays < 0) {
            $businessDays = 0;
        }

        $result = $startDate->copy()->startOfDay();
        $daysAdded = 0;

        while ($daysAdded < $businessDays) {
            $result->addDay();

            // Only count if NOT Saturday or Sunday
            if ($result->dayOfWeek !== Carbon::SATURDAY && $result->dayOfWeek !== Carbon::SUNDAY) {
                $daysAdded++;
            }
        }

        return $result;
    }

    /**
     * Subtract N business days from a date
     * (Skips Saturdays and Sundays)
     */
    public static function subtractBusinessDays(Carbon $startDate, int $businessDays): Carbon
    {
        if ($businessDays < 0) {
            $businessDays = 0;
        }

        $result = $startDate->copy()->startOfDay();
        $daysSubtracted = 0;

        while ($daysSubtracted < $businessDays) {
            $result->subDay();

            // Only count if NOT Saturday or Sunday
            if ($result->dayOfWeek !== Carbon::SATURDAY && $result->dayOfWeek !== Carbon::SUNDAY) {
                $daysSubtracted++;
            }
        }

        return $result;
    }
}
