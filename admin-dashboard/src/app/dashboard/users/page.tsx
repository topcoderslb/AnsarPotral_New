'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

// All controllable pages — key must match the href segment after /dashboard/
const PAGE_PERMISSIONS = [
  { key: 'stores', label: 'المتاجر', icon: '🏬' },
  { key: 'store-categories', label: 'أصناف المتاجر', icon: '🏷️' },
  { key: 'statements', label: 'بلدية أنصار', icon: '📋' },
  { key: 'landmarks', label: 'المعالم', icon: '🏛️' },
  { key: 'news', label: 'آخر الأخبار', icon: '📰' },
  { key: 'about', label: 'عن البلدية', icon: '📖' },
  { key: 'complaints', label: 'الشكاوى', icon: '📨' },
  { key: 'settings', label: 'الإعدادات', icon: '⚙️' },
];

interface SubAdmin {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: number;
  permissions: Record<string, boolean> | null;
  created_at: string;
}

const emptyPermissions = () =>
  Object.fromEntries(PAGE_PERMISSIONS.map(p => [p.key, false])) as Record<string, boolean>;

const emptyForm = () => ({
  name: '',
  email: '',
  phone: '',
  password: '',
  is_active: true,
  permissions: emptyPermissions(),
});

export default function UsersPage() {
  const [users, setUsers] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<SubAdmin[]>('users');
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setError('');
    setShowModal(true);
  };

  const openEdit = (u: SubAdmin) => {
    setEditId(u.id);
    setForm({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      password: '',
      is_active: u.is_active === 1,
      permissions: { ...emptyPermissions(), ...(u.permissions || {}) },
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('الاسم والبريد الإلكتروني مطلوبان');
      return;
    }
    if (!editId && !form.password.trim()) {
      setError('كلمة المرور مطلوبة عند إنشاء مستخدم جديد');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await apiFetch('users', {
          method: 'PUT',
          body: { id: editId, ...form },
        });
      } else {
        await apiFetch('users', {
          method: 'POST',
          body: form,
        });
      }
      setShowModal(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    try {
      await apiFetch(`users?id=${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحذف');
    }
  };

  const togglePermission = (key: string) => {
    setForm(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] },
    }));
  };

  const selectAll = () =>
    setForm(prev => ({
      ...prev,
      permissions: Object.fromEntries(PAGE_PERMISSIONS.map(p => [p.key, true])),
    }));

  const clearAll = () =>
    setForm(prev => ({ ...prev, permissions: emptyPermissions() }));

  const permissionCount = (u: SubAdmin) =>
    u.permissions ? Object.values(u.permissions).filter(Boolean).length : 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة المستخدمين</h1>
          <p className="text-gray-500 mt-1">إنشاء وإدارة مديري النظام الفرعيين وصلاحياتهم</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow transition-colors"
        >
          <span className="text-lg">+</span>
          إضافة مستخدم
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-lg">لا يوجد مستخدمون حتى الآن</p>
            <p className="text-sm mt-1">أضف أول مدير فرعي بالضغط على "إضافة مستخدم"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">الاسم</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">البريد الإلكتروني</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">الهاتف</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">الصلاحيات</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">الحالة</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{u.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm" dir="ltr">{u.email}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{u.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-100">
                        {permissionCount(u)} / {PAGE_PERMISSIONS.length} صفحات
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {u.is_active ? '✓ نشط' : '✗ معطّل'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editId ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="مثال: أحمد العلي"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="مثال: 03123456"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="example@email.com"
                  dir="ltr"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور {editId ? '(اتركها فارغة للإبقاء على الحالية)' : '*'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder={editId ? 'اتركها فارغة للإبقاء على الحالية' : 'أدخل كلمة مرور قوية'}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-orange-500' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-1' : 'translate-x-6'}`} />
                </button>
                <span className="text-sm text-gray-700">الحساب {form.is_active ? 'نشط' : 'معطّل'}</span>
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">صلاحيات الوصول</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-xs px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors"
                    >
                      تحديد الكل
                    </button>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-medium transition-colors"
                    >
                      إلغاء الكل
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PAGE_PERMISSIONS.map(p => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => togglePermission(p.key)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        form.permissions[p.key]
                          ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span>{p.label}</span>
                      {form.permissions[p.key] && (
                        <span className="mr-auto text-orange-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl font-medium text-sm shadow transition-colors flex items-center gap-2"
              >
                {saving && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saving ? 'جاري الحفظ...' : (editId ? 'حفظ التعديلات' : 'إنشاء المستخدم')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
