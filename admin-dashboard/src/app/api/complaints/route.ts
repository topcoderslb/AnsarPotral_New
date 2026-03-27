import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, requirePrimaryAdmin } from '@/lib/auth';
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
  const deviceId = (body.deviceId || body.device_id || '').trim();
  const deviceName = (body.deviceName || body.device_name || '').trim();
  const deviceModel = (body.deviceModel || body.device_model || '').trim();
  const osVersion = (body.osVersion || body.os_version || '').trim();

  // Capture IP address from request headers
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || '127.0.0.1';

  if (!name || !phone || !complaintText) {
    return json({ error: 'Name, phone, and complaint text are required' }, 400);
  }

  // Check if device is blocked
  if (deviceId) {
    const [blocked] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM blocked_devices WHERE device_id = ?', [deviceId]
    );
    if (blocked.length > 0) {
      return json({ error: 'blocked', message: 'Your access has been restricted due to inappropriate use.' }, 403);
    }
  }

  const [result] = await pool.query<import('mysql2').ResultSetHeader>(
    "INSERT INTO complaints (name, phone, complaint_text, image_url, device_id, device_name, device_model, os_version, ip_address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')",
    [name, phone, complaintText, body.imageUrl || body.image_url || null, deviceId || null, deviceName || null, deviceModel || null, osVersion || null, ipAddress]
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
  try { requirePrimaryAdmin(request); } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    return json({ error: msg === 'Forbidden' ? 'Only the primary admin can delete complaints' : 'Unauthorized' }, msg === 'Forbidden' ? 403 : 401);
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return json({ error: 'ID required' }, 400);

  await pool.query('DELETE FROM complaints WHERE id = ?', [id]);
  return json({ success: true });
}
