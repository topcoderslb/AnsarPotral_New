import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requirePrimaryAdmin } from '@/lib/auth';
import { json, OPTIONS as corsOptions } from '@/lib/cors';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function OPTIONS() { return corsOptions(); }

// GET - list all blocked devices (primary admin only)
export async function GET(request: NextRequest) {
  try { requirePrimaryAdmin(request); } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    return json({ error: msg === 'Forbidden' ? 'Only the primary admin can manage blocked devices' : 'Unauthorized' }, msg === 'Forbidden' ? 403 : 401);
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM blocked_devices ORDER BY blocked_at DESC'
  );
  return json(rows);
}

// POST - block a device (primary admin only)
export async function POST(request: NextRequest) {
  try { requirePrimaryAdmin(request); } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    return json({ error: msg === 'Forbidden' ? 'Only the primary admin can block devices' : 'Unauthorized' }, msg === 'Forbidden' ? 403 : 401);
  }

  const body = await request.json();
  const deviceId = (body.device_id || '').trim();
  const deviceName = (body.device_name || '').trim();
  const deviceModel = (body.device_model || '').trim();
  const osVersion = (body.os_version || '').trim();
  const ipAddress = (body.ip_address || '').trim();
  const reason = (body.reason || '').trim();

  if (!deviceId) {
    return json({ error: 'device_id is required' }, 400);
  }

  // Check if already blocked
  const [existing] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM blocked_devices WHERE device_id = ?', [deviceId]
  );
  if (existing.length > 0) {
    return json({ error: 'Device is already blocked' }, 409);
  }

  await pool.query<ResultSetHeader>(
    'INSERT INTO blocked_devices (device_id, device_name, device_model, os_version, ip_address, reason) VALUES (?, ?, ?, ?, ?, ?)',
    [deviceId, deviceName || null, deviceModel || null, osVersion || null, ipAddress || null, reason || null]
  );

  return json({ success: true }, 201);
}

// DELETE - unblock a device (primary admin only)
export async function DELETE(request: NextRequest) {
  try { requirePrimaryAdmin(request); } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    return json({ error: msg === 'Forbidden' ? 'Only the primary admin can unblock devices' : 'Unauthorized' }, msg === 'Forbidden' ? 403 : 401);
  }

  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('device_id');
  if (!deviceId) return json({ error: 'device_id required' }, 400);

  await pool.query('DELETE FROM blocked_devices WHERE device_id = ?', [deviceId]);
  return json({ success: true });
}
