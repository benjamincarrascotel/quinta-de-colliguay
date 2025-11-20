<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class StripSensitiveApiParameters
{
    /**
     * Remove sensitive flags that should never be honored by public API calls.
     */
    public function handle(Request $request, Closure $next)
    {
        if ($request->query->has('with_form_data')) {
            $request->query->remove('with_form_data');
        }

        if ($request->request->has('with_form_data')) {
            $request->request->remove('with_form_data');
        }

        return $next($request);
    }
}
