'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Complaint, normalizeComplaint } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface BlockedDevice {
    id: number;
    device_id: string;
    device_name: string | null;
    device_model: string | null;
    os_version: string | null;
    ip_address: string | null;
    reason: string | null;
    blocked_at: string;
}

export default function ComplaintsPage() {
    const { user } = useAuth();
    const isPrimaryAdmin = user?.role === 'admin';
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');
    const [blockedDevices, setBlockedDevices] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchComplaints();
        if (isPrimaryAdmin) fetchBlockedDevices();
    }, []);

    const fetchComplaints = async () => {
        try {
            const data = await apiFetch<Complaint[]>('complaints.php');
            setComplaints(data.map(normalizeComplaint));
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBlockedDevices = async () => {
        try {
            const data = await apiFetch<BlockedDevice[]>('blocked-devices');
            setBlockedDevices(new Set(data.map(d => d.device_id)));
        } catch {
            // non-critical
        }
    };

    const blockDevice = async (complaint: Complaint) => {
        if (!isPrimaryAdmin) return;
        const deviceId = complaint.deviceId || '';
        if (!deviceId) { alert('لا يوجد معرّف جهاز لهذه الشكوى'); return; }
        if (!confirm(`هل أنت متأكد من حظر هذا الجهاز؟\n${complaint.deviceName || ''} ${complaint.deviceModel || ''}`)) return;
        try {
            await apiFetch('blocked-devices', {
                method: 'POST',
                body: {
                    device_id: deviceId,
                    device_name: complaint.deviceName || '',
                    device_model: complaint.deviceModel || '',
                    os_version: complaint.osVersion || '',
                    ip_address: complaint.ipAddress || '',
                    reason: 'Blocked by admin from complaints page',
                },
            });
            setBlockedDevices(prev => new Set([...prev, deviceId]));
            alert('تم حظر الجهاز بنجاح');
        } catch (error) {
            console.error(error);
            alert('حدث خطأ في حظر الجهاز');
        }
    };

    const unblockDevice = async (deviceId: string) => {
        if (!isPrimaryAdmin) return;
        if (!confirm('هل أنت متأكد من إلغاء حظر هذا الجهاز؟')) return;
        try {
            await apiFetch(`blocked-devices?device_id=${encodeURIComponent(deviceId)}`, { method: 'DELETE' });
            setBlockedDevices(prev => { const next = new Set(prev); next.delete(deviceId); return next; });
            alert('تم إلغاء حظر الجهاز');
        } catch (error) {
            console.error(error);
            alert('حدث خطأ في إلغاء الحظر');
        }
    };

    const updateStatus = async (complaintId: string | number, newStatus: Complaint['status']) => {
        try {
            await apiFetch('complaints.php', {
                method: 'PUT',
                params: { id: String(complaintId) },
                body: { status: newStatus },
            });
            await fetchComplaints();
            if (selectedComplaint?.id == complaintId) {
                setSelectedComplaint({ ...selectedComplaint, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('حدث خطأ في تحديث الحالة');
        }
    };

    const deleteComplaint = async (complaintId: string | number) => {
        if (!isPrimaryAdmin) return;
        if (!confirm('هل أنت متأكد من حذف هذه الشكوى نهائياً؟')) return;
        try {
            await apiFetch(`complaints?id=${complaintId}`, { method: 'DELETE' });
            setSelectedComplaint(null);
            await fetchComplaints();
        } catch (error) {
            console.error('Error deleting complaint:', error);
            alert('حدث خطأ في حذف الشكوى');
        }
    };

    const formatDate = (dateValue: Complaint['createdAt']) => {
        if (!dateValue) return '-';
        const date = new Date(dateValue);
        return date.toLocaleDateString('ar-LB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredComplaints = complaints.filter(c =>
        filter === 'all' ? true : c.status === filter
    );

    const statusCounts = {
        all: complaints.length,
        new: complaints.filter(c => c.status === 'new').length,
        reviewed: complaints.filter(c => c.status === 'reviewed').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
    };

    const getStatusStyles = (status: Complaint['status']) => {
        switch (status) {
            case 'new': return 'bg-red-100 text-red-700';
            case 'reviewed': return 'bg-yellow-100 text-yellow-700';
            case 'resolved': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: Complaint['status']) => {
        switch (status) {
            case 'new': return 'جديدة';
            case 'reviewed': return 'قيد المراجعة';
            case 'resolved': return 'تم الحل';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">الشكاوى</h1>
                <p className="text-gray-500 mt-1">عرض وإدارة شكاوى المواطنين</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'new', 'reviewed', 'resolved'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {status === 'all' ? 'الكل' : getStatusLabel(status)}
                        <span className={`mr-2 px-2 py-0.5 rounded-full text-xs ${filter === status ? 'bg-white/20' : 'bg-gray-200'
                            }`}>
                            {statusCounts[status]}
                        </span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Complaints List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800">قائمة الشكاوى</h2>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto">
                        {filteredComplaints.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <span className="text-4xl">📭</span>
                                <p className="mt-2">لا توجد شكاوى</p>
                            </div>
                        ) : (
                            filteredComplaints.map((complaint) => (
                                <div
                                    key={complaint.id}
                                    onClick={() => setSelectedComplaint(complaint)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedComplaint?.id === complaint.id
                                            ? 'bg-orange-50'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-800 truncate">{complaint.name}</p>
                                                {complaint.deviceId && blockedDevices.has(complaint.deviceId) && (
                                                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold shrink-0">محظور</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">{complaint.complaintText}</p>
                                            <p className="text-xs text-gray-400 mt-1">{formatDate(complaint.createdAt)}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${getStatusStyles(complaint.status)}`}>
                                            {getStatusLabel(complaint.status)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Complaint Details */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
                    {selectedComplaint ? (
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{selectedComplaint.name}</h2>
                                    <p className="text-gray-500">{selectedComplaint.phone}</p>
                                </div>
                                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusStyles(selectedComplaint.status)}`}>
                                    {getStatusLabel(selectedComplaint.status)}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">تاريخ الإرسال</label>
                                    <p className="text-gray-800">{formatDate(selectedComplaint.createdAt)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">نص الشكوى</label>
                                    <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{selectedComplaint.complaintText}</p>
                                </div>

                                {selectedComplaint.imageUrl && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">الصورة المرفقة</label>
                                        <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden">
                                            <Image
                                                src={selectedComplaint.imageUrl}
                                                alt="Complaint image"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Device Info - full details for primary admin, basic for others */}
                                {selectedComplaint.deviceId && (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-500 mb-2">معلومات الجهاز</label>
                                        {isPrimaryAdmin ? (
                                            <>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-400">معرّف الجهاز:</span>
                                                        <p className="text-gray-700 font-mono text-xs mt-0.5 break-all">{selectedComplaint.deviceId}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">اسم الجهاز:</span>
                                                        <p className="text-gray-700 mt-0.5">{selectedComplaint.deviceName || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">طراز الجهاز:</span>
                                                        <p className="text-gray-700 mt-0.5">{selectedComplaint.deviceModel || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">نظام التشغيل:</span>
                                                        <p className="text-gray-700 mt-0.5">{selectedComplaint.osVersion || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">عنوان IP:</span>
                                                        <p className="text-gray-700 font-mono text-xs mt-0.5">{selectedComplaint.ipAddress || '—'}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                                                    {blockedDevices.has(selectedComplaint.deviceId) ? (
                                                        <button
                                                            onClick={() => unblockDevice(selectedComplaint.deviceId!)}
                                                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                                                        >
                                                            ✅ إلغاء حظر الجهاز
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => blockDevice(selectedComplaint)}
                                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                                        >
                                                            🚫 حظر هذا الجهاز
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">معلومات الجهاز متاحة فقط للمدير الرئيسي</p>
                                        )}
                                    </div>
                                )}

                                {/* Status Actions */}
                                <div className="pt-4 border-t border-gray-100">
                                    <label className="block text-sm font-medium text-gray-500 mb-2">تغيير الحالة</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {selectedComplaint.status !== 'new' && (
                                            <button
                                                onClick={() => updateStatus(selectedComplaint.id!, 'new')}
                                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                وضع كجديدة
                                            </button>
                                        )}
                                        {selectedComplaint.status !== 'reviewed' && (
                                            <button
                                                onClick={() => updateStatus(selectedComplaint.id!, 'reviewed')}
                                                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                                            >
                                                وضع قيد المراجعة
                                            </button>
                                        )}
                                        {selectedComplaint.status !== 'resolved' && (
                                            <button
                                                onClick={() => updateStatus(selectedComplaint.id!, 'resolved')}
                                                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                            >
                                                وضع كمحلولة
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Delete - Primary Admin Only */}
                                {isPrimaryAdmin && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => deleteComplaint(selectedComplaint.id!)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                        >
                                            🗑️ حذف الشكوى نهائياً
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[400px] text-gray-500">
                            <div className="text-center">
                                <span className="text-5xl">📋</span>
                                <p className="mt-2">اختر شكوى لعرض التفاصيل</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
