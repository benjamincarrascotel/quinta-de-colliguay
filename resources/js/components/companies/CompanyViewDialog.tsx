import { useDataTable } from '@/components/data-table-context';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageDialog } from '@/components/ui/message-dialog';
import * as companyRoutes from '@/routes/companies';
import { Company } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import InputError from '../input-error';

interface CompanyViewDialogProps {
    company: Company;
}

export function CompanyViewDialog({ company }: CompanyViewDialogProps) {
    const [open, setOpen] = useState(false);
    const formId = useMemo(() => `company-${company.id}-edit-form`, [company.id]);

    const initialData = useMemo(
        () => ({
            name: company.name,
            is_active: company.is_active,
        }),
        [company.name, company.is_active],
    );

    const identity = useMemo(() => `${company.id}|${company.updated_at ?? ''}`, [company.id, company.updated_at]);

    const { useFormWithFilters } = useDataTable();

    const { data, setData, patch, errors, processing, recentlySuccessful, reset, isDirty } = useFormWithFilters(initialData, {
        identity,
    });

    useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open, reset]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        patch(companyRoutes.update({ company: company.id }).url, {
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
            title="Detalles de la Compañía"
            description={
                <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`${formId}-name`}>Nombre</Label>
                        <Input
                            id={`${formId}-name`}
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            required
                            placeholder="Nombre de la compañía"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`${formId}-is_active`}
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked === true)}
                        />
                        <Label htmlFor={`${formId}-is_active`} className="cursor-pointer text-sm font-normal">
                            Compañía activa
                        </Label>
                        <InputError message={errors.is_active} />
                    </div>
                    {recentlySuccessful && <p className="text-sm text-green-600">Cambios guardados</p>}
                </form>
            }
            actions={dialogActions}
        />
    );
}
