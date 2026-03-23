'use client';

import { useEffect, useState } from 'react';
import { apiFetch, uploadImage } from '@/lib/api';
import DataTable from '@/components/DataTable';
import ImageUpload from '@/components/ImageUpload';
import Image from 'next/image';

interface NewsItem {
    id?: number;
    title: string;
    content: string;
    image_url?: string | null;
    imageUrl?: string | null;
    is_active?: number | boolean;
    isActive?: boolean;
    published_at?: string;
    publishedAt?: string;
}

function normalizeNews(item: NewsItem): NewsItem {
    return {
        ...item,
        isActive: item.isActive ?? (item.is_active === 1 || item.is_active === true),
        imageUrl: item.imageUrl ?? item.image_url ?? null,
        publishedAt: item.publishedAt ?? item.published_at ?? '',
    };
}

function formatDateTime(value: string | undefined) {
    if (!value) return '-';
    try {
        return new Date(value).toLocaleString('ar-LB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

// Local datetime-local input value → MySQL datetime string
function toMySQLDatetime(localValue: string): string {
    if (!localValue) return new Date().toISOString().slice(0, 19).replace('T', ' ');
    return localValue.replace('T', ' ') + ':00'.slice(localValue.length - localValue.lastIndexOf(':') - 1 > 2 ? 0 : 3);
}

// MySQL datetime → datetime-local input value
function toDatetimeLocal(value: string | undefined): string {
    if (!value) return new Date().toISOString().slice(0, 16);
    try {
        return new Date(value).toISOString().slice(0, 16);
    } catch {
        return new Date().toISOString().slice(0, 16);
    }
}

export default function NewsPage() {
    const [newsList, setNewsList] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        imageUrl: '' as string | null,
        isActive: true,
        publishedAt: new Date().toISOString().slice(0, 16),
    });

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const data = await apiFetch<NewsItem[]>('news');
            setNewsList(data.map(normalizeNews));
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                title: formData.title,
                content: formData.content,
                imageUrl: formData.imageUrl || null,
                isActive: formData.isActive ? 1 : 0,
                publishedAt: formData.publishedAt.replace('T', ' ') + ':00',
            };

            if (editingItem?.id) {
                await apiFetch(`news`, {
                    method: 'PUT',
                    params: { id: String(editingItem.id) },
                    body: payload,
                });
            } else {
                await apiFetch('news', { method: 'POST', body: payload });
            }

            await fetchNews();
            resetForm();
        } catch (error) {
            console.error('Error saving news:', error);
            alert('حدث خطأ في الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item: NewsItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            content: item.content,
            imageUrl: item.imageUrl ?? item.image_url ?? null,
            isActive: item.isActive ?? true,
            publishedAt: toDatetimeLocal(item.publishedAt ?? item.published_at),
        });
        setShowForm(true);
    };

    const handleDelete = async (item: NewsItem) => {
        if (!item.id) return;
        if (confirm(`هل أنت متأكد من حذف "${item.title}"؟`)) {
            try {
                await apiFetch('news', { method: 'DELETE', params: { id: String(item.id) } });
                await fetchNews();
            } catch {
                alert('حدث خطأ في الحذف');
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingItem(null);
        setFormData({
            title: '',
            content: '',
            imageUrl: null,
            isActive: true,
            publishedAt: new Date().toISOString().slice(0, 16),
        });
    };

    const columns = [
        {
            key: 'imageUrl',
            header: 'الصورة',
            width: '80px',
            render: (item: NewsItem) => {
                const url = item.imageUrl ?? item.image_url;
                return url ? (
                    <div className="relative w-14 h-10 rounded-lg overflow-hidden">
                        <Image src={url} alt={item.title} fill className="object-cover" unoptimized />
                    </div>
                ) : (
                    <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-lg">
                        📰
                    </div>
                );
            },
        },
        { key: 'title', header: 'العنوان' },
        {
            key: 'published_at',
            header: 'التاريخ والوقت',
            render: (item: NewsItem) => formatDateTime(item.publishedAt ?? item.published_at),
        },
        {
            key: 'isActive',
            header: 'الحالة',
            render: (item: NewsItem) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isActive ? 'منشور' : 'مخفي'}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">آخر الأخبار</h1>
                    <p className="text-gray-500 mt-1">إدارة أخبار البلدية</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                >
                    ➕ إضافة خبر
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingItem ? 'تعديل خبر' : 'إضافة خبر جديد'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    العنوان <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-right"
                                    placeholder="عنوان الخبر"
                                    required
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نص الخبر <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-right"
                                    rows={5}
                                    placeholder="اكتب نص الخبر هنا..."
                                    required
                                />
                            </div>

                            {/* Date & Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    تاريخ ووقت النشر
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.publishedAt}
                                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            {/* Image (optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الصورة <span className="text-gray-400 font-normal">(اختياري)</span>
                                </label>

                                {formData.imageUrl ? (
                                    <div className="relative group">
                                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                            <Image
                                                src={formData.imageUrl}
                                                alt="news image"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, imageUrl: null })}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <ImageUpload
                                        onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                                        label="رفع صورة للخبر"
                                    />
                                )}
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActiveNews"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <label htmlFor="isActiveNews" className="text-sm font-medium text-gray-700">
                                    منشور (يظهر في التطبيق)
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'جاري الحفظ...' : (editingItem ? 'تحديث' : 'نشر الخبر')}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <DataTable
                data={newsList}
                columns={columns}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage="لا توجد أخبار. اضغط على 'إضافة خبر' للبدء."
            />
        </div>
    );
}
