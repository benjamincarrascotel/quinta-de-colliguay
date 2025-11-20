export interface Role {
    id: number | string;
    name: string;
    label?: string;
    [key: string]: unknown;
}
