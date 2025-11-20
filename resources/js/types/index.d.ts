import { User } from './models';

export * from './inertia';
export * from './models';
export * from './navigation';

export interface Auth {
    user: User;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    flash: FlashMessage;
    [key: string]: unknown;
}

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterDefinition {
    key: string;
    placeholder: string;
    options: FilterOption[];
    defaultValue?: string;
    dependsOn?: string;
    allowClear?: boolean;
}

export type ResourceCollection<T> = {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
};

export type FlashMessage = {
    message: string | null;
    type: 'success' | 'error' | 'warning' | 'info' | null;
};
