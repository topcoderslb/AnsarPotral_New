'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Complaint, normalizeComplaint } from '@/lib/types';
import Image from 'next/image';

export default function ComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');

    useEffect(() => {
        fetchComplaints();
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
                                            <p className="font-medium text-gray-800 truncate">{complaint.name}</p>
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
