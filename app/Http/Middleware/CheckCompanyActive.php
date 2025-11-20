<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckCompanyActive
{
    /**
     * Handle an incoming request.
     *
     * Verifies that the authenticated user's company is active.
     * SuperAdmins without a company are allowed through.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Check if user has a company and if it's inactive
        if ($user->company_id && ! $user->company?->is_active) {
            // Logout the user
            if ($request->is('api/*')) {
                // API: Revoke current token
                $user->currentAccessToken()?->delete();
            } else {
                // Web: Logout from guard
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            throw new AuthenticationException('Unauthenticated.');
        }

        return $next($request);
    }
}
