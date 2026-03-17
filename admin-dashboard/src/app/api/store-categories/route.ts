import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { json, OPTIONS as corsOptions } from '@/lib/cors';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function OPTIONS() { return corsOptions(); }

export async function GET() {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM store_categories ORDER BY sort_order ASC');
  return json(rows);
}

export async function POST(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const body = await request.json();

  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO store_categories (name, sort_order) VALUES (?, ?)',
    [body.name || '', body.order ?? 0]
  );

  return json({ id: result.insertId, name: body.name }, 201);
}

export async function DELETE(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return json({ error: 'ID required' }, 400);

  await pool.query('DELETE FROM store_categories WHERE id = ?', [id]);
  return json({ success: true });
}
