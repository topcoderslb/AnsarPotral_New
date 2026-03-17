import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { json, OPTIONS as corsOptions } from '@/lib/cors';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function OPTIONS() { return corsOptions(); }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM stores WHERE id = ?', [id]);
    if (rows.length === 0) return json({ error: 'Store not found' }, 404);
    return json(rows[0]);
  }

  const activeOnly = searchParams.get('active_only') || '0';
  let sql = 'SELECT * FROM stores';
  if (activeOnly === '1') sql += ' WHERE is_active = 1';
  sql += ' ORDER BY sort_order ASC, id ASC';

  const [rows] = await pool.query<RowDataPacket[]>(sql);
  return json(rows);
}

export async function POST(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const body = await request.json();

  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO stores (name, description, category, phone_number, whatsapp_number, image_url, location, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      body.name || '', body.description || '', body.category || '',
      body.phoneNumber || body.phone_number || '',
      body.whatsappNumber || body.whatsapp_number || '',
      body.imageUrl || body.image_url || '',
      body.location || '',
      body.isActive ?? body.is_active ?? 1,
      body.order ?? body.sort_order ?? 0,
    ]
  );

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM stores WHERE id = ?', [result.insertId]);
  return json(rows[0], 201);
}

export async function PUT(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return json({ error: 'ID is required' }, 400);

  const body = await request.json();

  await pool.query(
    'UPDATE stores SET name = ?, description = ?, category = ?, phone_number = ?, whatsapp_number = ?, image_url = ?, location = ?, is_active = ?, sort_order = ? WHERE id = ?',
    [
      body.name || '', body.description || '', body.category || '',
      body.phoneNumber || body.phone_number || '',
      body.whatsappNumber || body.whatsapp_number || '',
      body.imageUrl || body.image_url || '',
      body.location || '',
      body.isActive ?? body.is_active ?? 1,
      body.order ?? body.sort_order ?? 0,
      id,
    ]
  );

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM stores WHERE id = ?', [id]);
  return json(rows[0]);
}

export async function DELETE(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return json({ error: 'ID is required' }, 400);

  await pool.query('DELETE FROM stores WHERE id = ?', [id]);
  return json({ success: true, message: 'Store deleted' });
}
