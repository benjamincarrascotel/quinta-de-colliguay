import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageDialog } from '@/components/ui/message-dialog';
import { destroy as destroyProfile } from '@/routes/profile';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const {
        data,
        setData,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        password: '',
    });

    const deleteUser = () => {
        destroy(destroyProfile().url, {
            preserveScroll: true,
            onSuccess: () => {
                setDialogOpen(false);
                reset();
            },
            onError: () => passwordInput.current?.focus(),
        });
    };

    const handleCancel = () => {
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title="Eliminar cuenta" description="Elimina tu cuenta y todos sus recursos" />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Atención</p>
                    <p className="text-sm">Por favor, procede con precaución, esto no se puede deshacer.</p>
                </div>

                <MessageDialog
                    open={isDialogOpen}
                    onOpenChange={setDialogOpen}
                    trigger={<Button variant="destructive">Eliminar cuenta</Button>}
                    title="¿Estás seguro de que quieres eliminar tu cuenta?"
                    description={
                        <>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Una vez que tu cuenta sea eliminada, todos sus recursos y datos también serán eliminados permanentemente. Por favor,
                                introduce tu contraseña para confirmar que deseas eliminar tu cuenta de forma permanente.
                            </p>
                            <form id="delete-user-form">
                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="sr-only">
                                        Password
                                    </Label>

                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Contraseña"
                                        autoComplete="current-password"
                                    />

                                    <InputError message={errors.password} />
                                </div>
                            </form>
                        </>
                    }
                    actions={[
                        {
                            label: 'Eliminar cuenta',
                            variant: 'destructive',
                            onClick: deleteUser,
                            disabled: processing,
                        },
                        {
                            label: 'Cancelar',
                            variant: 'secondary',
                            onClick: handleCancel,
                            closesDialog: true,
                        },
                    ]}
                />
            </div>
        </div>
    );
}
