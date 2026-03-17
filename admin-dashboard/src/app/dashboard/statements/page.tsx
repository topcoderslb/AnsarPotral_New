'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { MunicipalityStatement } from '@/lib/types';
import DataTable from '@/components/DataTable';
import ImageUpload from '@/components/ImageUpload';
import Image from 'next/image';

export default function StatementsPage() {
    const [statements, setStatements] = useState<MunicipalityStatement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingStatement, setEditingStatement] = useState<MunicipalityStatement | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        imageUrls: [] as string[],
        isActive: true,
        order: 0,
    });

    useEffect(() => {
        fetchStatements();
    }, []);

    const fetchStatements = async () => {
        try {
            const data = await apiFetch<MunicipalityStatement[]>('statements.php');
            setStatements(data.map(s => ({
                ...s,
                isActive: s.isActive ?? (s.is_active === 1 || s.is_active === true),
                order: s.order ?? s.sort_order ?? 0,
                imageUrls: s.imageUrls || [],
            })));
        } catch (error) {
            console.error('Error fetching statements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingStatement?.id) {
                await apiFetch('statements.php', {
                    method: 'PUT',
                    params: { id: String(editingStatement.id) },
                    body: formData,
                });
            } else {
                await apiFetch('statements.php', {
                    method: 'POST',
                    body: { ...formData, order: statements.length + 1 },
                });
            }

            await fetchStatements();
            resetForm();
        } catch (error) {
            console.error('Error saving statement:', error);
            alert('حدث خطأ في الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (statement: MunicipalityStatement) => {
        setEditingStatement(statement);
        setFormData({
            title: statement.title,
            description: statement.description,
            category: statement.category,
            imageUrls: statement.imageUrls || [],
            isActive: statement.isActive ?? true,
            order: statement.order ?? statement.sort_order ?? 0,
        });
        setShowForm(true);
    };

    const handleDelete = async (statement: MunicipalityStatement) => {
        if (!statement.id) return;

        if (confirm(`هل أنت متأكد من حذف "${statement.title}"؟`)) {
            try {
                await apiFetch('statements.php', {
                    method: 'DELETE',
                    params: { id: String(statement.id) },
                });
                await fetchStatements();
            } catch (error) {
                console.error('Error deleting statement:', error);
                alert('حدث خطأ في الحذف');
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingStatement(null);
        setFormData({
            title: '',
            description: '',
            category: '',
            imageUrls: [],
            isActive: true,
            order: 0,
        });
    };

    const addImageUrl = (url: string) => {
        if (url && !formData.imageUrls.includes(url)) {
            setFormData({ ...formData, imageUrls: [...formData.imageUrls, url] });
        }
    };

    const removeImageUrl = (index: number) => {
        const newUrls = formData.imageUrls.filter((_, i) => i !== index);
        setFormData({ ...formData, imageUrls: newUrls });
    };

    const formatDate = (dateValue: string | undefined) => {
        if (!dateValue) return '-';
        try {
            return new Date(dateValue).toLocaleDateString('ar-LB');
        } catch {
            return dateValue;
        }
    };

    const columns = [
        {
            key: 'imageUrls',
            header: 'الصور',
            width: '80px',
            render: (statement: MunicipalityStatement) => (
                statement.imageUrls?.length > 0 ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                        <Image src={statement.imageUrls[0]} alt={statement.title} fill className="object-cover" unoptimized />
                        {statement.imageUrls.length > 1 && (
                            <div className="absolute bottom-0 right-0 bg-black/60 text-white text-xs px-1 rounded">
                                +{statement.imageUrls.length - 1}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">📷</span>
                    </div>
                )
            ),
        },
        { key: 'title', header: 'العنوان' },
        { key: 'category', header: 'التصنيف' },
        {
            key: 'date',
            header: 'التاريخ',
            render: (statement: MunicipalityStatement) => formatDate(statement.date),
        },
        {
            key: 'isActive',
            header: 'الحالة',
            render: (statement: MunicipalityStatement) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statement.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {statement.isActive ? 'نشط' : 'غير نشط'}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">بيانات البلدية</h1>
                    <p className="text-gray-500 mt-1">إدارة بيانات وإعلانات البلدية</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                >
                    ➕ إضافة بيان
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingStatement ? 'تعديل بيان' : 'إضافة بيان جديد'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">العنوان *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف *</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="مشاريع، إعلانات، تقارير..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    rows={4}
                                    required
                                />
                            </div>

                            {/* Multiple Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الصور</label>
                                <ImageUpload
                                    onImageUploaded={addImageUrl}
                                    label="إضافة صورة"
                                />

                                {formData.imageUrls.length > 0 && (
                                    <div className="mt-3 grid grid-cols-3 gap-2">
                                        {formData.imageUrls.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <div className="relative w-full h-24 rounded-lg overflow-hidden">
                                                    <Image src={url} alt={`Image ${index + 1}`} fill className="object-cover" unoptimized />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImageUrl(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'جاري الحفظ...' : (editingStatement ? 'تحديث' : 'إضافة')}
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
                data={statements}
                columns={columns}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage="لا توجد بيانات. اضغط على 'إضافة بيان' للبدء."
            />
        </div>
    );
}
