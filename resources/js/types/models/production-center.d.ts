import { type Company } from '@/types';

export type ProductionCenter = {
    id: number;
    name: string;
    company_id: number;
    created_at?: string;
    updated_at?: string;
    company?: Company | null;
};
