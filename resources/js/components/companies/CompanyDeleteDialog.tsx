import { useDataTable } from '@/components/data-table-context';
import { Button } from '@/components/ui/button';
import { MessageDialog } from '@/components/ui/message-dialog';
import * as companyRoutes from '@/routes/companies';
import { Company } from '@/types';
import { useState } from 'react';

interface CompanyDeleteDialogProps {
    company: Company;
}

export function CompanyDeleteDialog({ company }: CompanyDeleteDialogProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { deleteWithFilters } = useDataTable();

    const handleDelete = () => {
        setIsDeleting(true);
        deleteWithFilters(companyRoutes.destroy({ company: company.id }).url, {
            preserveScroll: true,
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
            title="¿Eliminar esta compañía?"
            description={
                <>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Estás a punto de eliminar la compañía <span className="font-semibold text-red-600">{company.name}</span>. Esta acción es
                        permanente y no se puede deshacer.
                    </p>
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
