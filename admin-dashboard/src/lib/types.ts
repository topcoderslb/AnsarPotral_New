// Application types - MySQL backend

export interface Store {
    id?: number | string;
    name: string;
    description: string;
    category: string;
    phoneNumber?: string;
    phone_number?: string;
    whatsappNumber?: string;
    whatsapp_number?: string;
    imageUrl?: string;
    image_url?: string;
    location: string;
    isActive?: boolean;
    is_active?: number | boolean;
    order?: number;
    sort_order?: number;
}

export interface StoreCategory {
    id?: number | string;
    name: string;
    order?: number;
    sort_order?: number;
}

export interface MunicipalityStatement {
    id?: number | string;
    title: string;
    description: string;
    imageUrls: string[];
    date?: string;
    category: string;
    isActive?: boolean;
    is_active?: number | boolean;
    order?: number;
    sort_order?: number;
}

export interface StatementCategory {
    id?: number | string;
    name: string;
    order?: number;
    sort_order?: number;
}

export interface Landmark {
    id?: number | string;
    title: string;
    imageUrl?: string;
    image_url?: string;
    phoneNumber?: string;
    phone_number?: string;
    hasCallButton?: boolean;
    has_call_button?: number | boolean;
    isActive?: boolean;
    is_active?: number | boolean;
    order?: number;
    sort_order?: number;
}

export interface CarouselImage {
    id?: number | string;
    imageUrl?: string;
    image_url?: string;
    order?: number;
    sort_order?: number;
    isActive?: boolean;
    is_active?: number | boolean;
}

export interface AboutSection {
    id?: number | string;
    title: string;
    icon: string;
    content: string[];
    isActive?: boolean;
    is_active?: number | boolean;
    order?: number;
    sort_order?: number;
}

export interface Complaint {
    id?: number | string;
    name: string;
    phone: string;
    complaintText?: string;
    complaint_text?: string;
    imageUrl?: string;
    image_url?: string;
    createdAt?: string;
    created_at?: string;
    status: 'new' | 'reviewed' | 'resolved';
    notes?: string;
}

export interface AppSettings {
    welcome_text_ar: string;
    welcome_text_en: string;
    contact_email: string;
    play_store_url: string;
    [key: string]: string;
}

// Helper to normalize DB snake_case to camelCase for display
export function normalizeStore(s: Store): Store {
    return {
        ...s,
        phoneNumber: s.phoneNumber || s.phone_number || '',
        whatsappNumber: s.whatsappNumber || s.whatsapp_number || '',
        imageUrl: s.imageUrl || s.image_url || '',
        isActive: s.isActive ?? (s.is_active === 1 || s.is_active === true),
        order: s.order ?? s.sort_order ?? 0,
    };
}

export function normalizeLandmark(l: Landmark): Landmark {
    return {
        ...l,
        imageUrl: l.imageUrl || l.image_url || '',
        phoneNumber: l.phoneNumber || l.phone_number || '',
        hasCallButton: l.hasCallButton ?? (l.has_call_button === 1 || l.has_call_button === true),
        isActive: l.isActive ?? (l.is_active === 1 || l.is_active === true),
        order: l.order ?? l.sort_order ?? 0,
    };
}

export function normalizeComplaint(c: Complaint): Complaint {
    return {
        ...c,
        complaintText: c.complaintText || c.complaint_text || '',
        imageUrl: c.imageUrl || c.image_url || '',
        createdAt: c.createdAt || c.created_at || '',
    };
}

export function normalizeCarousel(c: CarouselImage): CarouselImage {
    return {
        ...c,
        imageUrl: c.imageUrl || c.image_url || '',
        isActive: c.isActive ?? (c.is_active === 1 || c.is_active === true),
        order: c.order ?? c.sort_order ?? 0,
    };
}

export function normalizeAboutSection(s: AboutSection): AboutSection {
    return {
        ...s,
        isActive: s.isActive ?? (s.is_active === 1 || s.is_active === true),
        order: s.order ?? s.sort_order ?? 0,
        content: s.content || [],
    };
}
