import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { json, OPTIONS as corsOptions } from '@/lib/cors';
import { RowDataPacket } from 'mysql2';

export async function OPTIONS() { return corsOptions(); }

export async function GET(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }

  const [[stores]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM stores');
  const [[statements]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM statements');
  const [[landmarks]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM landmarks');
  const [[complaints]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM complaints');
  const [[newComplaints]] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM complaints WHERE status = 'new'");

  const [recentComplaints] = await pool.query<RowDataPacket[]>('SELECT * FROM complaints ORDER BY created_at DESC LIMIT 5');

  return json({
    storesCount: Number(stores.count),
    statementsCount: Number(statements.count),
    landmarksCount: Number(landmarks.count),
    complaintsCount: Number(complaints.count),
    newComplaints: Number(newComplaints.count),
    recentComplaints,
  });
}
