import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { json, OPTIONS as corsOptions } from '@/lib/cors';
import { RowDataPacket } from 'mysql2';

export async function OPTIONS() { return corsOptions(); }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM complaints WHERE id = ?', [id]);
    if (rows.length === 0) return json({ error: 'Complaint not found' }, 404);
    return json(rows[0]);
  }

  const status = searchParams.get('status');
  let sql = 'SELECT * FROM complaints';
  const params: string[] = [];
  if (status && ['new', 'reviewed', 'resolved'].includes(status)) {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC';

  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return json(rows);
}

// POST - submit complaint (public - no auth required)
export async function POST(request: NextRequest) {
  const body = await request.json();

  const name = (body.name || '').trim();
  const phone = (body.phone || '').trim();
  const complaintText = (body.complaintText || body.complaint_text || '').trim();

  if (!name || !phone || !complaintText) {
    return json({ error: 'Name, phone, and complaint text are required' }, 400);
  }

  const [result] = await pool.query<import('mysql2').ResultSetHeader>(
    "INSERT INTO complaints (name, phone, complaint_text, image_url, status) VALUES (?, ?, ?, ?, 'new')",
    [name, phone, complaintText, body.imageUrl || body.image_url || null]
  );

  return json({ success: true, id: result.insertId }, 201);
}

export async function PUT(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return json({ error: 'ID required' }, 400);

  const body = await request.json();
  const status = body.status || null;
  const notes = body.notes ?? null;

  if (status && !['new', 'reviewed', 'resolved'].includes(status)) {
    return json({ error: 'Invalid status' }, 400);
  }

  const updates: string[] = [];
  const params: (string | null)[] = [];
  if (status) { updates.push('status = ?'); params.push(status); }
  if (notes !== null) { updates.push('notes = ?'); params.push(notes); }

  if (updates.length === 0) return json({ error: 'Nothing to update' }, 400);

  params.push(id);
  await pool.query(`UPDATE complaints SET ${updates.join(', ')} WHERE id = ?`, params);

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM complaints WHERE id = ?', [id]);
  return json(rows[0]);
}

export async function DELETE(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return json({ error: 'ID required' }, 400);

  await pool.query('DELETE FROM complaints WHERE id = ?', [id]);
  return json({ success: true });
}
