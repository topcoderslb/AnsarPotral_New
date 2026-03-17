'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { AppSettings } from '@/lib/types';

const defaultSettings: AppSettings = {
    welcome_text_ar: 'المنصّة الرقميّة لبلدية أنصار',
    welcome_text_en: 'ANSAR PORTAL',
    contact_email: 'topcoders.lb@gmail.com',
    play_store_url: 'https://play.google.com/store/apps/details?id=com.example.ansarportal',
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await apiFetch<AppSettings>('settings.php');
            setSettings({ ...defaultSettings, ...data });
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);

        try {
            await apiFetch('settings.php', {
                method: 'PUT',
                body: settings,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('حدث خطأ في الحفظ');
        } finally {
            setSaving(false);
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">الإعدادات</h1>
                    <p className="text-gray-500 mt-1">إعدادات التطبيق العامة</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>جاري الحفظ...</span>
                        </>
                    ) : saved ? (
                        <>
                            <span>✓</span>
                            <span>تم الحفظ</span>
                        </>
                    ) : (
                        <span>💾 حفظ التغييرات</span>
                    )}
                </button>
            </div>

            {/* Settings Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                    إعدادات الصفحة الرئيسية
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            نص الترحيب (إنجليزي)
                        </label>
                        <input
                            type="text"
                            value={settings.welcome_text_en}
                            onChange={(e) => setSettings({ ...settings, welcome_text_en: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="ANSAR PORTAL"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            نص الترحيب (عربي)
                        </label>
                        <input
                            type="text"
                            value={settings.welcome_text_ar}
                            onChange={(e) => setSettings({ ...settings, welcome_text_ar: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="المنصّة الرقميّة لبلدية أنصار"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                    معلومات التواصل
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            البريد الإلكتروني للتواصل
                        </label>
                        <input
                            type="email"
                            value={settings.contact_email}
                            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="info@example.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            هذا البريد يُستخدم في خيار &quot;تواصل معنا&quot; في قائمة التطبيق
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                    روابط خارجية
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            رابط التطبيق على Google Play
                        </label>
                        <input
                            type="url"
                            value={settings.play_store_url}
                            onChange={(e) => setSettings({ ...settings, play_store_url: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="https://play.google.com/store/apps/..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            يُستخدم في زر &quot;مشاركة التطبيق&quot;
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                        <h3 className="font-medium text-blue-800">ملاحظة</h3>
                        <p className="text-sm text-blue-600 mt-1">
                            بعد حفظ التغييرات، قد يستغرق الأمر بضع ثوانٍ حتى تظهر التغييرات في التطبيق.
                            يجب على المستخدمين إعادة فتح التطبيق لرؤية التحديثات الجديدة.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
