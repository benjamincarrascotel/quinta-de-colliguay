<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display the booking wizard page
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('booking/index');
    }

    /**
     * Submit a new booking request
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function submit(Request $request)
    {
        // Validate request data
        $validated = $request->validate([
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'full_name' => 'required|string|min:3|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|min:8|max:20',
            'guest_count' => 'required|integer|min:1|max:20',
            'special_requests' => 'nullable|string|max:500',
        ]);

        // Generate unique confirmation code
        $confirmationCode = strtoupper(Str::random(8));

        // TODO: Save booking to database
        // For now, we'll just prepare the data
        $bookingData = [
            'confirmation_code' => $confirmationCode,
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'guest_count' => $validated['guest_count'],
            'special_requests' => $validated['special_requests'] ?? null,
            'created_at' => now()->toISOString(),
        ];

        // Log booking attempt
        Log::info('New booking request', $bookingData);

        // TODO: Send confirmation email
        // Mail::to($validated['email'])->send(new BookingConfirmation($bookingData));

        // Redirect to confirmation page
        return Inertia::render('booking/confirmation', [
            'booking' => $bookingData,
        ]);
    }

    /**
     * Get availability data for date range
     * TODO: Implement real availability logic
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function availability(Request $request)
    {
        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
        ]);

        // TODO: Query database for actual availability
        // For now, return mock data (handled by frontend store)

        return response()->json([
            'message' => 'Availability endpoint - frontend using mock data',
        ]);
    }
}
