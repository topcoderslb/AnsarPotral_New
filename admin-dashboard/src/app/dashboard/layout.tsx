'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';

// Pages that require a specific permission key for sub_admins
const PAGE_PERM_MAP: Record<string, string> = {
    '/dashboard/stores': 'stores',
    '/dashboard/store-categories': 'store-categories',
    '/dashboard/statements': 'statements',
    '/dashboard/landmarks': 'landmarks',
    '/dashboard/news': 'news',
    '/dashboard/about': 'about',
    '/dashboard/complaints': 'complaints',
    '/dashboard/carousel': 'carousel',
    '/dashboard/settings': 'settings',
    '/dashboard/users': '__adminOnly__',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, hasPermission } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace('/login');
            return;
        }

        // Permission guard for sub_admin
        if (user.role !== 'admin') {
            const permKey = Object.entries(PAGE_PERM_MAP).find(
                ([path]) => pathname === path || pathname.startsWith(path + '/')
            )?.[1];

            if (permKey === '__adminOnly__' || (permKey && !hasPermission(permKey))) {
                router.replace('/dashboard');
            }
        }
    }, [user, loading, pathname, router, hasPermission]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main className="mr-64 p-8">
                {children}
            </main>
        </div>
    );
}
