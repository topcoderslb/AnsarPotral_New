import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { json, OPTIONS as corsOptions } from '@/lib/cors';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function OPTIONS() { return corsOptions(); }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active_only') || '0';
  let sql = 'SELECT * FROM news';
  if (activeOnly === '1') sql += ' WHERE is_active = 1';
  sql += ' ORDER BY published_at DESC, id DESC';

  const [rows] = await pool.query<RowDataPacket[]>(sql);
  return json(rows);
}

export async function POST(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const body = await request.json();

  if (!body.title || !body.content) {
    return json({ error: 'Title and content are required' }, 400);
  }

  const publishedAt = body.publishedAt || body.published_at || new Date().toISOString().slice(0, 19).replace('T', ' ');

  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO news (title, content, image_url, is_active, published_at) VALUES (?, ?, ?, ?, ?)',
    [body.title, body.content, body.imageUrl || body.image_url || null, body.isActive ?? 1, publishedAt]
  );

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM news WHERE id = ?', [result.insertId]);
  return json(rows[0], 201);
}

export async function PUT(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return json({ error: 'ID required' }, 400);

  const body = await request.json();
  const publishedAt = body.publishedAt || body.published_at || new Date().toISOString().slice(0, 19).replace('T', ' ');

  await pool.query(
    'UPDATE news SET title = ?, content = ?, image_url = ?, is_active = ?, published_at = ? WHERE id = ?',
    [body.title, body.content, body.imageUrl || body.image_url || null, body.isActive ?? 1, publishedAt, id]
  );

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM news WHERE id = ?', [id]);
  return json(rows[0]);
}

export async function DELETE(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return json({ error: 'ID required' }, 400);

  await pool.query('DELETE FROM news WHERE id = ?', [id]);
  return json({ success: true });
}
