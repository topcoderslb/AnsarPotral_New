'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// adminOnly: true → visible only to role === 'admin'
// permKey: the key checked in user.permissions for sub_admin role
const menuItems = [
    { href: '/dashboard', icon: '🏠', label: 'الرئيسية' },
    { href: '/dashboard/stores', icon: '🏬', label: 'المتاجر', permKey: 'stores' },
    { href: '/dashboard/store-categories', icon: '🏷️', label: 'أصناف المتاجر', permKey: 'store-categories' },
    { href: '/dashboard/statements', icon: '📋', label: 'بلدية أنصار', permKey: 'statements' },
    { href: '/dashboard/landmarks', icon: '🏛️', label: 'المعالم', permKey: 'landmarks' },
    { href: '/dashboard/news', icon: '📰', label: 'آخر الأخبار', permKey: 'news' },
    { href: '/dashboard/about', icon: '📖', label: 'عن البلدية', permKey: 'about' },
    { href: '/dashboard/complaints', icon: '📨', label: 'الشكاوى', permKey: 'complaints' },
    { href: '/dashboard/settings', icon: '⚙️', label: 'الإعدادات', permKey: 'settings' },
    { href: '/dashboard/users', icon: '👥', label: 'المستخدمون', adminOnly: true },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, hasPermission, signOut } = useAuth();

    const visibleItems = menuItems.filter(item => {
        if (item.adminOnly) return user?.role === 'admin';
        if (!item.permKey) return true; // home — always visible
        return hasPermission(item.permKey);
    });

    return (
        <aside className="w-64 bg-gradient-to-b from-orange-600 to-orange-700 text-white h-screen fixed right-0 top-0 shadow-xl flex flex-col overflow-hidden">
            {/* Logo Section */}
            <div className="flex-shrink-0 p-6 border-b border-orange-500">
                <h1 className="text-2xl font-bold text-center">لوحة التحكم</h1>
                <p className="text-orange-200 text-sm text-center mt-1">Ansar Portal</p>
                {user && (
                    <p className="text-orange-100 text-xs text-center mt-2 truncate">{user.name}</p>
                )}
            </div>

            {/* Navigation — scrollable */}
            <nav
                className="mt-2 flex-1 overflow-y-auto"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.25) transparent' }}
            >
                {visibleItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-6 py-3 text-right transition-all duration-200 ${isActive
                                    ? 'bg-orange-800 border-l-4 border-white'
                                    : 'hover:bg-orange-500/30'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Sign Out Button — always visible at bottom */}
            <div className="flex-shrink-0 p-4 border-t border-orange-500">
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-800 hover:bg-orange-900 rounded-lg transition-colors"
                >
                    <span>🚪</span>
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    );
}
