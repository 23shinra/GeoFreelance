export type CategoryOption = {
    id: number;
    name: string;
    slug?: string;
};

export type BusinessCard = {
    id: number;
    name: string;
    address: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    phone: string | null;
    phone_normalized?: string | null;
    whatsapp_url?: string | null;
    website: string | null;
    social_links: string[];
    status: string;
    status_label: string;
    category: string | null;
    source_url?: string | null;
    ignore_reason?: string | null;
    last_checked_at: string | null;
};

export type ImportSummary = {
    id: number;
    original_filename: string;
    status: string;
    status_label: string;
    stats: Record<string, number> | null;
    error_message?: string | null;
    created_at: string | null;
    finished_at?: string | null;
};

export type Paginated<T> = {
    data: T[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    current_page: number;
    last_page: number;
    total: number;
};
