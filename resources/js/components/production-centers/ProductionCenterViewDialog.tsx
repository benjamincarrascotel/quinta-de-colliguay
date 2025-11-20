import { useEffect, useMemo, useState } from 'react';

import { useDataTable } from '@/components/data-table-context';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageDialog } from '@/components/ui/message-dialog';
import * as productionCenterRoutes from '@/routes/production_centers';
import { ProductionCenter } from '@/types';

interface ProductionCenterViewDialogProps {
    productionCenter: ProductionCenter;
}

type ProductionCenterFormData = {
    name: string;
};

export function ProductionCenterViewDialog({ productionCenter }: ProductionCenterViewDialogProps) {
    const [open, setOpen] = useState(false);
    const formId = useMemo(() => `pc-${productionCenter.id}-edit-form`, [productionCenter.id]);

    const initialData = useMemo<ProductionCenterFormData>(
        () => ({
            name: productionCenter.name,
        }),
        [productionCenter.name],
    );

    const identity = useMemo(() => `${productionCenter.id}|${productionCenter.updated_at ?? ''}`, [productionCenter.id, productionCenter.updated_at]);

    const { useFormWithFilters } = useDataTable();

    const { data, setData, put, errors, processing, recentlySuccessful, reset, isDirty } = useFormWithFilters(initialData, {
        identity,
    });

    useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open, reset]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(productionCenterRoutes.update({ production_center: Number(productionCenter.id) }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    const dialogActions = [
        {
            label: 'Guardar',
            variant: 'default' as const,
            type: 'submit' as const,
            form: formId,
            disabled: processing || !isDirty,
        },
        {
            label: 'Cancelar',
            variant: 'secondary' as const,
            closesDialog: true,
            onClick: () => reset(),
        },
    ];

    return (
        <MessageDialog
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Button size="sm" variant="default">
                    Ver
                </Button>
            }
            title="Detalles del Centro de Producción"
            description={
                <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`${formId}-name`}>Nombre</Label>
                        <Input
                            id={`${formId}-name`}
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            required
                            placeholder="Nombre del centro"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`${formId}-company_id`}>Compañía</Label>
                        <Input id={`${formId}-company_id`} value={productionCenter.company?.name ?? '—'} disabled />
                    </div>
                    {recentlySuccessful && <p className="text-sm text-green-600">Cambios guardados</p>}
                </form>
            }
            actions={dialogActions}
        />
    );
}
