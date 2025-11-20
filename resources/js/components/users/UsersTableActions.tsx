import { useAuth } from '@/hooks/useAuth';
import { type User } from '@/types';
import { UserDeleteDialog } from './UserDeleteDialog';
import { UserViewDialog } from './UserViewDialog';

interface UsersTableActionsProps {
    user: User;
}

export function UsersTableActions({ user }: UsersTableActionsProps) {
    const { isAdmin: isActorAdmin } = useAuth();

    const isSuperAdmin = user.is_superadmin;
    const isAdmin = user.is_admin;

    const isAdminEditingAdmin = isActorAdmin && isAdmin;

    return (
        <div className="flex h-full w-full items-center justify-center gap-2">
            <UserViewDialog user={user} />
            {!isSuperAdmin && !isAdminEditingAdmin && <UserDeleteDialog user={user} />}
        </div>
    );
}
