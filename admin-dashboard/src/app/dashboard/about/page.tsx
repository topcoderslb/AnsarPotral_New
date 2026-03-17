'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { AboutSection, normalizeAboutSection } from '@/lib/types';

export default function AboutPage() {
    const [sections, setSections] = useState<AboutSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSection, setEditingSection] = useState<AboutSection | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        icon: '📋',
        content: [] as string[],
        isActive: true,
        order: 0,
    });
    const [newContentItem, setNewContentItem] = useState('');

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const data = await apiFetch<AboutSection[]>('about.php');
            setSections(data.map(normalizeAboutSection));
        } catch (error) {
            console.error('Error fetching sections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingSection?.id) {
                await apiFetch('about.php', {
                    method: 'PUT',
                    params: { id: String(editingSection.id) },
                    body: formData,
                });
            } else {
                await apiFetch('about.php', {
                    method: 'POST',
                    body: { ...formData, order: sections.length + 1 },
                });
            }

            await fetchSections();
            resetForm();
        } catch (error) {
            console.error('Error saving section:', error);
            alert('حدث خطأ في الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (section: AboutSection) => {
        setEditingSection(section);
        setFormData({
            title: section.title,
            icon: section.icon,
            content: section.content || [],
            isActive: section.isActive ?? true,
            order: section.order ?? section.sort_order ?? 0,
        });
        setShowForm(true);
    };

    const handleDelete = async (section: AboutSection) => {
        if (!section.id) return;

        if (confirm(`هل أنت متأكد من حذف قسم "${section.title}"؟`)) {
            try {
                await apiFetch('about.php', {
                    method: 'DELETE',
                    params: { id: String(section.id) },
                });
                await fetchSections();
            } catch (error) {
                console.error('Error deleting section:', error);
                alert('حدث خطأ في الحذف');
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingSection(null);
        setFormData({
            title: '',
            icon: '📋',
            content: [],
            isActive: true,
            order: 0,
        });
        setNewContentItem('');
    };

    const addContentItem = () => {
        if (newContentItem.trim()) {
            setFormData({
                ...formData,
                content: [...formData.content, newContentItem.trim()],
            });
            setNewContentItem('');
        }
    };

    const removeContentItem = (index: number) => {
        const newContent = formData.content.filter((_, i) => i !== index);
        setFormData({ ...formData, content: newContent });
    };

    const iconOptions = ['📋', '🏗️', '👥', '📞', '👁️', '🎯', '💡', '🏛️', '📍', '⏰'];

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">عن البلدية</h1>
                    <p className="text-gray-500 mt-1">إدارة أقسام صفحة عن البلدية</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                >
                    ➕ إضافة قسم
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingSection ? 'تعديل قسم' : 'إضافة قسم جديد'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان القسم *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="مثال: دور البلدية"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الأيقونة</label>
                                <div className="flex flex-wrap gap-2">
                                    {iconOptions.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon })}
                                            className={`w-10 h-10 rounded-lg border-2 transition-colors ${formData.icon === icon
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <span className="text-xl">{icon}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">محتوى القسم</label>
                                <div className="space-y-2">
                                    {formData.content.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                            <span className="flex-1 text-sm">{item}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeContentItem(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newContentItem}
                                            onChange={(e) => setNewContentItem(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContentItem())}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="أضف نقطة جديدة..."
                                        />
                                        <button
                                            type="button"
                                            onClick={addContentItem}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                        >
                                            إضافة
                                        </button>
                                    </div>
                                </div>
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
                                    {saving ? 'جاري الحفظ...' : (editingSection ? 'تحديث' : 'إضافة')}
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

            {/* Sections List */}
            {sections.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <span className="text-5xl">📋</span>
                    <p className="text-gray-500 mt-2">لا توجد أقسام. اضغط على &quot;إضافة قسم&quot; للبدء.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${!section.isActive ? 'opacity-60' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">{section.icon}</span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-800">{section.title}</h3>
                                            {!section.isActive && (
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                                                    غير نشط
                                                </span>
                                            )}
                                        </div>
                                        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                                            {section.content.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(section)}
                                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                    >
                                        تعديل
                                    </button>
                                    <button
                                        onClick={() => handleDelete(section)}
                                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
