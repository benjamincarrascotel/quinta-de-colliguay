<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user ? array_merge(
                    $user->load('role')->toArray(),
                    [
                        'is_super_admin' => $user->isSuperAdmin(),
                        'is_admin' => $user->isAdmin(),
                        'role_for_display' => $user->role_for_display,
                    ]
                ) : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => fn () => $this->getFlashMessage($request),
        ];
    }

    /**
     * Get the flash message from the session.
     */
    protected function getFlashMessage(Request $request): ?array
    {
        $types = ['success', 'error', 'warning', 'info'];

        foreach ($types as $type) {
            if ($request->session()->has($type)) {
                return [
                    'message' => $request->session()->get($type),
                    'type' => $type,
                ];
            }
        }

        return null;
    }
}
