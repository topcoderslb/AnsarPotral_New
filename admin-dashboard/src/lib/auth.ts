import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ansar_portal_secret_key_2024_change_in_production';

export interface JwtPayload {
  user_id: number;
  email: string;
  role: string;
  name: string;
  permissions?: Record<string, boolean> | null;
  iat: number;
  exp: number;
}

export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function authenticate(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get('authorization') || '';
  const match = authHeader.match(/Bearer\s+(.+)/);
  if (!match) return null;
  return verifyToken(match[1]);
}

export function requireAuth(request: NextRequest): JwtPayload {
  const user = authenticate(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export function requirePrimaryAdmin(request: NextRequest): JwtPayload {
  const user = requireAuth(request);
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return user;
}
