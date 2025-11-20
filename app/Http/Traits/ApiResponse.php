<?php

namespace App\Http\Traits;

use Illuminate\Http\JsonResponse;

/**
 * API Response Trait
 *
 * Implements JSend specification for consistent API responses.
 *
 * @see https://github.com/omniti-labs/jsend
 *
 * Response Types:
 * - success: Operation completed successfully (2xx status codes)
 * - fail: Client error - user can fix the request (4xx status codes)
 * - error: Server error - internal server problem (5xx status codes)
 *
 * Usage Guidelines:
 * ┌─────────────┬──────────────┬─────────────────────────────────────────────┐
 * │ HTTP Code   │ Method       │ Use Case                                    │
 * ├─────────────┼──────────────┼─────────────────────────────────────────────┤
 * │ 200, 201    │ success()    │ Request succeeded                           │
 * │ 400         │ fail()       │ Bad request (malformed data)                │
 * │ 401         │ fail()       │ Authentication required                     │
 * │ 403         │ fail()       │ Forbidden (authenticated but no permission) │
 * │ 404         │ fail()       │ Resource not found                          │
 * │ 422         │ fail()       │ Validation errors                           │
 * │ 429         │ fail()       │ Too many requests (rate limit)              │
 * │ 500, 502... │ error()      │ Internal server error                       │
 * └─────────────┴──────────────┴─────────────────────────────────────────────┘
 *
 * Examples:
 *
 * Success:
 *   return $this->successResponse($user, 200);
 *   // {"status": "success", "data": {...}}
 *
 * Fail (client error):
 *   return $this->failResponse('Invalid email', ['email' => ['Email is required']], 422);
 *   // {"status": "fail", "message": "Invalid email", "errors": {...}}
 *
 * Error (server error):
 *   return $this->errorResponse('Database connection failed', 500);
 *   // {"status": "error", "message": "Database connection failed"}
 */
trait ApiResponse
{
    /**
     * Standard success response for successful operations.
     *
     * Use for 2xx status codes (200, 201, 204, etc.)
     *
     * @param  mixed  $data  The response data
     * @param  int  $code  HTTP status code (default: 200)
     */
    protected function successResponse($data, int $code = 200): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $data,
        ], $code);
    }

    /**
     * Standard error response for server-side errors.
     *
     * Use ONLY for 5xx status codes (500, 502, 503, etc.)
     * These indicate problems with the server, not the client's request.
     *
     * @param  string  $message  Error description
     * @param  int  $code  HTTP status code (default: 500)
     */
    protected function errorResponse(string $message, int $code = 500): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
        ], $code);
    }

    /**
     * Standard fail response for client-side errors.
     *
     * Use for 4xx status codes (400, 401, 403, 404, 422, 429, etc.)
     * These indicate the client made an error that they can correct.
     *
     * Common use cases:
     * - 400: Bad request (malformed data)
     * - 401: Unauthenticated (login required)
     * - 403: Unauthorized (no permission)
     * - 404: Resource not found
     * - 422: Validation failed
     * - 429: Rate limit exceeded
     *
     * @param  string  $message  User-friendly error message
     * @param  array  $errors  Detailed validation errors (optional)
     * @param  int  $code  HTTP status code (default: 422)
     */
    protected function failResponse(string $message, array $errors = [], int $code = 422): JsonResponse
    {
        return response()->json([
            'status' => 'fail',
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }
}
