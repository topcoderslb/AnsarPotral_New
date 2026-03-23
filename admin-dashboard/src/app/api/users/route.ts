import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { json, OPTIONS as corsOptions } from '@/lib/cors';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

export async function OPTIONS() { return corsOptions(); }

function requireAdmin(request: NextRequest) {
  const user = requireAuth(request);
  if (user.role !== 'admin') throw new Error('Forbidden');
  return user;
}

// GET /api/users — list all sub-admins
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, email, phone, role, permissions, is_active, created_at
       FROM users WHERE role = 'sub_admin' ORDER BY created_at DESC`
    );
    const users = rows.map(u => ({
      ...u,
      permissions: u.permissions ? (() => { try { return JSON.parse(u.permissions); } catch { return null; } })() : null,
    }));
    return json(users);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error';
    if (msg === 'Unauthorized' || msg === 'Forbidden') return json({ error: msg }, 403);
    return json({ error: msg }, 500);
  }
}

// POST /api/users — create sub-admin
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
    const body = await request.json();
    const { name, email, phone, password, permissions, is_active } = body;

    if (!name || !email || !password) {
      return json({ error: 'Name, email and password are required' }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const permissionsJson = permissions ? JSON.stringify(permissions) : null;

    const [result] = await pool.query<RowDataPacket[]>(
      `INSERT INTO users (name, email, phone, password, role, permissions, is_active)
       VALUES (?, ?, ?, ?, 'sub_admin', ?, ?)`,
      [name.trim(), email.trim().toLowerCase(), phone || null, hashedPassword, permissionsJson, is_active !== false ? 1 : 0]
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertId = (result as any).insertId;
    return json({ success: true, id: insertId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error';
    if (msg === 'Unauthorized' || msg === 'Forbidden') return json({ error: msg }, 403);
    if (msg.includes('Duplicate entry')) return json({ error: 'هذا البريد الإلكتروني مستخدم مسبقاً' }, 400);
    return json({ error: msg }, 500);
  }
}

// PUT /api/users — update sub-admin
export async function PUT(request: NextRequest) {
  try {
    requireAdmin(request);
    const body = await request.json();
    const { id, name, email, phone, password, permissions, is_active } = body;

    if (!id) return json({ error: 'ID is required' }, 400);

    const permissionsJson = permissions ? JSON.stringify(permissions) : null;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET name=?, email=?, phone=?, password=?, permissions=?, is_active=?, updated_at=NOW()
         WHERE id=? AND role='sub_admin'`,
        [name.trim(), email.trim().toLowerCase(), phone || null, hashedPassword, permissionsJson, is_active ? 1 : 0, id]
      );
    } else {
      await pool.query(
        `UPDATE users SET name=?, email=?, phone=?, permissions=?, is_active=?, updated_at=NOW()
         WHERE id=? AND role='sub_admin'`,
        [name.trim(), email.trim().toLowerCase(), phone || null, permissionsJson, is_active ? 1 : 0, id]
      );
    }

    return json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error';
    if (msg === 'Unauthorized' || msg === 'Forbidden') return json({ error: msg }, 403);
    if (msg.includes('Duplicate entry')) return json({ error: 'هذا البريد الإلكتروني مستخدم مسبقاً' }, 400);
    return json({ error: msg }, 500);
  }
}

// DELETE /api/users?id=X — delete sub-admin
export async function DELETE(request: NextRequest) {
  try {
    requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return json({ error: 'ID is required' }, 400);

    await pool.query(`DELETE FROM users WHERE id=? AND role='sub_admin'`, [id]);
    return json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error';
    if (msg === 'Unauthorized' || msg === 'Forbidden') return json({ error: msg }, 403);
    return json({ error: msg }, 500);
  }
}
