import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { json, OPTIONS as corsOptions } from '@/lib/cors';
import { RowDataPacket } from 'mysql2';

export async function OPTIONS() { return corsOptions(); }

export async function GET() {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT setting_key, setting_value FROM app_settings');
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.setting_key] = row.setting_value;
  }
  return json(settings);
}

export async function PUT(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const body = await request.json();

  for (const [key, value] of Object.entries(body)) {
    if (typeof key === 'string' && key.length <= 100) {
      const val = typeof value === 'string' ? value : JSON.stringify(value);
      await pool.query(
        'INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [key, val]
      );
    }
  }

  const [rows] = await pool.query<RowDataPacket[]>('SELECT setting_key, setting_value FROM app_settings');
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.setting_key] = row.setting_value;
  }
  return json({ success: true, settings });
}

export async function POST(request: NextRequest) {
  // Alias POST to PUT for settings (PHP did this too)
  return PUT(request);
}
