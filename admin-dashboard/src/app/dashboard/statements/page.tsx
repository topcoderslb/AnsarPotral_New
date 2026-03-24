'use client';

import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { MunicipalityStatement } from '@/lib/types';
import DataTable from '@/components/DataTable';
import ImageUpload from '@/components/ImageUpload';
import Image from 'next/image';

// Arabic month names — same format used in the news page
const ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function formatArabicDateTime(value: string | undefined) {
    if (!value) return '-';
    try {
        const dt = new Date(value);
        const day = dt.getDate();
        const month = ARABIC_MONTHS[dt.getMonth()];
        const year = dt.getFullYear();
        let hours = dt.getHours();
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        const amPm = hours >= 12 ? 'م' : 'ص';
        hours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${day} ${month} ${year}  •  ${String(hours).padStart(2, '0')}:${minutes} ${amPm}`;
    } catch {
        return value;
    }
}

export default function StatementsPage() {
    const [statements, setStatements] = useState<MunicipalityStatement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingStatement, setEditingStatement] = useState<MunicipalityStatement | null>(null);
    const [saving, setSaving] = useState(false);
    const [savedCategories, setSavedCategories] = useState<string[]>([]);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);

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
        loadCategories();
    }, []);

    // Close category dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
                setCategoryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const loadCategories = async () => {
        try {
            // Load previously saved categories from the statement-categories API
            const data = await apiFetch<{ id: number; name: string }[]>('statement-categories');
            setSavedCategories(data.map(c => c.name));
        } catch {
            // Fallback: extract unique categories from loaded statements
        }
    };

    // Called when user submits a category that's not already saved
    const saveNewCategory = async (name: string) => {
        if (!name.trim() || savedCategories.includes(name.trim())) return;
        try {
            await apiFetch('statement-categories', { method: 'POST', body: { name: name.trim(), order: savedCategories.length } });
            setSavedCategories(prev => [...prev, name.trim()]);
        } catch {
            // Non-critical — the statement still saves even if category save fails
        }
    };

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
            // Persist new category if not already saved
            await saveNewCategory(formData.category);

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
            render: (statement: MunicipalityStatement) => (
                <span className="text-sm text-gray-600 whitespace-nowrap">{formatArabicDateTime(statement.date)}</span>
            ),
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
                    <h1 className="text-3xl font-bold text-gray-800">بلدية أنصار</h1>
                    <p className="text-gray-500 mt-1">إدارة تقارير وإعلانات بلدية أنصار</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                >
                    ➕ إضافة تقرير
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingStatement ? 'تعديل تقرير' : 'إضافة تقرير جديد'}
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
                                <div ref={categoryRef} className="relative">
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => {
                                                setFormData({ ...formData, category: e.target.value });
                                                setCategoryDropdownOpen(true);
                                            }}
                                            onFocus={() => setCategoryDropdownOpen(true)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                            placeholder="اكتب تصنيفاً أو اختر من القائمة..."
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setCategoryDropdownOpen(o => !o)}
                                            className="px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 text-gray-500"
                                        >
                                            <svg className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                    {categoryDropdownOpen && savedCategories.length > 0 && (
                                        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {savedCategories
                                                .filter(cat => !formData.category || cat.toLowerCase().includes(formData.category.toLowerCase()))
                                                .map(cat => (
                                                    <li
                                                        key={cat}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            setFormData({ ...formData, category: cat });
                                                            setCategoryDropdownOpen(false);
                                                        }}
                                                        className="px-4 py-2 cursor-pointer hover:bg-orange-50 hover:text-orange-700 text-sm text-right"
                                                    >
                                                        {cat}
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                    {categoryDropdownOpen && savedCategories.length > 0 &&
                                        savedCategories.filter(cat => !formData.category || cat.toLowerCase().includes(formData.category.toLowerCase())).length === 0 && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 text-sm text-gray-400 text-right">
                                                سيتم حفظ هذا التصنيف الجديد تلقائياً
                                            </div>
                                    )}
                                </div>
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
                emptyMessage="لا توجد تقارير. اضغط على 'إضافة تقرير' للبدء."
            />
        </div>
    );
}
