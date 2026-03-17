'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Store, StoreCategory, normalizeStore } from '@/lib/types';
import DataTable from '@/components/DataTable';
import ImageUpload from '@/components/ImageUpload';
import Image from 'next/image';

export default function StoresPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [categories, setCategories] = useState<StoreCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Omit<Store, 'id'>>({
        name: '',
        description: '',
        category: '',
        phoneNumber: '',
        whatsappNumber: '',
        imageUrl: '',
        location: '',
        isActive: true,
        order: 0,
    });

    useEffect(() => {
        fetchStores();
        fetchCategories();
    }, []);

    const fetchStores = async () => {
        try {
            const data = await apiFetch<Store[]>('stores.php');
            setStores(data.map(normalizeStore));
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await apiFetch<StoreCategory[]>('store-categories.php');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingStore?.id) {
                await apiFetch('stores.php', {
                    method: 'PUT',
                    params: { id: String(editingStore.id) },
                    body: formData,
                });
            } else {
                await apiFetch('stores.php', {
                    method: 'POST',
                    body: { ...formData, order: stores.length + 1 },
                });
            }

            await fetchStores();
            resetForm();
        } catch (error) {
            console.error('Error saving store:', error);
            alert('حدث خطأ في الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (store: Store) => {
        setEditingStore(store);
        setFormData({
            name: store.name,
            description: store.description,
            category: store.category,
            phoneNumber: store.phoneNumber || store.phone_number || '',
            whatsappNumber: store.whatsappNumber || store.whatsapp_number || '',
            imageUrl: store.imageUrl || store.image_url || '',
            location: store.location,
            isActive: store.isActive ?? true,
            order: store.order ?? store.sort_order ?? 0,
        });
        setShowForm(true);
    };

    const handleDelete = async (store: Store) => {
        if (!store.id) return;

        if (confirm(`هل أنت متأكد من حذف "${store.name}"؟`)) {
            try {
                await apiFetch('stores.php', {
                    method: 'DELETE',
                    params: { id: String(store.id) },
                });
                await fetchStores();
            } catch (error) {
                console.error('Error deleting store:', error);
                alert('حدث خطأ في الحذف');
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingStore(null);
        setFormData({
            name: '',
            description: '',
            category: '',
            phoneNumber: '',
            whatsappNumber: '',
            imageUrl: '',
            location: '',
            isActive: true,
            order: 0,
        });
    };

    const columns = [
        {
            key: 'imageUrl',
            header: 'الصورة',
            width: '80px',
            render: (store: Store) => (
                store.imageUrl ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                        <Image src={store.imageUrl} alt={store.name} fill className="object-cover" unoptimized />
                    </div>
                ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">📷</span>
                    </div>
                )
            ),
        },
        { key: 'name', header: 'اسم المتجر' },
        { key: 'category', header: 'التصنيف' },
        { key: 'location', header: 'الموقع' },
        { key: 'phoneNumber', header: 'الهاتف' },
        {
            key: 'isActive',
            header: 'الحالة',
            render: (store: Store) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${store.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {store.isActive ? 'نشط' : 'غير نشط'}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">المتاجر</h1>
                    <p className="text-gray-500 mt-1">إدارة متاجر التطبيق</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                >
                    ➕ إضافة متجر
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingStore ? 'تعديل متجر' : 'إضافة متجر جديد'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم المتجر *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        required
                                    >
                                        <option value="">اختر التصنيف...</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="+961 XX XXX XXX"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الواتساب</label>
                                    <input
                                        type="tel"
                                        value={formData.whatsappNumber}
                                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="+961 XX XXX XXX"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الموقع</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="وسط البلدة، الشارع الرئيسي..."
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        rows={3}
                                        placeholder="وصف المتجر والخدمات المقدمة..."
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <ImageUpload
                                        currentImageUrl={formData.imageUrl}
                                        onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                                        label="صورة المتجر"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                        نشط (يظهر في التطبيق)
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'جاري الحفظ...' : (editingStore ? 'تحديث' : 'إضافة')}
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
                data={stores}
                columns={columns}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage="لا توجد متاجر. اضغط على 'إضافة متجر' للبدء."
            />
        </div>
    );
}
