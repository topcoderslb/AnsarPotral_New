'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadImage } from '@/lib/api';

interface ImageUploadProps {
    currentImageUrl?: string;
    onImageUploaded: (url: string) => void;
    label?: string;
}

export default function ImageUpload({ currentImageUrl, onImageUploaded, label = 'صورة' }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('الرجاء اختيار ملف صورة');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('حجم الصورة يجب أن لا يتجاوز 5MB');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to local server
            const imageUrl = await uploadImage(file);
            onImageUploaded(imageUrl);
            setPreview(imageUrl);
        } catch (err) {
            setError('فشل في رفع الصورة. الرجاء المحاولة مرة أخرى.');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onImageUploaded('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors hover:border-orange-400">
                {preview ? (
                    <div className="relative">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                            <Image
                                src={preview}
                                alt="Preview"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <div className="mt-3 flex gap-2 justify-center">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                                disabled={uploading}
                            >
                                تغيير
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                disabled={uploading}
                            >
                                حذف
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center py-8 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="text-4xl mb-2">📷</div>
                        <p className="text-gray-500 text-sm">اضغط لاختيار صورة</p>
                        <p className="text-gray-400 text-xs mt-1">PNG, JPG حتى 5MB</p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {uploading && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-orange-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                        <span className="text-sm">جاري رفع الصورة...</span>
                    </div>
                )}

                {error && (
                    <p className="mt-2 text-red-500 text-sm text-center">{error}</p>
                )}
            </div>
        </div>
    );
}
