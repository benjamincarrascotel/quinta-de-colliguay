import { ResourceCollection } from '..';
import { Company } from './company';
import { ProductionCenter } from './production-center';
import { Role } from './role';

export interface User {
    id: number;
    is_superadmin?: boolean;
    is_admin?: boolean;
    name: string;
    last_name: string;
    email: string;
    email_verified_at?: string | null;
    phone_area_code?: string | null;
    phone?: string | null;
    phone_number: string | null;
    role_id?: number;
    role_name?: string | null;
    company_id?: number | null;
    company?: Company | null;
    production_centers?: ResourceCollection<ProductionCenter>;
    created_at: string;
    updated_at: string;
    role: string | Role;
    role_for_display?: string | null;
    [key: string]: unknown;
}
