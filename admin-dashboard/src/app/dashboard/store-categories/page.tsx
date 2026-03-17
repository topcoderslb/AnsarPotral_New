'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { StoreCategory } from '@/lib/types';

export default function StoreCategoriesPage() {
    const [categories, setCategories] = useState<StoreCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await apiFetch<StoreCategory[]>('store-categories.php');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setSaving(true);
        try {
            await apiFetch('store-categories.php', {
                method: 'POST',
                body: { name: newName.trim(), order: categories.length + 1 },
            });
            setNewName('');
            await fetchCategories();
        } catch (error) {
            console.error('Error adding category:', error);
            alert('حدث خطأ في الإضافة');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (cat: StoreCategory) => {
        if (!confirm(`هل أنت متأكد من حذف "${cat.name}"؟`)) return;
        try {
            await apiFetch('store-categories.php', {
                method: 'DELETE',
                params: { id: String(cat.id) },
            });
            await fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('حدث خطأ في الحذف');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">أصناف المتاجر</h1>
                <p className="text-gray-500 mt-1">إدارة أصناف المتاجر - عند إضافة متجر جديد يتم اختيار الصنف من هذه القائمة</p>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAdd} className="flex gap-3">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="اسم الصنف الجديد (مثال: مطاعم، صيدليات، أزياء...)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-right"
                    required
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50"
                >
                    {saving ? 'جاري الإضافة...' : '➕ إضافة صنف'}
                </button>
            </form>

            {/* Categories List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="text-gray-500 mt-4">جاري التحميل...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="text-4xl">🏷️</span>
                        <p className="text-gray-500 mt-4">لا توجد أصناف. أضف صنفاً جديداً للبدء.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">#</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">اسم الصنف</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((cat, index) => (
                                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                                            🏷️ {cat.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(cat)}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            🗑️ حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
