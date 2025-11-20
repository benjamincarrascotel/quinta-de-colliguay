<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceJsonResponse
{
    /**
     * Handle an incoming request.
     *
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Force the request to accept a JSON response.
        // This ensures that API routes always return JSON,
        // even in case of validation errors or other exceptions.
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
