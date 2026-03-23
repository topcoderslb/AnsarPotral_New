'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getApiUrl, getToken, setToken, removeToken } from '@/lib/api';

interface AuthUser {
    user_id: number;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getToken();

        if (!token) {
            setLoading(false);
            return;
        }

        // Immediately restore from cache so the dashboard never flickers to login
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
                setLoading(false); // show content right away
            } catch {
                // corrupt cache — will be fixed by verify below
            }
        }

        // Verify token in background
        fetch(getApiUrl('auth.php', { action: 'verify' }), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.user) {
                    setUser(data.user);
                    localStorage.setItem('auth_user', JSON.stringify(data.user));
                } else {
                    // Token definitively rejected by server — log out
                    removeToken();
                    localStorage.removeItem('auth_user');
                    setUser(null);
                }
            })
            .catch(() => {
                // Network error — keep the cached user; don't force logout
            })
            .finally(() => setLoading(false));
    }, []);

    const signIn = async (email: string, password: string) => {
        const response = await fetch(getApiUrl('auth.php', { action: 'login' }), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Login failed');
        }

        setToken(data.token);
        const authUser = {
            user_id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
        };
        localStorage.setItem('auth_user', JSON.stringify(authUser));
        setUser(authUser);
    };

    const signOut = async () => {
        removeToken();
        localStorage.removeItem('auth_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
