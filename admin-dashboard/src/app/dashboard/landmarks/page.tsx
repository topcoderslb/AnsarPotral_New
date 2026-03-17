'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Landmark, CarouselImage, normalizeLandmark, normalizeCarousel } from '@/lib/types';
import DataTable from '@/components/DataTable';
import ImageUpload from '@/components/ImageUpload';
import Image from 'next/image';

export default function LandmarksPage() {
    const [landmarks, setLandmarks] = useState<Landmark[]>([]);
    const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showCarouselForm, setShowCarouselForm] = useState(false);
    const [editingLandmark, setEditingLandmark] = useState<Landmark | null>(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'landmarks' | 'carousel'>('landmarks');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        phoneNumber: '',
        hasCallButton: false,
        isActive: true,
        order: 0,
    });

    const [carouselFormData, setCarouselFormData] = useState({
        imageUrl: '',
        order: 0,
        isActive: true,
    });

    useEffect(() => {
        fetchLandmarks();
        fetchCarouselImages();
    }, []);

    const fetchLandmarks = async () => {
        try {
            const data = await apiFetch<Landmark[]>('landmarks.php');
            setLandmarks(data.map(normalizeLandmark));
        } catch (error) {
            console.error('Error fetching landmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCarouselImages = async () => {
        try {
            const data = await apiFetch<CarouselImage[]>('carousel.php');
            setCarouselImages(data.map(normalizeCarousel));
        } catch (error) {
            console.error('Error fetching carousel images:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingLandmark?.id) {
                await apiFetch('landmarks.php', {
                    method: 'PUT',
                    params: { id: String(editingLandmark.id) },
                    body: formData,
                });
            } else {
                await apiFetch('landmarks.php', {
                    method: 'POST',
                    body: { ...formData, order: landmarks.length + 1 },
                });
            }

            await fetchLandmarks();
            resetForm();
        } catch (error) {
            console.error('Error saving landmark:', error);
            alert('حدث خطأ في الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleCarouselSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await apiFetch('carousel.php', {
                method: 'POST',
                body: { ...carouselFormData, order: carouselImages.length + 1 },
            });

            await fetchCarouselImages();
            setShowCarouselForm(false);
            setCarouselFormData({ imageUrl: '', order: 0, isActive: true });
        } catch (error) {
            console.error('Error saving carousel image:', error);
            alert('حدث خطأ في الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (landmark: Landmark) => {
        setEditingLandmark(landmark);
        setFormData({
            title: landmark.title,
            imageUrl: landmark.imageUrl || landmark.image_url || '',
            phoneNumber: landmark.phoneNumber || landmark.phone_number || '',
            hasCallButton: landmark.hasCallButton ?? false,
            isActive: landmark.isActive ?? true,
            order: landmark.order ?? landmark.sort_order ?? 0,
        });
        setShowForm(true);
    };

    const handleDelete = async (landmark: Landmark) => {
        if (!landmark.id) return;

        if (confirm(`هل أنت متأكد من حذف "${landmark.title}"؟`)) {
            try {
                await apiFetch('landmarks.php', {
                    method: 'DELETE',
                    params: { id: String(landmark.id) },
                });
                await fetchLandmarks();
            } catch (error) {
                console.error('Error deleting landmark:', error);
                alert('حدث خطأ في الحذف');
            }
        }
    };

    const handleDeleteCarousel = async (image: CarouselImage) => {
        if (!image.id) return;

        if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
            try {
                await apiFetch('carousel.php', {
                    method: 'DELETE',
                    params: { id: String(image.id) },
                });
                await fetchCarouselImages();
            } catch (error) {
                console.error('Error deleting carousel image:', error);
                alert('حدث خطأ في الحذف');
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingLandmark(null);
        setFormData({
            title: '',
            imageUrl: '',
            phoneNumber: '',
            hasCallButton: false,
            isActive: true,
            order: 0,
        });
    };

    const columns = [
        {
            key: 'imageUrl',
            header: 'الصورة',
            width: '80px',
            render: (landmark: Landmark) => (
                landmark.imageUrl ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                        <Image src={landmark.imageUrl} alt={landmark.title} fill className="object-cover" unoptimized />
                    </div>
                ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">📷</span>
                    </div>
                )
            ),
        },
        { key: 'title', header: 'الاسم' },
        {
            key: 'phoneNumber',
            header: 'الهاتف',
            render: (landmark: Landmark) => landmark.phoneNumber || '-',
        },
        {
            key: 'hasCallButton',
            header: 'زر الاتصال',
            render: (landmark: Landmark) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${landmark.hasCallButton ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {landmark.hasCallButton ? 'نعم' : 'لا'}
                </span>
            ),
        },
        {
            key: 'isActive',
            header: 'الحالة',
            render: (landmark: Landmark) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${landmark.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {landmark.isActive ? 'نشط' : 'غير نشط'}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">المعالم والسياحة</h1>
                    <p className="text-gray-500 mt-1">إدارة معالم أنصار وصور السلايدر</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('landmarks')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'landmarks'
                            ? 'text-orange-600 border-b-2 border-orange-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    🏛️ المعالم
                </button>
                <button
                    onClick={() => setActiveTab('carousel')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'carousel'
                            ? 'text-orange-600 border-b-2 border-orange-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    🖼️ صور السلايدر
                </button>
            </div>

            {activeTab === 'landmarks' ? (
                <>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                        >
                            ➕ إضافة معلم
                        </button>
                    </div>

                    {/* Landmarks Form Modal */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl max-w-lg w-full">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {editingLandmark ? 'تعديل معلم' : 'إضافة معلم جديد'}
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">اسم المعلم *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="+961 XX XXX XXX"
                                        />
                                    </div>

                                    <ImageUpload
                                        currentImageUrl={formData.imageUrl}
                                        onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                                        label="صورة المعلم"
                                    />

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="hasCallButton"
                                                checked={formData.hasCallButton}
                                                onChange={(e) => setFormData({ ...formData, hasCallButton: e.target.checked })}
                                                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                            />
                                            <label htmlFor="hasCallButton" className="text-sm font-medium text-gray-700">
                                                إظهار زر الاتصال
                                            </label>
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
                                                نشط
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
                                        >
                                            {saving ? 'جاري الحفظ...' : (editingLandmark ? 'تحديث' : 'إضافة')}
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

                    <DataTable
                        data={landmarks}
                        columns={columns}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        emptyMessage="لا توجد معالم. اضغط على 'إضافة معلم' للبدء."
                    />
                </>
            ) : (
                <>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowCarouselForm(true)}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
                        >
                            ➕ إضافة صورة
                        </button>
                    </div>

                    {/* Carousel Form Modal */}
                    {showCarouselForm && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl max-w-lg w-full">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-800">إضافة صورة للسلايدر</h2>
                                </div>

                                <form onSubmit={handleCarouselSubmit} className="p-6 space-y-4">
                                    <ImageUpload
                                        currentImageUrl={carouselFormData.imageUrl}
                                        onImageUploaded={(url) => setCarouselFormData({ ...carouselFormData, imageUrl: url })}
                                        label="صورة السلايدر"
                                    />

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="carouselActive"
                                            checked={carouselFormData.isActive}
                                            onChange={(e) => setCarouselFormData({ ...carouselFormData, isActive: e.target.checked })}
                                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <label htmlFor="carouselActive" className="text-sm font-medium text-gray-700">
                                            نشط
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                                        <button
                                            type="submit"
                                            disabled={saving || !carouselFormData.imageUrl}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
                                        >
                                            {saving ? 'جاري الحفظ...' : 'إضافة'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCarouselForm(false);
                                                setCarouselFormData({ imageUrl: '', order: 0, isActive: true });
                                            }}
                                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Carousel Images Grid */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        {carouselImages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <span className="text-5xl">🖼️</span>
                                <p className="mt-2">لا توجد صور في السلايدر</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {carouselImages.map((image) => (
                                    <div key={image.id} className="relative group">
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden">
                                            <Image src={image.imageUrl || ''} alt="Carousel" fill className="object-cover" unoptimized />
                                            {!image.isActive && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="text-white text-sm">غير نشط</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCarousel(image)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
