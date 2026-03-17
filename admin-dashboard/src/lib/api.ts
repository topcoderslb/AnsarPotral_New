// API client configuration - replaces Firebase
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/ansar_portal_api';

export const API_URL = API_BASE;

export function getApiUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${API_BASE}/api/${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }
    return url.toString();
}

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

export function setToken(token: string): void {
    localStorage.setItem('auth_token', token);
}

export function removeToken(): void {
    localStorage.removeItem('auth_token');
}

export function getAuthHeaders(): HeadersInit {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Generic API fetch helper
export async function apiFetch<T>(
    endpoint: string,
    options?: {
        method?: string;
        body?: unknown;
        params?: Record<string, string>;
    }
): Promise<T> {
    const url = getApiUrl(endpoint, options?.params);
    const response = await fetch(url, {
        method: options?.method || 'GET',
        headers: getAuthHeaders(),
        body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

// Upload image to local server
export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(getApiUrl('upload.php'), {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Upload failed');
    }

    const result = await response.json();
    if (result.success) {
        return result.url;
    }
    throw new Error(result.error || 'Upload failed');
}
