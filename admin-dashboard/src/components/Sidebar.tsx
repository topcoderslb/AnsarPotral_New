'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
    { href: '/dashboard', icon: '🏠', label: 'الرئيسية', labelEn: 'Dashboard' },
    { href: '/dashboard/stores', icon: '🏬', label: 'المتاجر', labelEn: 'Stores' },
    { href: '/dashboard/statements', icon: '📋', label: 'بيانات البلدية', labelEn: 'Statements' },
    { href: '/dashboard/landmarks', icon: '🏛️', label: 'المعالم', labelEn: 'Landmarks' },
    { href: '/dashboard/about', icon: '📖', label: 'عن البلدية', labelEn: 'About' },
    { href: '/dashboard/complaints', icon: '📨', label: 'الشكاوى', labelEn: 'Complaints' },
    { href: '/dashboard/settings', icon: '⚙️', label: 'الإعدادات', labelEn: 'Settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { signOut } = useAuth();

    return (
        <aside className="w-64 bg-gradient-to-b from-orange-600 to-orange-700 text-white min-h-screen fixed right-0 top-0 shadow-xl">
            {/* Logo Section */}
            <div className="p-6 border-b border-orange-500">
                <h1 className="text-2xl font-bold text-center">لوحة التحكم</h1>
                <p className="text-orange-200 text-sm text-center mt-1">Ansar Portal</p>
            </div>

            {/* Navigation */}
            <nav className="mt-6">
                {menuItems.map((item) => {
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

            {/* Sign Out Button */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-orange-500">
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
