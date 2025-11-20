import { useState } from 'react';

import { useDataTable } from '@/components/data-table-context';
import { Button } from '@/components/ui/button';
import { MessageDialog } from '@/components/ui/message-dialog';
import * as productionCenterRoutes from '@/routes/production_centers';
import { ProductionCenter } from '@/types';

interface ProductionCenterDeleteDialogProps {
    productionCenter: ProductionCenter;
}

export function ProductionCenterDeleteDialog({ productionCenter }: ProductionCenterDeleteDialogProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { deleteWithFilters } = useDataTable();

    const handleDelete = () => {
        setIsDeleting(true);
        deleteWithFilters(productionCenterRoutes.destroy({ production_center: Number(productionCenter.id) }).url, {
            onSuccess: () => {
                setOpen(false);
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
            title="¿Eliminar este centro de producción?"
            description={
                <>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Estás a punto de eliminar el centro <span className="font-semibold text-red-600">{productionCenter.name}</span>.
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
