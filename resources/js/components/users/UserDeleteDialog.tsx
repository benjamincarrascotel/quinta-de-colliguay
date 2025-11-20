import { useState } from 'react';

import { useDataTable } from '@/components/data-table-context';
import { Button } from '@/components/ui/button';
import { MessageDialog } from '@/components/ui/message-dialog';
import * as userRoutes from '@/routes/users';
import { type User } from '@/types';

interface UserDeleteDialogProps {
    user: User;
    onDeleted?: () => void;
}

export function UserDeleteDialog({ user, onDeleted }: UserDeleteDialogProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { deleteWithFilters } = useDataTable();

    const handleDelete = () => {
        setIsDeleting(true);
        deleteWithFilters(userRoutes.destroy({ user: String(user.id) }).url, {
            onSuccess: () => {
                setOpen(false);
                onDeleted?.();
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <MessageDialog
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Button size="sm" variant="destructive" disabled={isDeleting}>
                    Eliminar
                </Button>
            }
            title="¿Eliminar este usuario?"
            description={
                <>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Estás a punto de eliminar al usuario <span className="font-semibold text-red-600">{user.name}</span>.
                    </p>
                    <p className="text-sm font-semibold text-muted-foreground">Esta acción es permanente y no se puede deshacer.</p>
                    <p className="text-sm text-muted-foreground">Confirma si deseas continuar.</p>
                </>
            }
            actions={[
                {
                    label: 'Eliminar',
                    variant: 'destructive' as const,
                    onClick: handleDelete,
                    disabled: isDeleting,
                },
                {
                    label: 'Cancelar',
                    variant: 'secondary' as const,
                    closesDialog: true,
                },
            ]}
        />
    );
}
