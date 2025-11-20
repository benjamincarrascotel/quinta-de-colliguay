import { VisitOptions } from '@inertiajs/core';
import { InertiaFormProps, useForm } from '@inertiajs/react';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';

export type ActiveFilters = Record<string, string>;

type DataTableVisitOptions = Omit<VisitOptions, 'method' | 'data'> & {
    data?: Record<string, unknown>;
};

type UseFormWithFiltersOptions<TForm extends Record<string, unknown>> = {
    identity?: unknown;
    makeDefaults?: (initial: TForm) => TForm;
};

type FormWithFilters<TForm extends Record<string, unknown>> = TForm & {
    filters: ActiveFilters;
};

export interface DataTableContextValue {
    activeFilters: ActiveFilters;
    refresh: () => void;
    patchWithFilters: (url: string, options?: DataTableVisitOptions) => void;
    deleteWithFilters: (url: string, options?: DataTableVisitOptions) => void;
    useFormWithFilters: <TForm extends Record<string, unknown>>(
        initial: TForm,
        options?: UseFormWithFiltersOptions<TForm>,
    ) => InertiaFormProps<FormWithFilters<TForm>>;
}

export const DataTableContext = createContext<DataTableContextValue | null>(null);

export function useDataTable(): DataTableContextValue {
    const context = useContext(DataTableContext);

    if (!context) {
        throw new Error('useDataTable must be used within a <DataTableContext.Provider>');
    }

    return context;
}

export function useFormWithFiltersFactory(activeFilters: ActiveFilters): DataTableContextValue['useFormWithFilters'] {
    // Memoize filters para referencia estable
    const filtersSnapshot = useMemo(() => ({ ...activeFilters }), [activeFilters]);

    return function useFormWithFilters<TForm extends Record<string, unknown>>(initial: TForm, options?: UseFormWithFiltersOptions<TForm>) {
        const { identity = null, makeDefaults } = options ?? {};

        const initialDefaults = useMemo(() => {
            const base = (makeDefaults ? makeDefaults(initial) : initial) as TForm;

            return {
                ...base,
                filters: { ...filtersSnapshot },
            } as FormWithFilters<TForm>;
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [initial, makeDefaults, filtersSnapshot]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const form = useForm(initialDefaults as any) as InertiaFormProps<FormWithFilters<TForm>>;

        const defaultsSignatureRef = useRef(JSON.stringify({ identity, defaults: initialDefaults }));

        useEffect(() => {
            const base = (makeDefaults ? makeDefaults(initial) : initial) as TForm;
            const nextDefaults = {
                ...base,
                filters: { ...filtersSnapshot },
            } as FormWithFilters<TForm>;

            const nextSignature = JSON.stringify({ identity, defaults: nextDefaults });

            if (nextSignature !== defaultsSignatureRef.current) {
                defaultsSignatureRef.current = nextSignature;
                form.setDefaults(nextDefaults as Partial<FormWithFilters<TForm>>);
                form.setData(nextDefaults);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [filtersSnapshot, form, identity, initial, makeDefaults]);

        useEffect(() => {
            form.transform((data) => ({
                ...data,
                filters: { ...filtersSnapshot },
            }));
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [form, filtersSnapshot]);

        return form;
    };
}
