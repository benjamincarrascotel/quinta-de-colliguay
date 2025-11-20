import { usePage } from '@inertiajs/react';

import { PageProps, User } from '@/types';

export function useAuth() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user as User & { is_super_admin?: boolean; is_admin?: boolean };

    return {
        user,
        isSuperAdmin: user?.is_super_admin ?? false,
        isAdmin: user?.is_admin ?? false,
    };
}
