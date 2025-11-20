export interface Company {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}
