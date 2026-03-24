import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { generateToken, authenticate } from '@/lib/auth';
import { json, OPTIONS as corsOptions } from '@/lib/cors';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

export async function OPTIONS() { return corsOptions(); }

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'login';

  if (action === 'login') {
    const body = await request.json();
    const email = (body.email || '').trim();
    const password = body.password || '';

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, 400);
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? AND is_active = 1', [email]
    );

    if (rows.length === 0) {
      return json({ error: 'Invalid email or password' }, 401);
    }

    const user = rows[0];
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return json({ error: 'Invalid email or password' }, 401);
    }

    let permissions: Record<string, boolean> | null = null;
    if (user.permissions) {
      try { permissions = JSON.parse(user.permissions); } catch { /* keep null */ }
    }

    const token = generateToken({
      user_id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      permissions,
    });

    return json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions,
      },
    });
  }

  if (action === 'verify') {
    const user = authenticate(request);
    if (user) {
      return json({ success: true, user });
    } else {
      return json({ error: 'Invalid token' }, 401);
    }
  }

  return json({ error: 'Invalid action' }, 400);
}
