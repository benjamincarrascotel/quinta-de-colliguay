<?php

namespace App\Exceptions;

use App\Http\Traits\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    use ApiResponse;

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        // keep empty or add your own suppressed classes
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        // REPORT pipeline: build a clean, line-by-line context and pass the Throwable
        $this->reportable(function (Throwable $throwable) {
            if ($this->shouldntReport($throwable)) {
                return;
            }

            $currentRequest = request();

            // Raw context array that we will pretty-print into a multi-line block
            $rawContext = [
                'request_id' => (string) Str::uuid(),
                'message' => $throwable->getMessage(),
                'code' => $throwable->getCode(),
                'file' => $throwable->getFile().':'.$throwable->getLine(),
                'url' => $currentRequest->fullUrl(),
                'method' => $currentRequest->method(),
                'ip' => $currentRequest->ip(),
                'user' => $currentRequest->user()
                    ? ['id' => $currentRequest->user()->id, 'email' => $currentRequest->user()->email]
                    : null,
                'input' => $currentRequest->except(['password', 'password_confirmation', 'current_password']),
                // Do NOT add a stringified trace here; we pass the Throwable below
            ];

            Log::error('Unhandled Exception', [
                // Line-by-line block, ready to paste
                'context_lines' => $this->formatContextAsLines($rawContext),

                // Pass the real Throwable so the formatter can print the stack trace
                'exception' => $throwable,
            ]);
        });

        // API JSON rendering
        $this->renderable(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                return $this->handleApiException($e);
            }
        });
    }

    /**
     * Convert context array to a readable "key: value" multi-line block.
     */
    private function formatContextAsLines(array $context): string
    {
        $lines = collect($context)->map(function ($value, string $key) {
            return sprintf('%s: %s', $key, $this->stringifyForLog($value));
        });

        return $lines->implode(PHP_EOL);
    }

    /**
     * Normalize any value (scalar/array/object) into a readable string for logs.
     */
    private function stringifyForLog(mixed $value): string
    {
        if ($value === null) {
            return 'null';
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_scalar($value)) {
            return (string) $value;
        }

        // Arrays/objects -> pretty JSON, keep Unicode and slashes
        return json_encode(
            $value,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
        ) ?: '[unserializable]';
    }

    private function handleApiException(Throwable $e)
    {
        switch (true) {
            case $e instanceof AuthenticationException:
                return $this->failResponse('Error de autenticación.', [], 401);

            case $e instanceof AuthorizationException:
                return $this->failResponse('No tienes permiso para realizar esta acción.', [], 403);

            case $e instanceof ValidationException:
                return $this->failResponse('Los datos proporcionados no son válidos.', $e->errors(), 422);

            case $e instanceof ModelNotFoundException:
            case $e instanceof NotFoundHttpException:
                return $this->failResponse('El recurso solicitado no fue encontrado.', [], 404);

            case $e instanceof MethodNotAllowedHttpException:
                return $this->failResponse('El método HTTP no está permitido para esta ruta.', [], 405);

            case $e instanceof ThrottleRequestsException:
                return $this->failResponse('Demasiados intentos. Por favor, inténtalo de nuevo más tarde.', [], 429);

            case $e instanceof HttpException:
                return $this->errorResponse($e->getMessage(), $e->getStatusCode());

            default:
                return $this->errorResponse('Ocurrió un error inesperado en el servidor.', 500);
        }
    }
}
