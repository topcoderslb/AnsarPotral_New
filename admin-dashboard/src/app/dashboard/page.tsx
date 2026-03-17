'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Complaint, normalizeComplaint } from '@/lib/types';

interface DashboardStats {
    storesCount: number;
    statementsCount: number;
    landmarksCount: number;
    complaintsCount: number;
    newComplaints: number;
    recentComplaints: Complaint[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        storesCount: 0,
        statementsCount: 0,
        landmarksCount: 0,
        complaintsCount: 0,
        newComplaints: 0,
        recentComplaints: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await apiFetch<DashboardStats>('dashboard.php');
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const recentComplaints = (stats.recentComplaints || []).map(normalizeComplaint);

    const statCards = [
        { icon: '🏬', label: 'المتاجر', value: stats.storesCount, color: 'from-blue-500 to-blue-600' },
        { icon: '📋', label: 'البيانات', value: stats.statementsCount, color: 'from-green-500 to-green-600' },
        { icon: '🏛️', label: 'المعالم', value: stats.landmarksCount, color: 'from-purple-500 to-purple-600' },
        { icon: '📨', label: 'الشكاوى', value: stats.complaintsCount, color: 'from-orange-500 to-orange-600', badge: stats.newComplaints },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
                <p className="text-gray-500 mt-1">مرحباً بك في لوحة التحكم لتطبيق بوابة أنصار</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className={`bg-gradient-to-r ${stat.color} rounded-xl p-6 text-white shadow-lg card-hover`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm">{stat.label}</p>
                                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className="relative">
                                <span className="text-4xl">{stat.icon}</span>
                                {stat.badge && stat.badge > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {stat.badge}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Complaints */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">آخر الشكاوى</h2>

                {recentComplaints.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <span className="text-4xl">📭</span>
                        <p className="mt-2">لا توجد شكاوى حتى الآن</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentComplaints.map((complaint) => (
                            <div
                                key={complaint.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${complaint.status === 'new' ? 'bg-red-500' :
                                            complaint.status === 'reviewed' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}></div>
                                    <div>
                                        <p className="font-medium text-gray-800">{complaint.name}</p>
                                        <p className="text-sm text-gray-500 line-clamp-1">{complaint.complaintText}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${complaint.status === 'new' ? 'bg-red-100 text-red-700' :
                                        complaint.status === 'reviewed' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {complaint.status === 'new' ? 'جديدة' : complaint.status === 'reviewed' ? 'قيد المراجعة' : 'تم الحل'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">إجراءات سريعة</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a href="/dashboard/stores" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors group">
                        <span className="text-3xl mb-2">➕</span>
                        <span className="text-sm text-gray-600 group-hover:text-orange-600">إضافة متجر</span>
                    </a>
                    <a href="/dashboard/statements" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors group">
                        <span className="text-3xl mb-2">📝</span>
                        <span className="text-sm text-gray-600 group-hover:text-orange-600">إضافة بيان</span>
                    </a>
                    <a href="/dashboard/landmarks" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors group">
                        <span className="text-3xl mb-2">🗺️</span>
                        <span className="text-sm text-gray-600 group-hover:text-orange-600">إضافة معلم</span>
                    </a>
                    <a href="/dashboard/complaints" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors group">
                        <span className="text-3xl mb-2">📋</span>
                        <span className="text-sm text-gray-600 group-hover:text-orange-600">عرض الشكاوى</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
