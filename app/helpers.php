<?php

use Illuminate\Http\JsonResponse;

if (! function_exists('successResponse')) {
    /**
     * Standard success response.
     *
     * @param  mixed  $data
     */
    function successResponse($data, int $code = 200): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $data,
        ], $code);
    }
}

if (! function_exists('errorResponse')) {
    /**
     * Standard error response for server-side errors.
     */
    function errorResponse(string $message, int $code = 500): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
        ], $code);
    }
}

if (! function_exists('failResponse')) {
    /**
     * Standard fail response for client-side errors (e.g., validation).
     */
    function failResponse(string $message, array $errors = [], int $code = 422): JsonResponse
    {
        return response()->json([
            'status' => 'fail',
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }
}
